import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const IPHONE_12 = { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true };

test.use({ viewport: IPHONE_12 });

// ── Helper ─────────────────────────────────────────────────────────────────────

async function waitForApp(page: import('@playwright/test').Page) {
  await page.goto('/');
  // Splash dure 1800ms, on attend jusqu'à 8s pour absorber la latence des tests parallèles
  await expect(page.locator('[role="status"]')).toBeVisible({ timeout: 3000 }).catch(() => {});
  await expect(page.locator('[role="status"]')).not.toBeVisible({ timeout: 8000 });
}

// ── Parcours core ──────────────────────────────────────────────────────────────

test('parcours core : ouverture → place la plus proche → détail → navigation', async ({ page }) => {
  await waitForApp(page);

  await expect(page.locator('nav button[aria-current="page"]')).toContainText('Carte');

  const cta = page.getByTestId('btn-nearest');
  await expect(cta).toBeVisible();
  await cta.tap();

  const goBtn = page.locator('button', { hasText: "J'y vais" });
  await expect(goBtn).toBeVisible({ timeout: 2000 });

  await goBtn.tap();
  await expect(page.locator('text=Ouvrir dans')).toBeVisible({ timeout: 1500 });

  await page.locator('button', { hasText: 'Annuler' }).tap();
  await expect(page.locator('text=Ouvrir dans')).not.toBeVisible();
});

// ── Navigation entre onglets ───────────────────────────────────────────────────

test('navigation entre les 4 onglets', async ({ page }) => {
  await waitForApp(page);

  for (const tab of ['Liste', 'Favoris', 'Réglages', 'Carte']) {
    await page.locator('nav button', { hasText: tab }).tap();
    await expect(page.locator('nav button[aria-current="page"]')).toContainText(tab);
  }
});

// ── Accessibilité WCAG AA ──────────────────────────────────────────────────────

test('axe — onglet Carte sans violation critique', async ({ page }) => {
  await waitForApp(page);

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .disableRules(['color-contrast']) // MapLibre injects elements outside our control
    .analyze();

  const critical = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
  expect(
    critical,
    `Violations: ${JSON.stringify(critical.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })), null, 2)}`
  ).toHaveLength(0);
});

test('axe — onglet Liste sans violation critique', async ({ page }) => {
  await waitForApp(page);
  await page.locator('nav button', { hasText: 'Liste' }).tap();
  await page.waitForTimeout(300);

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .disableRules(['color-contrast'])
    .analyze();

  const critical = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
  expect(
    critical,
    `Violations: ${JSON.stringify(critical.map(v => ({ id: v.id, impact: v.impact })), null, 2)}`
  ).toHaveLength(0);
});

test('axe — onglet Réglages sans violation critique', async ({ page }) => {
  await waitForApp(page);
  await page.locator('nav button', { hasText: 'Réglages' }).tap();
  await page.waitForTimeout(300);

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .disableRules(['color-contrast'])
    .analyze();

  const critical = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
  expect(
    critical,
    `Violations: ${JSON.stringify(critical.map(v => ({ id: v.id, impact: v.impact })), null, 2)}`
  ).toHaveLength(0);
});

// ── Cibles tactiles ────────────────────────────────────────────────────────────

test('cibles tactiles — tab bar buttons ≥ 56 px', async ({ page }) => {
  await waitForApp(page);

  const tabButtons = page.locator('nav button');
  const count = await tabButtons.count();
  expect(count).toBeGreaterThanOrEqual(4);

  for (let i = 0; i < count; i++) {
    const box = await tabButtons.nth(i).boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height, `Tab button ${i}: ${box!.height}px`).toBeGreaterThanOrEqual(56);
  }
});

test('cibles tactiles — CTA principal ≥ 72 px', async ({ page }) => {
  await waitForApp(page);
  const box = await page.getByTestId('btn-nearest').boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBeGreaterThanOrEqual(72);
});

// ── Dark mode ──────────────────────────────────────────────────────────────────

test('dark mode — toggle depuis Réglages persiste sur Carte', async ({ page }) => {
  await waitForApp(page);
  await page.locator('nav button', { hasText: 'Réglages' }).tap();
  // Le switch est un <label> avec un <input opacity:0> — on clique le label visible
  await page.locator('label[aria-label="Activer le mode sombre"]').tap();
  await page.locator('nav button', { hasText: 'Carte' }).tap();

  const hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  expect(hasDark).toBe(true);
});

// ── État vide Favoris ──────────────────────────────────────────────────────────

test('favoris vides — empty state lisible', async ({ page }) => {
  await waitForApp(page);
  await page.locator('nav button', { hasText: 'Favoris' }).tap();
  await expect(page.locator('h2', { hasText: 'Aucun favori' })).toBeVisible();
});
