const { test, expect } = require('@playwright/test');

// Research topic page paths
const TOPIC_OVERVIEW = '/research/claude-code/';
const SUB_PAGE = '/research/claude-code/features/';

test.describe('Sidebar layout', () => {

  test('sidebar is visible on research pages', async ({ page }) => {
    await page.goto(TOPIC_OVERVIEW);
    const sidebar = page.locator('.docs-sidebar');
    await expect(sidebar).toBeVisible();
  });

  test('sidebar contains topic with pages', async ({ page }) => {
    await page.goto(TOPIC_OVERVIEW);
    const topic = page.locator('.sidebar-topic');
    await expect(topic).toHaveCount(1);

    const links = page.locator('.sidebar-pages a');
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('sidebar topic title does not include "Deep Research" suffix', async ({ page }) => {
    await page.goto(TOPIC_OVERVIEW);
    const title = page.locator('.sidebar-topic-title');
    const text = await title.textContent();
    expect(text).not.toContain('Deep Research');
  });

  test('active page is highlighted in sidebar', async ({ page }) => {
    await page.goto(SUB_PAGE);
    const activeLink = page.locator('.sidebar-pages a.active');
    await expect(activeLink).toHaveCount(1);
    await expect(activeLink).toContainText('Core Features');
  });

  test('active page has visible left border', async ({ page }) => {
    await page.goto(SUB_PAGE);
    const activeLink = page.locator('.sidebar-pages a.active');
    const borderColor = await activeLink.evaluate(
      el => getComputedStyle(el).borderLeftColor
    );
    expect(borderColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(borderColor).not.toBe('transparent');
  });

  test('active page link has bold font weight', async ({ page }) => {
    await page.goto(SUB_PAGE);
    const activeLink = page.locator('.sidebar-pages a.active');
    const fontWeight = await activeLink.evaluate(
      el => getComputedStyle(el).fontWeight
    );
    expect(Number(fontWeight)).toBeGreaterThanOrEqual(600);
  });

  test('sidebar links navigate to correct pages', async ({ page }) => {
    await page.goto(TOPIC_OVERVIEW);
    const firstLink = page.locator('.sidebar-pages a').first();
    const href = await firstLink.getAttribute('href');
    expect(href).toContain('/research/claude-code/');
  });

  test('topic details is open on current section pages', async ({ page }) => {
    await page.goto(SUB_PAGE);
    const details = page.locator('.sidebar-topic');
    const isOpen = await details.getAttribute('open');
    expect(isOpen).not.toBeNull();
  });

  test('non-active links have lower opacity', async ({ page }) => {
    await page.goto(SUB_PAGE);
    const inactiveLink = page.locator('.sidebar-pages a:not(.active)').first();
    const opacity = await inactiveLink.evaluate(
      el => getComputedStyle(el).opacity
    );
    expect(Number(opacity)).toBeLessThan(0.7);
  });
});

test.describe('Desktop layout @desktop', () => {

  test('sidebar is positioned beside content', async ({ page, viewport }) => {
    test.skip(viewport.width < 769, 'Desktop-only');
    await page.goto(SUB_PAGE);
    const sidebar = page.locator('.docs-sidebar');
    const content = page.locator('.docs-content');

    const sidebarBox = await sidebar.boundingBox();
    const contentBox = await content.boundingBox();

    expect(sidebarBox.x).toBeLessThan(contentBox.x);
    expect(Math.abs(sidebarBox.y - contentBox.y)).toBeLessThan(50);
  });

  test('sidebar has right border on desktop', async ({ page, viewport }) => {
    test.skip(viewport.width < 769, 'Desktop-only');
    await page.goto(SUB_PAGE);
    const sidebar = page.locator('.docs-sidebar');
    const borderRight = await sidebar.evaluate(
      el => getComputedStyle(el).borderRightStyle
    );
    expect(borderRight).toBe('solid');
  });

  test('sidebar is sticky on desktop', async ({ page, viewport }) => {
    test.skip(viewport.width < 769, 'Desktop-only');
    await page.goto(SUB_PAGE);
    const sidebar = page.locator('.docs-sidebar');
    const position = await sidebar.evaluate(
      el => getComputedStyle(el).position
    );
    expect(position).toBe('sticky');
  });
});

test.describe('Mobile layout @mobile', () => {

  test('sidebar is above content on mobile', async ({ page, viewport }) => {
    test.skip(viewport.width > 768, 'Mobile-only');
    await page.goto(SUB_PAGE);
    const sidebar = page.locator('.docs-sidebar');
    const content = page.locator('.docs-content');

    const sidebarBox = await sidebar.boundingBox();
    const contentBox = await content.boundingBox();

    expect(sidebarBox.y).toBeLessThan(contentBox.y);
  });

  test('sidebar has background card on mobile', async ({ page, viewport }) => {
    test.skip(viewport.width > 768, 'Mobile-only');
    await page.goto(SUB_PAGE);
    const sidebar = page.locator('.docs-sidebar');
    const bg = await sidebar.evaluate(
      el => getComputedStyle(el).backgroundColor
    );
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    expect(bg).not.toBe('transparent');
  });

  test('sidebar has border-radius on mobile', async ({ page, viewport }) => {
    test.skip(viewport.width > 768, 'Mobile-only');
    await page.goto(SUB_PAGE);
    const sidebar = page.locator('.docs-sidebar');
    const radius = await sidebar.evaluate(
      el => getComputedStyle(el).borderRadius
    );
    expect(radius).not.toBe('0px');
  });

  test('sidebar is full width on mobile', async ({ page, viewport }) => {
    test.skip(viewport.width > 768, 'Mobile-only');
    await page.goto(SUB_PAGE);
    const sidebar = page.locator('.docs-sidebar');
    const layout = page.locator('.docs-layout');

    const sidebarBox = await sidebar.boundingBox();
    const layoutBox = await layout.boundingBox();

    expect(sidebarBox.width).toBeGreaterThan(layoutBox.width * 0.8);
  });
});

test.describe('Content rendering', () => {

  test('main content renders article', async ({ page }) => {
    await page.goto(SUB_PAGE);
    const article = page.locator('.docs-content article');
    await expect(article).toBeVisible();
  });

  test('page title renders in content area', async ({ page }) => {
    await page.goto(SUB_PAGE);
    const h1 = page.locator('.docs-content h1');
    await expect(h1).toContainText('Core Features');
  });

  test('homepage does not have docs sidebar', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('.docs-sidebar');
    await expect(sidebar).toHaveCount(0);
  });

  test('topic overview page renders content', async ({ page }) => {
    await page.goto(TOPIC_OVERVIEW);
    const content = page.locator('.docs-content');
    await expect(content).toBeVisible();
    const text = await content.textContent();
    expect(text.length).toBeGreaterThan(100);
  });
});

test.describe('Screenshots', () => {

  test('capture desktop sub-page', async ({ page }) => {
    await page.goto(SUB_PAGE);
    await page.screenshot({ path: 'test-results/desktop-subpage.png', fullPage: true });
  });

  test('capture mobile sub-page', async ({ page }) => {
    await page.goto(SUB_PAGE);
    await page.screenshot({ path: 'test-results/mobile-subpage.png', fullPage: true });
  });

  test('capture desktop overview', async ({ page }) => {
    await page.goto(TOPIC_OVERVIEW);
    await page.screenshot({ path: 'test-results/desktop-overview.png', fullPage: true });
  });

  test('capture mobile overview', async ({ page }) => {
    await page.goto(TOPIC_OVERVIEW);
    await page.screenshot({ path: 'test-results/mobile-overview.png', fullPage: true });
  });
});
