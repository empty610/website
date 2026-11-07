# empty610.com

静态个人网站。主页保留 DC 系统作品，并在“项目”区统一展示 Solar Lab，跳转到 [solar.empty610.com](https://solar.empty610.com/)。公共音频、字体与 Three.js 文件集中在 `shared/`。无需安装依赖即可部署整个目录。

| 路径 | 内容 |
| --- | --- |
| `index.html`、`home/` | 个人主页、脚本、图片与可编辑的 CSS 源文件 |
| `delocalized configuration project/` | DC 启动面、仪表盘及地球贴图 |
| `home/solar-entry.css` | Solar Lab 项目入口的文字与留白布局 |
| `_redirects` | 将旧金星、火星页面网址转到 Solar Lab 对应档案 |
| `shared/` | 多页面共用的音乐、字体、按钮行为和 Three.js 文件 |
| `scripts/` | 主页样式合并与本地引用检查 |

主页样式请修改 `home/style.css`、`home/solar-entry.css` 或 `home/navigation.css`，再运行 `node scripts/build-home-css.cjs`（也可用 Bun 运行）。`home/home.css` 是页面实际加载的合并产物，不建议直接编辑。

“项目”导航定位到 `#projects`；旧的 `#venus`、`#mars` 主页片段仍会定位到合并后的入口。Solar Lab 入口沿用 Venus 的暖黑金色模板，右侧留白，底部说明保留独立布局空间，宽屏或横屏下不会挤出入口按钮。点击入口时播放金色双轨道连接动画，约 1 秒后直接进入 `/terminal/`。主页不加载地球模型；DC 页面继续使用 `delocalized configuration project/earth-model.js` 渲染地球。

提交前运行 `node scripts/check-local-links.cjs` 检查 HTML/CSS 的本地引用。请通过本地 HTTP 服务预览整个目录；直接打开 `file://` 时，浏览器可能限制 ES modules 和三维预览。线上部署须发布整个目录，保留现有路径以及根目录的 `_headers` 文件。

开发验证使用 Node.js 24：先运行 `npm ci` 和 `npx playwright install chromium`，再运行 `npm run build:css`、`npm run check`、`npm test`。检查涵盖 CSS 产物一致性、自有脚本语法、HTML/CSS/JS 引用、动态资源，以及主页导航、太阳系入场、DC 启动与失败重试、键盘和减少动态效果。浏览器测试遇到未预期的资源失败或未处理异常会失败；`.github/workflows/site-checks.yml` 在推送与 PR 时运行这些检查。`npm run preview` 提供只监听本机的预览服务；部署不需要安装测试依赖。

DC 启动前会确认三维脚本、地球模块和贴图已加载。失败时留在启动页并显示重试按钮；浏览器不支持 WebGL 时也会保留返回入口。系统选择“减少动态效果”时，主页内容取消移动入场，DC 默认暂停，可用速度按钮主动开启运转。航天器卡片支持 Tab 聚焦及 Enter / Space 激活。

`shared/vendor/three/examples/jsm/controls/OrbitControls.global.js` 是运行时加载的版本。原来的 `OrbitControls.js` 源副本未被网页引用，已移除。

旧 `venus/`、`mars/` 页面及其专属素材、两套旧主页预览脚本/样式和未引用的五张行星 PNG 已移除。当前太阳系插画由 SVG 绘制；主页、DC、音频、字体、Three.js 和地球贴图继续使用各自现有资源。`_redirects` 保留旧金星、火星页面网址到 Solar Lab 的跳转，历史主页片段 `#venus`、`#mars` 继续定位到项目入口。
