const loading = document.getElementById('loading');
const main = document.getElementById('main');
const bar = document.getElementById('bar');
const percent = document.getElementById('percent');
const app = document.getElementById('app');

let finished = false;
let finishScheduled = false;

function setProgress(p) {
  const v = Math.max(0, Math.min(100, Math.round(p)));
  bar.style.width = v + '%';
  percent.textContent = v + '%';
}

function finish() {
  if (finished) return;
  finished = true;
  setProgress(100);
  main.hidden = false;
  // 直接切换类名，CSS 过渡（0.5s/0.6s）负责动画，不依赖 rAF。
  app.classList.add('is-ready');
  loading.classList.add('is-done');
  setupReveal();
  if (['#about', '#dc', '#venus', '#mars', '#contact'].includes(location.hash)) {
    const target = document.getElementById(location.hash.slice(1));
    target?.scrollIntoView({ behavior: 'instant', block: 'start' });
    // The browser may process the fragment while the main content is still
    // hidden. Reapply it on the next frame once its final viewport height exists.
    requestAnimationFrame(() => target?.scrollIntoView({ behavior: 'instant', block: 'start' }));
  }
  window.dispatchEvent(new Event('site-ready'));
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

// The title font is local but can still arrive after first layout on a new
// device. Keep the loading screen up until it is ready, with a short ceiling
// so a slow connection never turns font loading into a blocked landing page.
function scheduleFinish() {
  if (finishScheduled) return;
  finishScheduled = true;

  const criticalFont = document.fonts?.load
    ? Promise.race([
        document.fonts.load('800 1em "Avant Garde"').catch(() => undefined),
        wait(300),
      ])
    : Promise.resolve();

  Promise.all([wait(300), criticalFont]).then(finish);
}

// Scroll-triggered 渐变动画（约 0.5s）：区块进入视口时淡入。
function setupReveal() {
  const support = 'IntersectionObserver' in window;
  const items = Array.from(document.querySelectorAll('.reveal'));
  const show = (el) => el.classList.add('is-visible');

  if (!support) {
    items.forEach(show);
  } else {
    // 一次性淡入：进入视口后保持显示
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            show(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    items.forEach((el) => io.observe(el));

    // 立刻把已经出现在视口内的区块显示出来，避免首屏意外空白。
    items.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) show(el);
    });
  }

  // 连续淡入/淡出 + 文字入场动画（覆盖所有 .reveal-fade 区块）
  setupScrollFade();
  setupEnter();
}

// 依据每个区块在视口中的位置，连续计算并设置整个区块的 opacity（进入淡进、离开淡出）。
function setupScrollFade() {
  const els = Array.from(document.querySelectorAll('.reveal-fade'));
  if (!els.length) return;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const smooth = (t) => t * t * (3 - 2 * t); // smoothstep，头尾更柔和

  const update = () => {
    const vh = window.innerHeight;
    const span = vh * 0.6; // 过渡带宽度：占视口高度比例

    els.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const enter = clamp((vh - rect.top) / span, 0, 1); // 顶部进入进度 0 -> 1
      const leave = clamp(rect.bottom / span, 0, 1);      // 底部离开进度 1 -> 0
      el.style.opacity = String(smooth(Math.min(enter, leave)));
    });
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

// 文字入场：区块进入视口时播放一次 1.2s 动画，离开后重置，以便下次进入重放。
function setupEnter() {
  const sections = Array.from(document.querySelectorAll('.reveal-fade'));
  if (!sections.length || !('IntersectionObserver' in window)) return;

  const states = new Map();
  sections.forEach((el) => states.set(el, false));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        const ratio = entry.intersectionRatio;
        // Long sections on phones cannot occupy 55% of their own total height
        // in the viewport. Base entry on the smaller of section and screen.
        const requiredHeight = Math.min(entry.boundingClientRect.height, window.innerHeight) * 0.55;
        if (entry.isIntersecting && entry.intersectionRect.height >= requiredHeight && !states.get(el)) {
          states.set(el, true);
          el.classList.add('enter');
        } else if ((!entry.isIntersecting || ratio <= 0.05) && states.get(el)) {
          states.set(el, false);
          el.classList.remove('enter');
        }
      });
    },
    { threshold: Array.from({ length: 21 }, (_,i) => i / 20) }
  );
  sections.forEach((el) => io.observe(el));
}

// ---------------------------------------------------------------------
// Real loading progress.
// The bar now reflects what the page actually loads instead of a fake
// eased timer. The base value comes from the browser's own lifecycle
// state, and real sub-resources (stylesheets, scripts, images, fonts)
// push it toward 100% as they finish. The welcome screen starts as soon as
// the DOM is ready, so below-the-fold assets cannot delay the LCP.
// ---------------------------------------------------------------------

const BASE = {
  loading: 10,      // HTML still being parsed
  interactive: 60,  // DOM parsed (DOMContentLoaded)
  complete: 100,    // all sub-resources done (window load)
};

// Count every resource the browser has loaded for this page.
function resourceStats() {
  const entries = performance.getEntriesByType('resource') || [];
  const total = entries.length;
  const loaded = entries.filter((e) => e.responseEnd > 0).length;
  return { total, loaded };
}

function refresh() {
  const base = BASE[document.readyState] ?? BASE.loading;
  const { total, loaded } = resourceStats();
  const fraction = total > 0 ? loaded / total : 0;
  // Resources carry the indicator forward until the welcome transition begins.
  setProgress(base + fraction * (100 - base) * 0.9);
}

// Keep counting resources that finish after this script runs (images,
// fonts, anything fetched later), and update the bar as they arrive.
try {
  const observer = new PerformanceObserver(() => refresh());
  observer.observe({ type: 'resource', buffered: true });
} catch (e) { /* PerformanceObserver unsupported: fall back to lifecycle */ }

document.addEventListener('DOMContentLoaded', () => {
  refresh();
  // Start once markup and the critical title font are ready. Images and other
  // non-critical resources continue downloading in the background.
  scheduleFinish();
});

window.addEventListener('load', refresh);

// If the DOM was already parsed when this runs (very fast/local case),
// start the transition immediately.
if (document.readyState !== 'loading') {
  refresh();
  scheduleFinish();
}

// Public hook: report in later from async work (data fetches, media).
window.siteLoader = { setProgress, finish };

// Directory URLs are canonical on the website; file previews need an HTML file.
if (location.protocol === 'file:') {
  document.getElementById('go-terminal').href = './delocalized%20configuration%20project/index.html';
  document.getElementById('go-venus').href = './venus/index.html';
  document.getElementById('go-mars').href = './mars/index.html';
}

// DC 是一个独立页面。点击入口时先显示极短的传输过渡，避免页面直接切换；
// 修饰键/非主键点击保留浏览器原生的新标签页和菜单行为。
const projectLinks = document.querySelectorAll('#go-terminal, #go-venus, #go-mars');
const dcPageTransition = document.getElementById('dc-page-transition');
if (projectLinks.length && dcPageTransition) {
  let dcNavigationPending = false;

  projectLinks.forEach((projectLink) => projectLink.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    if (dcNavigationPending) return;

    dcNavigationPending = true;
    dcPageTransition.querySelector('p').textContent = projectLink.dataset.transitionLabel || 'DC // ESTABLISHING LINK';
    // Commit the overlay's initial frame before beginning composited motion.
    // This prevents the first paint from being skipped under a busy first load.
    dcPageTransition.classList.add('is-mounted');
    document.documentElement.classList.add('dc-navigation-active');
    window.dispatchEvent(new Event('site-navigation'));

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        dcPageTransition.classList.add('is-active');
        window.setTimeout(() => {
          window.location.assign(projectLink.href);
        }, 1000);
      });
    });
  }));

  // 恢复前进/后退缓存页面时确保遮罩不会残留。
  window.addEventListener('pageshow', () => {
    dcNavigationPending = false;
    dcPageTransition.classList.remove('is-mounted');
    dcPageTransition.classList.remove('is-active');
    document.documentElement.classList.remove('dc-navigation-active');
    window.dispatchEvent(new Event('site-navigation'));
  });
}

// 邮箱地址在页面加载后再还原，避免 Cloudflare 邮箱混淆功能额外注入脚本。
document.querySelectorAll('.contact-circle[data-email]').forEach((link) => {
  const hex = link.dataset.email || '';
  const address = hex.replace(/../g, (pair) => String.fromCharCode(parseInt(pair, 16)));
  if (address) link.href = `mailto:${address}`;
});

// 占位的联系按钮（href="#"）点击时不跳回顶部；替换 href 后即为可用链接
document.addEventListener('click', (e) => {
  const placeholder = e.target.closest('.contact-circle[data-pending]');
  if (placeholder) e.preventDefault();
});
