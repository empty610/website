const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const failures = [];
let checked = 0;
const scannedScripts = new Set();
const ignored = new Set(['.git', 'node_modules', 'vendor', 'tests', 'scripts', 'test-results', 'playwright-report']);

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory() && !ignored.has(entry.name)) walk(absolute);
    else if (entry.isFile() && /\.(html|css)$/i.test(entry.name)) checkFile(absolute);
  }
}

function checkReference(file, reference) {
  if (!reference || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(reference)) return;
  const pathname = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
  if (!pathname || pathname.startsWith('#')) return;
  let target = path.resolve(pathname.startsWith('/') ? root : path.dirname(file), pathname.replace(/^\//, ''));
  if (pathname.endsWith('/')) target = path.join(target, 'index.html');
  if (!fs.existsSync(target)) failures.push(`${path.relative(root, file)} → ${reference}`);
  else {
    checked += 1;
    if (/\.m?js$/i.test(target) && !target.split(path.sep).includes('vendor') && !scannedScripts.has(target)) {
      scannedScripts.add(target);
      checkFile(target);
    }
  }
}

function checkFile(file) {
  const source = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.html')) {
    for (const match of source.matchAll(/\b(?:src|href|data-image-full)=["']([^"']*)["']/g)) {
      checkReference(file, match[1]);
    }
  } else if (file.endsWith('.css')) {
    for (const match of source.matchAll(/url\(\s*(?:["']?)([^"')]+)(?:["']?)\s*\)/g)) {
      checkReference(file, match[1].trim());
    }
  } else {
    // Literal dynamic scripts and ES modules; computed URLs are covered by
    // runtime-assets.json and the browser tests' failed-request checks.
    for (const match of source.matchAll(/(?:\b(?:loadScript|import)\s*\(\s*|\bfrom\s*)(['"])([^'"\r\n]+)\1/g)) {
      if (/^(?:\.{0,2}\/|https?:)/.test(match[2])) checkReference(file, match[2]);
    }
  }
}

walk(root);
for (const entry of require('./runtime-assets.json')) {
  for (const reference of entry.references) checkReference(path.join(root, entry.from), reference);
}
if (failures.length) {
  console.error(`缺失 ${failures.length} 个本地引用:\n${failures.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`本地 HTML/CSS/JS 与运行时资源检查通过：${checked} 处。`);
}
