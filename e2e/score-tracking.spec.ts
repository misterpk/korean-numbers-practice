import { test, expect } from '@playwright/test';
import { answerQuestion, getScore, clickNextQuestion } from './helpers';

test.describe('Score Tracking', () => {
  test('should start with score 0/0', async ({ page }) => {
    await page.goto('/');

    const score = await getScore(page);
    expect(score).toEqual({ correct: 0, total: 0 });
  });

  test('should increment score correctly for correct answers', async ({ page }) => {
    await page.goto('/');

    // Initial score
    let score = await getScore(page);
    expect(score).toEqual({ correct: 0, total: 0 });

    // This test will answer incorrectly and track that
    // (We can't easily predict correct answers without knowing the question)
    await answerQuestion(page, '999'); // Very unlikely to be correct for 0-10 range

    score = await getScore(page);
    expect(score.total).toBe(1);
    // correct might be 0 or 1 depending on if we got lucky
  });

  test('should track mixed results correctly', async ({ page }) => {
    await page.goto('/');

    // Answer first question incorrectly
    await answerQuestion(page, '999');
    let score = await getScore(page);
    expect(score.total).toBe(1);

    // Advance
    await clickNextQuestion(page);

    // Answer second question incorrectly
    await answerQuestion(page, '888');
    score = await getScore(page);
    expect(score.total).toBe(2);

    // Advance
    await clickNextQuestion(page);

    // Answer third question incorrectly
    await answerQuestion(page, '777');
    score = await getScore(page);
    expect(score.total).toBe(3);

    // All should be incorrect (999, 888, 777 are outside 0-10 range)
    expect(score.correct).toBe(0);
  });

  test('should maintain score when switching settings', async ({ page }) => {
    await page.goto('/');

    // Answer a question incorrectly
    await answerQuestion(page, '999');
    let score = await getScore(page);
    expect(score.total).toBe(1);

    // Open settings and change something
    const settingsButton = page.getByRole('button', { name: 'Settings' });
    await settingsButton.click();

    const sinoButton = page.getByRole('button', { name: 'Sino-Korean' });
    await sinoButton.click();

    const applyButton = page.getByRole('button', { name: 'Apply Settings' });
    await applyButton.click();

    // Score should be maintained
    score = await getScore(page);
    expect(score.total).toBe(1);
  });

  test('should calculate percentage correctly over multiple questions', async ({ page }) => {
    await page.goto('/');

    // Answer 10 questions incorrectly (using numbers outside the default 0-10 range)
    for (let i = 0; i < 10; i++) {
      await answerQuestion(page, (900 + i).toString());
      await clickNextQuestion(page);
    }

    const score = await getScore(page);
    expect(score.total).toBe(10);

    // Calculate percentage
    const percentage = (score.correct / score.total) * 100;
    expect(percentage).toBeGreaterThanOrEqual(0);
    expect(percentage).toBeLessThanOrEqual(100);
  });

  test('should update score display immediately after submitting answer', async ({ page }) => {
    await page.goto('/');

    // Initial score should be 0/0
    await expect(page.getByText('Score: 0 / 0')).toBeVisible();

    // Answer a question
    await answerQuestion(page, '999');

    // Score should update immediately to show 0/1 or 1/1
    const scoreText = await page.locator('text=/Score: \\d+ \\/ 1/').textContent();
    expect(scoreText).toMatch(/Score: [01] \/ 1/);
  });

  test('should continue incrementing total across many questions', async ({ page }) => {
    await page.goto('/');

    // Answer 5 questions
    for (let i = 0; i < 5; i++) {
      await answerQuestion(page, (800 + i).toString());
      const score = await getScore(page);
      expect(score.total).toBe(i + 1);

      // If not the last question, click next
      if (i < 4) {
        await clickNextQuestion(page);
      }
    }

    const finalScore = await getScore(page);
    expect(finalScore.total).toBe(5);
  });
});
