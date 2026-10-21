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
  await expect(page.locator('body')).toHaveAttribute('data-boot-state', 'ready');
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

test('solar intro finishes drawing before moving, without redundant intro writes', async ({ page }) => {
  await page.goto('/#projects');
  const orbit = page.locator('.solar-orbit').first();
  await expect.poll(async () => Number(await orbit.evaluate(node => node.style.strokeDashoffset))).toBeLessThan(.8);
  const planet = page.locator('.solar-planet').first();
  const stationary = await planet.getAttribute('transform');
  await page.waitForTimeout(150);
  expect(await planet.getAttribute('transform')).toBe(stationary);
  await expect(page.locator('#projects')).toHaveAttribute('data-motion', 'running');
  await expect(orbit).toHaveCSS('stroke-dashoffset', '0px');
  await expect.poll(() => planet.getAttribute('transform')).not.toBe(stationary);
  const repeatedWrites = await page.evaluate(async () => {
    let count = 0;
    const observer = new MutationObserver(records => { count += records.length; });
    for (const node of document.querySelectorAll('.solar-sun, .solar-sun-aura, .solar-planets, .solar-orbit')) {
      observer.observe(node, { attributes: true, attributeFilter: ['style'] });
    }
    observer.observe(document.querySelector('#projects'), { attributes: true, attributeFilter: ['data-motion'] });
    await new Promise(resolve => setTimeout(resolve, 200));
    observer.disconnect();
    return count;
  });
  expect(repeatedWrites).toBe(0);
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
