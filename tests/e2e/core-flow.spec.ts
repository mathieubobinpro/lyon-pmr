import { test, expect } from '@playwright/test';

// Viewport iPhone 12
const IPHONE_12 = { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true };

test.use({ viewport: IPHONE_12 });

test("parcours core : ouverture vers place la plus proche vers detail vers navigation", async ({ page }) => {
  await page.goto('/');

  // Splash screen disparaît (max 3s)
  await expect(page.locator('[role="status"][aria-label="Chargement de Lyon PMR"]')).toBeVisible();
  await expect(page.locator('[role="status"][aria-label="Chargement de Lyon PMR"]')).not.toBeVisible({ timeout: 3000 });

  // Onglet Carte actif par défaut
  await expect(page.locator('nav button[aria-current="page"]')).toContainText('Carte');

  // CTA "Place la plus proche" visible et cliquable
  const cta = page.getByTestId('btn-nearest');
  await expect(cta).toBeVisible();
  await cta.tap();

  // DetailSheet ouverte — bouton J'y vais visible
  const goBtn = page.locator('button', { hasText: "J'y vais" });
  await expect(goBtn).toBeVisible({ timeout: 2000 });

  // CTA J'y vais ouvre le sélecteur de navigation
  await goBtn.tap();
  await expect(page.locator('text=Ouvrir dans')).toBeVisible({ timeout: 1000 });
});

test('navigation entre les 4 onglets', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(2000); // splash

  for (const tab of ['Liste', 'Favoris', 'Réglages', 'Carte']) {
    await page.locator('nav button', { hasText: tab }).tap();
    await expect(page.locator('nav button[aria-current="page"]')).toContainText(tab);
  }
});
