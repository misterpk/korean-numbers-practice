import { test, expect, devices } from '@playwright/test';
import { openSettings, changeDirection, applySettings } from './helpers';

test.use({ ...devices['iPhone 12'] });

test.describe('Mobile Responsiveness', () => {

  test('should display correctly on mobile viewport', async ({ page }) => {
    await page.goto('/');

    // Check key elements are visible
    await expect(page.getByRole('heading', { name: 'Korean Numbers Practice' })).toBeVisible();
    await expect(page.getByText('Score: 0 / 0')).toBeVisible();
    await expect(page.getByPlaceholder('Type your answer...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
  });

  test('should have touch-friendly buttons (44px minimum)', async ({ page }) => {
    await page.goto('/');

    // Check Submit button dimensions
    const submitButton = page.getByRole('button', { name: 'Submit' });
    const box = await submitButton.boundingBox();

    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
    }

    // Check Settings button
    const settingsButton = page.getByRole('button', { name: 'Settings' });
    const settingsBox = await settingsButton.boundingBox();

    expect(settingsBox).not.toBeNull();
    if (settingsBox) {
      expect(settingsBox.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('should show numeric keyboard for Korean→English on mobile', async ({ page }) => {
    await page.goto('/');

    // Check input has numeric attributes
    const input = page.getByPlaceholder('Type your answer...');
    const inputMode = await input.getAttribute('inputMode');
    const type = await input.getAttribute('type');

    expect(inputMode).toBe('numeric');
    expect(type).toBe('number');
  });

  test('should show text keyboard for English→Korean on mobile', async ({ page }) => {
    await page.goto('/');

    // Switch to English→Korean
    await openSettings(page);
    await changeDirection(page, 'englishToKorean');
    await applySettings(page);

    // Check input has text attributes
    const input = page.getByPlaceholder('Type your answer...');
    const inputMode = await input.getAttribute('inputMode');
    const type = await input.getAttribute('type');
    const lang = await input.getAttribute('lang');

    expect(inputMode).toBe('text');
    expect(type).toBe('text');
    expect(lang).toBe('ko'); // Korean language hint
  });

  test('should collapse settings by default on mobile to prioritize quiz', async ({ page }) => {
    await page.goto('/');

    // Settings should be collapsed
    await expect(page.getByText('Number System:')).not.toBeVisible();

    // Quiz area should be visible
    await expect(page.getByText('What number is this?')).toBeVisible();
    await expect(page.getByPlaceholder('Type your answer...')).toBeVisible();
  });

  test('should render settings panel usably on mobile', async ({ page }) => {
    await page.goto('/');

    await openSettings(page);

    // All settings controls should be visible
    await expect(page.getByText('Number System:')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Native Korean' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sino-Korean' })).toBeVisible();
    await expect(page.getByText('Direction:')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Korean → English' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'English → Korean' })).toBeVisible();
  });

  test('should have appropriately sized text on mobile', async ({ page }) => {
    await page.goto('/');

    // Title should be readable
    const title = page.getByRole('heading', { name: 'Korean Numbers Practice' });
    await expect(title).toBeVisible();

    // Question text should be large enough
    const questionPrompt = page.getByText('What number is this?');
    await expect(questionPrompt).toBeVisible();
  });
});

const tabletTest = test.extend({});
tabletTest.use({ ...devices['iPad Pro'] });

tabletTest.describe('Tablet Responsiveness', () => {

  tabletTest('should display correctly on tablet viewport', async ({ page }) => {
    await page.goto('/');

    // Check key elements are visible
    await expect(page.getByRole('heading', { name: 'Korean Numbers Practice' })).toBeVisible();
    await expect(page.getByText('Score: 0 / 0')).toBeVisible();
    await expect(page.getByPlaceholder('Type your answer...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
  });
});
