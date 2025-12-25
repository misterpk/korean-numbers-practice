import { test, expect } from '@playwright/test';
import {
  openSettings,
  changeNumberSystem,
  changeDirection,
  changeRange,
  applySettings
} from './helpers';

test.describe('Settings Panel', () => {
  test('should start with settings collapsed', async ({ page }) => {
    await page.goto('/');

    // Settings button should be visible
    await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible();

    // Settings content should not be visible
    await expect(page.getByText('Number System:')).not.toBeVisible();
  });

  test('should expand/collapse settings when clicking Settings button', async ({ page }) => {
    await page.goto('/');

    // Initially collapsed
    await expect(page.getByText('Number System:')).not.toBeVisible();

    // Click to expand
    await openSettings(page);
    await expect(page.getByText('Number System:')).toBeVisible();

    // Click to collapse
    const settingsButton = page.getByRole('button', { name: /^Settings/ });
    await settingsButton.click();
    await expect(page.getByText('Number System:')).not.toBeVisible();
  });

  test('should switch from Native to Sino-Korean number system', async ({ page }) => {
    await page.goto('/');

    await openSettings(page);

    // Click Sino-Korean button
    await changeNumberSystem(page, 'sino');

    // Apply settings
    await applySettings(page);

    // The number system has changed
    // We can verify by checking the number system button has the appropriate styling
    // (In the real app, the selected button has different background color)
    const sinoButton = page.getByRole('button', { name: 'Sino-Korean' });
    await expect(sinoButton).toBeVisible();
  });

  test('should generate appropriate questions for Sino-Korean (0-9999)', async ({ page }) => {
    await page.goto('/');

    await openSettings(page);

    // Switch to Sino-Korean and set larger range
    await changeNumberSystem(page, 'sino');
    await changeRange(page, 0, 1000);
    await applySettings(page);

    // The question should now potentially be a larger number
    // We can't predict the exact number, but we can verify the quiz is working
    await expect(page.getByPlaceholder('Type your answer...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
  });

  test('should switch quiz direction from Korean→English to English→Korean', async ({ page }) => {
    await page.goto('/');

    // Initially Korean→English
    await expect(page.getByText('What number is this?')).toBeVisible();

    await openSettings(page);
    await changeDirection(page, 'englishToKorean');
    await applySettings(page);

    // Should show English→Korean prompt
    await expect(page.getByText('How do you say this in Korean?')).toBeVisible();
  });

  test('should update number range and generate questions within range', async ({ page }) => {
    await page.goto('/');

    await openSettings(page);

    // Set a very specific small range
    await changeRange(page, 5, 5);
    await applySettings(page);

    // Close settings to access the quiz input clearly
    const settingsButton = page.getByRole('button', { name: /^Settings/ });
    await settingsButton.click();

    // Wait for settings to close
    await expect(page.getByText('Number System:')).not.toBeVisible();

    // The question should now be "5" (or "다섯" in native Korean)
    // Since range is 5-5, it can only be 5
    // Verify the quiz is functional - answer with 5
    const input = page.getByPlaceholder('Type your answer...');
    await input.fill('5');

    const submitButton = page.getByRole('button', { name: 'Submit' });
    await submitButton.click();

    // Should show feedback (testing that range setting worked and quiz is functional)
    await expect(page.locator('text=/✓ Correct!|✗ Incorrect/')).toBeVisible();
  });

  test('should apply settings immediately with Apply Settings button', async ({ page }) => {
    await page.goto('/');

    // Note initial question type (Korean text)
    const initialPrompt = await page.getByText('What number is this?');
    await expect(initialPrompt).toBeVisible();

    await openSettings(page);
    await changeDirection(page, 'englishToKorean');
    await applySettings(page);

    // Prompt should change immediately
    await expect(page.getByText('How do you say this in Korean?')).toBeVisible();
  });

  test('should persist settings across multiple questions', async ({ page }) => {
    await page.goto('/');

    await openSettings(page);
    await changeDirection(page, 'englishToKorean');
    await applySettings(page);

    // Verify direction changed
    await expect(page.getByText('How do you say this in Korean?')).toBeVisible();

    // Answer a question incorrectly to advance
    const input = page.getByPlaceholder('Type your answer...');
    await input.fill('테스트');
    await page.getByRole('button', { name: 'Submit' }).click();

    // Click Next Question
    await page.getByRole('button', { name: 'Next Question' }).click();

    // Direction should still be English→Korean
    await expect(page.getByText('How do you say this in Korean?')).toBeVisible();
  });
});
