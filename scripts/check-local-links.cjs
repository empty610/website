const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const failures = [];
let checked = 0;

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (/\.(html|css)$/i.test(entry.name)) checkFile(absolute);
  }
}

function checkReference(file, reference) {
  if (!reference || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(reference)) return;
  const pathname = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
  if (!pathname || pathname.startsWith('#')) return;
  let target = path.resolve(pathname.startsWith('/') ? root : path.dirname(file), pathname.replace(/^\//, ''));
  if (pathname.endsWith('/')) target = path.join(target, 'index.html');
  if (!fs.existsSync(target)) failures.push(`${path.relative(root, file)} → ${reference}`);
  else checked += 1;
}

function checkFile(file) {
  const source = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.html')) {
    for (const match of source.matchAll(/\b(?:src|href|data-image-full)=["']([^"']*)["']/g)) {
      checkReference(file, match[1]);
    }
  } else {
    for (const match of source.matchAll(/url\(\s*(?:["']?)([^"')]+)(?:["']?)\s*\)/g)) {
      checkReference(file, match[1].trim());
    }
  }
}

walk(root);
if (failures.length) {
  console.error(`缺失 ${failures.length} 个本地引用:\n${failures.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`本地 HTML/CSS 引用检查通过：${checked} 处。`);
}
