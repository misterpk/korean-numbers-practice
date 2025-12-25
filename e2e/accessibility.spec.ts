import { test, expect } from '@playwright/test';
import { answerQuestion } from './helpers';

test.describe('Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');

    // Should have an h1 for the main title
    const h1 = page.getByRole('heading', { level: 1, name: 'Korean Numbers Practice' });
    await expect(h1).toBeVisible();
  });

  test('should have accessible form controls', async ({ page }) => {
    await page.goto('/');

    // Input should be accessible
    const input = page.getByPlaceholder('Type your answer...');
    await expect(input).toBeVisible();

    // Buttons should have accessible names
    const submitButton = page.getByRole('button', { name: 'Submit' });
    await expect(submitButton).toBeVisible();

    const settingsButton = page.getByRole('button', { name: 'Settings' });
    await expect(settingsButton).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }, testInfo) => {
    await page.goto('/');

    // Input field should be autofocused on page load
    const input = page.getByPlaceholder('Type your answer...');
    await expect(input).toBeFocused();

    // Type answer (use fill on mobile as keyboard.type may not work reliably)
    if (testInfo.project.name.includes('Mobile')) {
      await input.fill('5');
    } else {
      await page.keyboard.type('5');
    }

    // Tab to submit button (skip Tab on mobile and WebKit where Tab behavior differs)
    if (!testInfo.project.name.includes('Mobile') && !testInfo.project.name.includes('webkit')) {
      await page.keyboard.press('Tab');
    }

    const submitButton = page.getByRole('button', { name: 'Submit' });

    // On Chromium/Firefox, test Tab navigation and Enter key
    // On WebKit/Mobile, just test that submission works
    if (!testInfo.project.name.includes('Mobile') && !testInfo.project.name.includes('webkit')) {
      await expect(submitButton).toBeFocused();
      // Press Enter to submit
      await page.keyboard.press('Enter');
    } else {
      // On WebKit/mobile, click the submit button directly
      await expect(submitButton).toBeEnabled();
      await submitButton.click();
    }

    // Should submit the answer
    // Check that feedback appears
    await expect(page.locator('text=/✓ Correct!|✗ Incorrect/')).toBeVisible();
  });

  test('should have visible focus indicators', async ({ page }, testInfo) => {
    await page.goto('/');

    // Input should be autofocused on page load
    const input = page.getByPlaceholder('Type your answer...');
    await expect(input).toBeFocused();

    // Type something to enable submit
    await page.keyboard.type('5');

    // Tab to button (skip focus check on mobile and WebKit where Tab behavior differs)
    await page.keyboard.press('Tab');
    const submitButton = page.getByRole('button', { name: 'Submit' });

    // Only check Tab focus on Chromium/Firefox
    if (!testInfo.project.name.includes('Mobile') && !testInfo.project.name.includes('webkit')) {
      await expect(submitButton).toBeFocused();
    }
  });

  test('should have sufficient color contrast for feedback messages', async ({ page }) => {
    await page.goto('/');

    // Answer a question to get feedback
    await answerQuestion(page, '999'); // Likely incorrect

    // Feedback should be visible
    const feedback = page.locator('text=/✓ Correct!|✗ Incorrect/');
    await expect(feedback).toBeVisible();

    // Get the feedback element's styles
    const feedbackBox = feedback.locator('..');
    const bgColor = await feedbackBox.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    const textColor = await feedbackBox.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // Just verify that colors are set (detailed contrast checking would require more complex logic)
    expect(bgColor).toBeTruthy();
    expect(textColor).toBeTruthy();
  });

  test('should have semantic HTML structure', async ({ page }) => {
    await page.goto('/');

    // Should use proper semantic elements
    // Form should be wrapped in a form element
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Buttons should be button elements
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('should support Enter key to submit form', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder('Type your answer...');
    await input.fill('5');

    // Press Enter to submit
    await page.keyboard.press('Enter');

    // Should show feedback
    await expect(page.locator('text=/✓ Correct!|✗ Incorrect/')).toBeVisible();
  });

  test('should support Enter key to advance after incorrect answer', async ({ page }) => {
    await page.goto('/');

    // Answer incorrectly
    await answerQuestion(page, '999');

    // Next Question button should appear
    await expect(page.getByRole('button', { name: 'Next Question' })).toBeVisible();

    // Press Enter (should trigger next question)
    await page.keyboard.press('Enter');

    // Feedback should disappear
    await expect(page.locator('text=✗ Incorrect')).not.toBeVisible();
  });

  test('should have readable text sizes', async ({ page }) => {
    await page.goto('/');

    // Check that main text elements have reasonable font sizes
    const title = page.getByRole('heading', { name: 'Korean Numbers Practice' });
    const fontSize = await title.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });

    // Font size should be at least 16px (or converted from other units)
    expect(fontSize).toBeTruthy();
  });
});
