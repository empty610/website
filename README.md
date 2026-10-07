# empty610.com

静态个人网站。主页保留 DC 系统作品，并在“项目”区统一展示 Solar Lab，跳转到 [solar.empty610.com](https://solar.empty610.com/)。公共音频、字体与 Three.js 文件集中在 `shared/`。无需安装依赖即可部署整个目录。

| 路径 | 内容 |
| --- | --- |
| `index.html`、`home/` | 个人主页、脚本、图片与可编辑的 CSS 源文件 |
| `delocalized configuration project/` | DC 启动面、仪表盘及地球贴图 |
| `home/solar-entry.css` | Solar Lab 项目入口的文字与留白布局 |
| `_redirects` | 将旧金星、火星页面网址转到 Solar Lab 对应档案 |
| `venus/`、`mars/` | 原页面素材存档，主页已合并为 Solar Lab 入口 |
| `shared/` | 多页面共用的音乐、字体、按钮行为和 Three.js 文件 |
| `scripts/` | 主页样式合并与本地引用检查 |

主页样式请修改 `home/style.css`、`home/solar-entry.css` 或 `home/navigation.css`，再运行 `node scripts/build-home-css.cjs`（也可用 Bun 运行）。`home/home.css` 是页面实际加载的合并产物，不建议直接编辑。

“项目”导航定位到 `#projects`；旧的 `#venus`、`#mars` 主页片段仍会定位到合并后的入口。Solar Lab 入口沿用 Venus 的暖黑金色模板，右侧留白，底部说明保留独立布局空间，宽屏或横屏下不会挤出入口按钮。点击入口时播放金色双轨道连接动画，约 1 秒后直接进入 `/terminal/`。主页不加载地球模型；DC 页面继续使用 `delocalized configuration project/earth-model.js` 渲染地球。

提交前运行 `node scripts/check-local-links.cjs` 检查 HTML/CSS 的本地引用。请通过本地 HTTP 服务预览整个目录；直接打开 `file://` 时，浏览器可能限制 ES modules 和三维预览。线上部署须发布整个目录，保留现有路径以及根目录的 `_headers` 文件。

`shared/vendor/three/examples/jsm/controls/OrbitControls.global.js` 是运行时加载的版本。原来的 `OrbitControls.js` 源副本未被网页引用，已移除。火星探测器的路线图片由 ID 动态拼接文件名，必须保留。
