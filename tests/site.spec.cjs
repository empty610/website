const { test: base, expect } = require('@playwright/test');
const test = base.extend({
  allowedFailures: ['', { option: true }],
  runtimeChecks: [async ({ page, allowedFailures }, use) => {
    const failures = [];
    const allowed = url => Boolean(allowedFailures) && new RegExp(allowedFailures).test(url);
    page.on('pageerror', error => failures.push(error.message));
    page.on('response', response => {
      if (response.status() >= 400 && !allowed(response.url())) failures.push(`${response.status()} ${response.url()}`);
    });
    page.on('requestfailed', request => {
      if (!allowed(request.url())) failures.push(`${request.failure()?.errorText} ${request.url()}`);
    });
    await use();
    expect(failures, 'No unexpected network failures or unhandled exceptions').toEqual([]);
  }, { auto: true }]
});
const terminal = '/delocalized%20configuration%20project/';
async function startTerminal(page) {
  await page.goto(terminal);
  await page.getByRole('button', { name: 'INITIATE SYSTEM', exact: true }).click();
}
async function expectReady(page) {
  // Asset preparation allows 15s, followed by the existing 2.6s transition.
  await expect(page.locator('body')).toHaveAttribute('data-boot-state', 'ready', { timeout: 20000 });
  await expect(page.locator('#sceneWrapper')).toHaveClass(/is-model-ready/);
  await expect(page.locator('#three-canvas canvas')).toBeVisible();
  await expect(page.locator('#boot')).toBeHidden();
}

test('homepage navigation and metadata, with 3D assets deferred', async ({ page }) => {
  const modelRequests = [];
  page.on('request', request => { if (/three\.min\.js|earth_atmos/.test(request.url())) modelRequests.push(request.url()); });
  await page.goto('/');
  await expect(page.locator('#app')).toHaveClass(/is-ready/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://empty610.com/');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Solar Lab/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /avatar-560\.webp$/);
  await page.mouse.move(1200, 20);
  await page.locator('#site-nav-toggle').click();
  await page.locator('#site-navigation a[href="#projects"]').click();
  await expect(page).toHaveURL(/#projects$/);
  await expect(page.locator('#site-navigation')).not.toBeVisible();
  expect(modelRequests).toEqual([]);
});

test('original solar entry fades in with staggered orbit drawing and replays', async ({ page }) => {
  await page.goto('/#projects');
  const section = page.locator('#projects');
  const stage = page.locator('#solar-orbital-art');
  const orbits = page.locator('.solar-orbit');
  const planet = page.locator('.solar-planet').first();
  await expect(section).toHaveClass(/enter/);
  await expect(stage).toHaveCSS('animation-name', 'solar-atlas-in');
  await expect(stage).toHaveCSS('animation-duration', '1.5s');
  await expect(orbits.first()).toHaveCSS('transition-duration', '1.8s');
  await expect(orbits.last()).toHaveCSS('transition-delay', '0.385s');
  await expect(orbits.last()).toHaveCSS('stroke-dashoffset', /^0(?:px)?$/);
  await expect(page.locator('.solar-annotations')).toHaveCSS('opacity', '1');
  const position = await planet.getAttribute('transform');
  await expect.poll(() => planet.getAttribute('transform')).not.toBe(position);
  await page.evaluate(() => document.getElementById('projects').classList.remove('enter'));
  await expect(orbits.last()).toHaveCSS('stroke-dashoffset', /^1(?:px)?$/);
  await expect(stage).toHaveCSS('opacity', '0');
  await page.evaluate(() => document.getElementById('projects').classList.add('enter'));
  await expect(stage).toHaveCSS('opacity', '1');
  await expect(orbits.last()).toHaveCSS('stroke-dashoffset', /^0(?:px)?$/);
  await expect(page.locator('.solar-annotations')).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(stage).toHaveCSS('animation-name', 'none');
  await expect(orbits.last()).toHaveCSS('stroke-dashoffset', /^0(?:px)?$/);
  await expect(orbits.last()).toHaveCSS('transition-duration', '0s');
  const frozen = await planet.getAttribute('transform');
  await page.waitForTimeout(150);
  expect(await planet.getAttribute('transform')).toBe(frozen);
});

test('solar orbit drawing resets immediately on exit and survives rapid re-entry', async ({ page }) => {
  await page.goto('/#projects');
  const section = page.locator('#projects');
  const orbits = page.locator('.solar-orbit');
  await expect(orbits.last()).toHaveCSS('stroke-dashoffset', /^0(?:px)?$/);
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.locator('#dc').evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await expect(section).not.toHaveClass(/enter/);
    const reset = await orbits.evaluateAll(nodes => nodes.map(node => parseFloat(getComputedStyle(node).strokeDashoffset)));
    expect(reset, 'all eight tracks reset on exit ' + attempt).toEqual(Array(8).fill(1));
    await section.evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await expect(section).toHaveClass(/enter/);
    const drawing = await page.evaluate(async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
      return { offsets: [...document.querySelectorAll('.solar-orbit')].map(node => parseFloat(getComputedStyle(node).strokeDashoffset)),
        opacity: Number(getComputedStyle(document.querySelector('.solar-preview-stage')).opacity) };
    });
    expect(drawing.offsets[0], 'a fresh draw is in progress ' + attempt).toBeGreaterThan(0);
    expect(drawing.offsets[0]).toBeLessThan(1);
    expect(drawing.offsets[7]).toBeGreaterThan(drawing.offsets[0]);
    expect(drawing.opacity).toBeGreaterThan(0);
    // Leave during the next draw, not just after an already settled intro.
    expect(await orbits.first().evaluate(node => parseFloat(getComputedStyle(node).strokeDashoffset))).toBeLessThan(1);
  }
  await expect(orbits.last()).toHaveCSS('stroke-dashoffset', /^0(?:px)?$/);
});

test('solar annotation layers stay clear of planets, text and chart edges', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [name, width, height] of [['desktop', 1366, 900], ['wide', 1920, 800], ['ultrawide', 2560, 800], ['mobile', 390, 844], ['landscape', 844, 390]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/#projects');
    await expect(page.locator('.solar-annotations')).toHaveCSS('opacity', '1');
    await page.locator('#solar-orbital-art').scrollIntoViewIfNeeded();
    await page.locator('#solar-orbital-art').screenshot({ path: `test-results/solar-labels-${name}.png` });
    for (const phase of [0, 45, 90, 135, 180, 225, 270, 315]) {
      await page.evaluate(phase => {
        for (const node of document.querySelectorAll('.solar-planet')) {
          node.dataset.originalAngle ||= node.dataset.angle;
          node.dataset.angle = Number(node.dataset.originalAngle) + phase;
        }
        document.getElementById('projects').classList.remove('enter');
      }, phase);
      await page.evaluate(() => document.getElementById('projects').classList.add('enter'));
      const conflicts = await page.evaluate(() => {
        const svg = document.querySelector('.solar-orrery');
        const canvas = svg.getBoundingClientRect();
        const scale = Math.hypot(svg.getScreenCTM().a, svg.getScreenCTM().b);
        const texts = [...svg.querySelectorAll('.solar-planet-label')];
        const leaders = [...svg.querySelectorAll('.solar-annotation-leaders .solar-leader')];
        const boxes = texts.map(node => node.getBoundingClientRect());
        const bodies = [...svg.querySelectorAll('.solar-planet')].map(node => ({
          point: new DOMPoint().matrixTransform(node.getScreenCTM()),
          radius: (node.querySelector('#solar-ring-light') ? 30 : Number(node.dataset.size)) * scale,
        }));
        const issues = [];
        boxes.forEach((box, i) => {
          const end = Number(leaders[i].getAttribute('d').match(/H ([-\d.]+)$/)[1]);
          const span = Math.abs(end) - Math.abs(Number(texts[i].getAttribute('x')));
          if (Math.abs(span - texts[i].getBBox().width) > .5) issues.push('unmeasured text ' + i);
          if (box.left < canvas.left || box.right > canvas.right || box.top < canvas.top || box.bottom > canvas.bottom) issues.push('edge ' + i);
          for (const body of bodies) {
            const dx = body.point.x - Math.max(box.left, Math.min(box.right, body.point.x));
            const dy = body.point.y - Math.max(box.top, Math.min(box.bottom, body.point.y));
            if (Math.hypot(dx, dy) < body.radius) issues.push('planet ' + i);
          }
          for (let j = i + 1; j < boxes.length; j++) {
            const other = boxes[j];
            if (box.left < other.right && box.right > other.left && box.top < other.bottom && box.bottom > other.top) issues.push('label ' + i + '/' + j);
          }
        });
        return issues;
      });
      expect(conflicts, `${name}, phase ${phase}`).toEqual([]);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    const headingGap = await page.evaluate(() => document.querySelector('.solar-map-heading').getBoundingClientRect().top
      - document.querySelector('.solar-preview-top').getBoundingClientRect().bottom);
    expect(headingGap, name + ' chart heading clears page header').toBeGreaterThanOrEqual(8);
  }
});

test('DC opens from the project link and cards work with Enter and Space', async ({ page }) => {
  await page.goto('/#dc');
  await page.getByRole('link', { name: 'GO TERMINAL', exact: true }).click();
  await expect(page).toHaveURL(/delocalized(?:%20| )configuration(?:%20| )project\/$/);
  await page.getByRole('button', { name: 'INITIATE SYSTEM', exact: true }).click();
  await expectReady(page);
  const d1 = page.getByRole('button', { name: '查看 D1 航天器', exact: true });
  await d1.focus();
  await page.keyboard.press('Enter');
  await expect(d1).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.orbit-tab[data-target="D1"]')).toHaveAttribute('aria-pressed', 'true');
  const d2 = page.getByRole('button', { name: '查看 D2 航天器', exact: true });
  await d2.focus();
  await page.keyboard.press('Space');
  await expect(d2).toHaveAttribute('aria-pressed', 'true');
  await expect(d1).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.orbit-panel[data-panel="D2"]')).toBeVisible();
});

test('reduced motion keeps mobile content visible and DC stationary until requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#dc');
  await expect(page.locator('.hero-title')).toHaveCSS('opacity', '1');
  await expect(page.locator('.hero-title')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('#dc .deloc')).toHaveCSS('opacity', '1');
  await expect(page.locator('#dc .enter-btn')).toHaveCSS('opacity', '1');
  await expect(page.locator('.solar-planets')).toHaveCSS('opacity', '1');
  await expect(page.locator('.solar-annotations')).toHaveCSS('opacity', '1');
  await expect(page.locator('.solar-annotation-leaders')).toHaveCSS('opacity', '1');
  expect(await page.locator('.solar-orbit').evaluateAll(nodes => nodes.every(node => Number(node.style.strokeDashoffset) === 0))).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await startTerminal(page);
  await expectReady(page);
  await expect(page.locator('.b-emblem')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.speed-btn[data-speed="0"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.orbit-tab[data-target="D1"]').click();
  const phase = page.locator('#phase-D1');
  const before = await phase.textContent();
  await page.waitForTimeout(200);
  expect(await phase.textContent()).toBe(before);
  await expect(page.locator('#period-D1')).toHaveText('—');
  await page.locator('.orbit-tab[data-target="global"]').click();
  await page.locator('.speed-btn[data-speed="1"]').click();
  await page.locator('.orbit-tab[data-target="D1"]').click();
  await expect.poll(() => phase.textContent()).not.toBe(before);
});

test.describe('recoverable asset failures', () => {
  test.use({ allowedFailures: 'three\\.min\\.js|earth-model\\.js|earth_atmos_2048\\.jpg' });
  for (const [name, pattern] of [
    ['Three.js', /three\.min\.js/],
    ['Earth module', /earth-model\.js/],
    ['Earth texture', /earth_atmos_2048\.jpg/]
  ]) {
    test(`${name} failure remains on boot and succeeds on retry`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      let failed = false;
      await page.route(pattern, route => {
        if (!failed) { failed = true; return route.fulfill({ status: 503, body: 'Intentional test failure' }); }
        return route.continue();
      });
      await startTerminal(page);
      await expect(page.locator('body')).toHaveAttribute('data-boot-state', 'error');
      await expect(page.locator('#boot')).toBeVisible();
      await expect(page.locator('#main-ui')).toBeHidden();
      await expect(page.getByRole('status')).toContainText(/加载失败/);
      await page.getByRole('button', { name: 'RETRY / 重试', exact: true }).click();
      await expectReady(page);
      await expect(page.locator('#three-canvas canvas')).toHaveCount(1);
      await expect(page.locator('.orbit-panel')).toHaveCount(5);
    });
  }
});

test('WebGL unavailability is recoverable without leaving a partial scene', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    window.restoreWebGL = () => { HTMLCanvasElement.prototype.getContext = original; };
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      return /webgl/.test(type) ? null : original.call(this, type, ...args);
    };
  });
  await startTerminal(page);
  await expect(page.locator('body')).toHaveAttribute('data-boot-state', 'error');
  await expect(page.getByRole('status')).toContainText('WebGL');
  await expect(page.locator('#three-canvas canvas')).toHaveCount(0);
  await page.evaluate(() => window.restoreWebGL());
  await page.getByRole('button', { name: 'RETRY / 重试', exact: true }).click();
  await expectReady(page);
});
