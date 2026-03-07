const { test, expect } = require('@playwright/test');

const TOPIC_OVERVIEW = '/research/claude-code/';
const SUB_PAGE = '/research/claude-code/features/';

test.describe('Sidebar layout', () => {

  test('sidebar exists on research pages (desktop)', async ({ page, viewport }) => {
    test.skip(viewport.width < 769, 'Desktop-only');
    await page.goto(SUB_PAGE);
    const sidebar = page.locator('.book-menu');
    await expect(sidebar).toBeVisible();
  });

  test('sidebar contains navigation links', async ({ page, viewport }) => {
    test.skip(viewport.width < 769, 'Desktop-only');
    await page.goto(SUB_PAGE);
    const links = page.locator('.book-menu nav a');
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('table of contents visible on desktop', async ({ page, viewport }) => {
    test.skip(viewport.width < 769, 'Desktop-only');
    await page.goto(SUB_PAGE);
    const toc = page.locator('.book-toc');
    await expect(toc).toBeVisible();
  });

  test('sidebar is beside content on desktop', async ({ page, viewport }) => {
    test.skip(viewport.width < 769, 'Desktop-only');
    await page.goto(SUB_PAGE);
    const menu = page.locator('.book-menu');
    const content = page.locator('.book-page');

    const menuBox = await menu.boundingBox();
    const contentBox = await content.boundingBox();

    expect(menuBox.x).toBeLessThan(contentBox.x);
    expect(Math.abs(menuBox.y - contentBox.y)).toBeLessThan(50);
  });
});

test.describe('Mobile layout', () => {

  test('sidebar toggle button visible on mobile', async ({ page, viewport }) => {
    test.skip(viewport.width > 768, 'Mobile-only');
    await page.goto(SUB_PAGE);
    const toggle = page.locator('label[for="menu-control"]').first();
    await expect(toggle).toBeVisible();
  });

  test('sidebar hidden by default on mobile', async ({ page, viewport }) => {
    test.skip(viewport.width > 768, 'Mobile-only');
    await page.goto(SUB_PAGE);
    const menu = page.locator('.book-menu');
    const box = await menu.boundingBox();
    // Menu should be off-screen (negative x via CSS transform)
    expect(box === null || box.x < 0).toBeTruthy();
  });

  test('sidebar appears after toggle click on mobile', async ({ page, viewport }) => {
    test.skip(viewport.width > 768, 'Mobile-only');
    await page.goto(SUB_PAGE);
    await page.locator('label[for="menu-control"]').first().click();
    await page.waitForTimeout(400);
    // The checkbox should be checked and overlay visible
    const checked = await page.locator('#menu-control').isChecked();
    expect(checked).toBeTruthy();
  });

  test('toc toggle visible on mobile', async ({ page, viewport }) => {
    test.skip(viewport.width > 768, 'Mobile-only');
    await page.goto(SUB_PAGE);
    const toggle = page.locator('label[for="toc-control"]').first();
    await expect(toggle).toBeVisible();
  });
});

test.describe('Content rendering', () => {

  test('sub-page renders content', async ({ page }) => {
    await page.goto(SUB_PAGE);
    const content = page.locator('.book-page');
    await expect(content).toBeVisible();
    const text = await content.textContent();
    expect(text).toContain('Slash Commands');
  });

  test('topic overview renders content', async ({ page }) => {
    await page.goto(TOPIC_OVERVIEW);
    const content = page.locator('.book-page');
    await expect(content).toBeVisible();
    const text = await content.textContent();
    expect(text).toContain('Overview');
  });

  test('homepage renders', async ({ page }) => {
    await page.goto('/');
    const body = page.locator('body');
    const text = await body.textContent();
    expect(text).toContain('Deep Research');
  });
});

test.describe('Screenshots', () => {

  test('desktop sub-page', async ({ page }) => {
    await page.goto(SUB_PAGE);
    await page.screenshot({ path: 'test-results/desktop-subpage.png', fullPage: true });
  });

  test('mobile sub-page', async ({ page }) => {
    await page.goto(SUB_PAGE);
    await page.screenshot({ path: 'test-results/mobile-subpage.png', fullPage: true });
  });

  test('desktop overview', async ({ page }) => {
    await page.goto(TOPIC_OVERVIEW);
    await page.screenshot({ path: 'test-results/desktop-overview.png', fullPage: true });
  });

  test('mobile overview', async ({ page }) => {
    await page.goto(TOPIC_OVERVIEW);
    await page.screenshot({ path: 'test-results/mobile-overview.png', fullPage: true });
  });
});
