import { createServer } from 'vite';
import { renderToString } from '@vue/server-renderer';
import { createSSRApp } from 'vue';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

// Render the same RouterView used in the browser into static route documents.
// A single source index.html serves development; hosting needs no SSR backend.
const pages = [
  ['index.html', '/', 'Home'],
  ['venus/index.html', '/venus/', 'Venus'],
  ['mars/index.html', '/mars/', 'Mars'],
  ['delocalized configuration project/index.html', '/delocalized%20configuration%20project/', 'Terminal'],
];
process.env.NODE_ENV = 'production';
const manifest = JSON.parse(await readFile('dist/.vite/manifest.json', 'utf8'));
const assetPaths = Object.entries(manifest)
  .filter(([path]) => path.startsWith('src/assets/'))
  .map(([path, { file }]) => [`/${path}`, `/${file}`]);
const source = await readFile('dist/index.html', 'utf8');
const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
function stylesFor(key, found = new Set()) {
  const entry = manifest[key];
  if (!entry) throw new Error(`Missing route in Vite manifest: ${key}`);
  for (const file of entry.css ?? []) found.add(file);
  for (const dependency of entry.imports ?? []) stylesFor(dependency, found);
  return found;
}
try {
  const { default: App } = await server.ssrLoadModule('/src/App.vue');
  const { createSiteRouter } = await server.ssrLoadModule('/src/router/index.js');
  const { pages: metadata, site, canonicalUrl, renderSeoHead } = await server.ssrLoadModule('/src/seo.js');
  for (const [html, path, view] of pages) {
    const router = createSiteRouter({ server: true });
    const app = createSSRApp(App).use(router);
    await router.push(path);
    await router.isReady();
    let markup = await renderToString(app);
    for (const [original, built] of assetPaths) markup = markup.replaceAll(original, built);
    if (markup.includes('/src/assets/')) throw new Error(`Unresolved source asset: ${html}`);
    const marker = '<div id="website-app"></div>';
    if (!source.includes(marker)) throw new Error('Missing Vue mount point');
    const route = router.currentRoute.value;
    let document = source
      .replace(marker, () => `<div id="website-app">${markup}</div>`)
      .replace(/<title>.*?<\/title>/, `<title>${route.meta.title}</title>`)
      .replace('<!--seo-head-->', () => renderSeoHead(route.meta))
      .replaceAll('data-page="home"', `data-page="${route.name}"`);
    for (const [original, built] of assetPaths) document = document.replaceAll(original, built);
    const links = [...stylesFor(`src/views/${view}.vue`)]
      .filter(file => !source.includes(`href="/${file}"`))
      .map(file => `<link rel="stylesheet" href="/${file}">`).join('\n');
    document = document.replace('</head>', `${links}\n</head>`);
    const file = `dist/${html}`;
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, document);
    console.log(`Prerendered ${html}`);
  }
  const urls = Object.values(metadata).map(page => `  <url><loc>${canonicalUrl(page)}</loc></url>`).join('\n');
  await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${site.url}sitemap.xml\n`);
} finally {
  await server.close();
}
