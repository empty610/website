# empty610.com

静态多页面网站。主页、DC、金星和火星各自保留页面入口；公共音频、字体与 Three.js 文件集中在 `shared/`。无需安装依赖即可部署整个目录。

| 路径 | 内容 |
| --- | --- |
| `index.html`、`home/` | 个人主页、脚本、图片与可编辑的 CSS 源文件 |
| `delocalized configuration project/` | DC 启动面、仪表盘及地球贴图 |
| `venus/` | 金星页面、模型、图片及脚本 |
| `mars/` | 火星页面、探测器资料、图片、脚本及本项目的 Three.js 版本 |
| `shared/` | 多页面共用的音乐、字体、按钮行为和 Three.js 文件 |
| `scripts/` | 主页样式合并与本地引用检查 |

主页样式请修改 `home/style.css`、`home/venus-entry.css`、`home/mars-entry.css` 或 `home/navigation.css`，再运行 `node scripts/build-home-css.cjs`（也可用 Bun 运行）。`home/home.css` 是页面实际加载的合并产物，不建议直接编辑。其他子项目的样式在对应目录中修改即可。

提交前运行 `node scripts/check-local-links.cjs` 检查 HTML/CSS 的本地引用。请通过本地 HTTP 服务预览整个目录；直接打开 `file://` 时，浏览器可能限制 ES modules 和三维预览。线上部署须发布整个目录，保留现有路径以及根目录的 `_headers` 文件。

`shared/vendor/three/examples/jsm/controls/OrbitControls.global.js` 是运行时加载的版本。原来的 `OrbitControls.js` 源副本未被网页引用，已移除。火星探测器的路线图片由 ID 动态拼接文件名，必须保留。
