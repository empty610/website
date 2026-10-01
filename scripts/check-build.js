import { readdir, readFile, access } from 'node:fs/promises';
import { resolve, dirname, extname } from 'node:path';

const root = resolve('dist');
const failures = [];
let checked = 0;
const canonicals = new Set();
const titles = new Set();
const descriptions = new Set();

async function verifySeo(html, file) {
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  const metas = [...html.matchAll(/<meta\b[^>]*>/g)].map(([tag]) => ({
    key: tag.match(/(?:name|property)="([^"]+)"/)?.[1],
    value: tag.match(/content="([^"]*)"/)?.[1],
  }));
  const meta = key => metas.filter(item => item.key === key);
  const description = meta('description');
  const canonical = [...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/g)].map(match => match[1]);
  if (!title || titles.has(title)) failures.push(`${file}: missing or duplicate page title`);
  if (description.length !== 1 || !description[0].value || descriptions.has(description[0].value)) failures.push(`${file}: missing or duplicate description`);
  if (canonical.length !== 1 || !canonical[0].startsWith('https://') || canonicals.has(canonical[0])) failures.push(`${file}: missing or duplicate canonical URL`);
  if ([...html.matchAll(/<h1\b/g)].length !== 1) failures.push(`${file}: expected one main heading`);
  titles.add(title);
  descriptions.add(description[0]?.value);
  canonicals.add(canonical[0]);
  for (const [key, expected] of [['og:title', title], ['og:description', description[0]?.value], ['og:url', canonical[0]], ['twitter:card', 'summary_large_image']]) {
    const values = meta(key);
    if (values.length !== 1 || values[0].value !== expected) failures.push(`${file}: inconsistent ${key}`);
  }
  const image = meta('og:image')[0]?.value;
  if (!image?.startsWith('https://') || meta('twitter:image')[0]?.value !== image) failures.push(`${file}: missing or inconsistent share image`);
  else await verify(new URL(image).pathname, file);
  if (meta('robots').length !== 1 || !meta('robots')[0].value.startsWith('index,follow')) failures.push(`${file}: unexpected indexing policy`);
  const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)];
  try {
    if (schemas.length !== 1) throw new Error('expected one JSON-LD block');
    const graph = JSON.parse(schemas[0][1])['@graph'];
    if (graph.find(item => item['@type'] === 'WebPage')?.url !== canonical[0] || graph.find(item => item['@type'] === 'Person')?.name !== 'empty610') throw new Error('inconsistent page or author');
  } catch (error) { failures.push(`${file}: invalid structured data: ${error.message}`); }
  if (html.includes('/src/assets/') || html.includes('<!--seo-head-->')) failures.push(`${file}: unresolved source or metadata`);
}

async function verify(reference, file) {
  if (!reference || /^(?:[a-z]+:|\/\/|#)/i.test(reference)) return;
  const pathname = decodeURIComponent(reference.split(/[?#]/)[0]);
  let target = resolve(pathname.startsWith('/') ? root : dirname(file), '.' + (pathname.startsWith('/') ? pathname : '/' + pathname));
  if (!target.startsWith(root + '/') && target !== root) {
    failures.push(`${file}: reference escapes dist: ${reference}`);
    return;
  }
  if (pathname.endsWith('/') || target === root) target = resolve(target, 'index.html');
  try { await access(target); checked++; }
  catch { failures.push(`${file}: missing ${reference}`); }
}

async function walk(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const file = resolve(directory, item.name);
    if (item.isDirectory()) { await walk(file); continue; }
    const extension = extname(file);
    if (!['.html', '.css'].includes(extension)) continue;
    const text = await readFile(file, 'utf8');
    const pattern = extension === '.html'
      ? /(?:src|href|data-image-full)="([^"]+)"/g
      : /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/g;
    for (const match of text.matchAll(pattern)) await verify(match[1] ?? match[2] ?? match[3], file);
    if (text.includes('@include')) failures.push(`${file}: unresolved HTML include`);
    if (extension === '.html' && !text.includes('Content-Security-Policy')) failures.push(`${file}: production CSP missing`);
    if (extension === '.html') {
      await verifySeo(text, file);
      const ids = [...text.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
      if (new Set(ids).size !== ids.length) failures.push(`${file}: duplicate HTML IDs`);
      if ((!text.includes('<h1') && !ids.includes('main-ui')) || !ids.includes('website-app') || !ids.includes('music-toggle')) {
        failures.push(`${file}: missing prerendered content or shared controls`);
      }
      if (!text.includes('name="author" content="empty610"')) failures.push(`${file}: missing author attribution`);
    }
  }
}

const manifest = JSON.parse(await readFile(resolve(root, '.vite/manifest.json'), 'utf8'));
for (const entry of Object.values(manifest)) {
  for (const file of [entry.file, ...(entry.css ?? []), ...(entry.assets ?? [])]) {
    await verify('/' + file, resolve(root, 'index.html'));
  }
}
await walk(root);
const sitemap = await readFile(resolve(root, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
if (urls.length !== canonicals.size || new Set(urls).size !== urls.length || urls.some(url => !canonicals.has(url))) failures.push('Sitemap URLs do not match canonical pages');
const robots = await readFile(resolve(root, 'robots.txt'), 'utf8');
if (!robots.includes('Allow: /') || !robots.includes(`Sitemap: ${new URL('/sitemap.xml', urls[0]).href}`)) failures.push('robots.txt does not expose the sitemap');
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else console.log(`Build integrity passed: ${checked} local resource/link references; ${canonicals.size} pages pass SEO, sitemap and CSP checks.`);
