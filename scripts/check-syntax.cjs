const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const ignored = new Set(['.git', 'node_modules', 'vendor', 'test-results', 'playwright-report']);
let checked = 0;
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory() && !ignored.has(entry.name)) walk(file);
    else if (entry.isFile() && /\.(?:[cm]?js)$/.test(entry.name)) {
      const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
      if (result.status !== 0) {
        console.error(path.relative(root, file), result.stderr || result.error);
        process.exit(1);
      }
      checked += 1;
    }
  }
}
walk(root);
console.log(`自有 JavaScript 语法检查通过：${checked} 个文件。`);
