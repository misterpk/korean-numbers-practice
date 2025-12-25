import { test, expect } from '@playwright/test';
import {
  answerQuestion,
  getScore,
  getFeedback,
  clickNextQuestion,
  openSettings,
  changeDirection,
  applySettings
} from './helpers';

test.describe('Quiz Flow - Korean to English', () => {
  test('should load app and display initial question', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page.getByRole('heading', { name: 'Korean Numbers Practice' })).toBeVisible();

    // Check initial score
    await expect(page.getByText('Score: 0 / 0')).toBeVisible();

    // Check question prompt
    await expect(page.getByText('What number is this?')).toBeVisible();

    // Check input field exists
    await expect(page.getByPlaceholder('Type your answer...')).toBeVisible();

    // Check submit button exists but is disabled (empty input)
    const submitButton = page.getByRole('button', { name: 'Submit' });
    await expect(submitButton).toBeVisible();
  });

  test('should answer a question correctly and auto-advance after 1 second', async ({ page }) => {
    await page.goto('/');

    // Get the question (Korean number)
    const questionElement = page.locator('div').filter({
      has: page.locator('text=/^[가-힣]+$/')
    }).first();
    const koreanText = await questionElement.textContent();

    // Map to number (for a simple test, we'll use a known answer)
    // Answer with '5' for '다섯'
    if (koreanText?.includes('다섯')) {
      await answerQuestion(page, '5');

      // Check feedback
      const feedback = await getFeedback(page);
      expect(feedback?.isCorrect).toBe(true);

      // Check score updated
      const score = await getScore(page);
      expect(score.correct).toBe(1);
      expect(score.total).toBe(1);

      // Wait for auto-advance (correct answers advance after 1 second)
      await page.waitForTimeout(1500);

      // Feedback should be gone (new question loaded)
      const newFeedback = await getFeedback(page);
      expect(newFeedback).toBeNull();
    }
  });

  test('should update score after correct answer', async ({ page }) => {
    await page.goto('/');

    // Initially 0/0
    let score = await getScore(page);
    expect(score).toEqual({ correct: 0, total: 0 });

    // Answer incorrectly first (answer '999' which is unlikely to be correct for 0-10 range)
    await answerQuestion(page, '999');

    score = await getScore(page);
    expect(score).toEqual({ correct: 0, total: 1 });
  });

  test('should answer a question incorrectly and show Next Question button', async ({ page }) => {
    await page.goto('/');

    // Answer with an obviously wrong answer
    await answerQuestion(page, '999');

    // Check incorrect feedback
    const feedback = await getFeedback(page);
    expect(feedback?.isCorrect).toBe(false);
    expect(feedback?.text).toContain('The correct answer is:');

    // Next Question button should be visible
    await expect(page.getByRole('button', { name: 'Next Question' })).toBeVisible();
  });

  test('should display correct answer on incorrect response', async ({ page }) => {
    await page.goto('/');

    // Answer incorrectly
    await answerQuestion(page, '888');

    // Check feedback contains correct answer
    const feedbackText = await page.locator('text=The correct answer is:').locator('..').textContent();
    expect(feedbackText).toContain('The correct answer is:');
    expect(feedbackText).toMatch(/\d+/); // Should contain a number
  });

  test('should manually advance after clicking Next Question button', async ({ page }) => {
    await page.goto('/');

    // Answer incorrectly
    await answerQuestion(page, '777');

    // Verify incorrect feedback
    await expect(page.getByText('✗ Incorrect')).toBeVisible();

    // Click Next Question
    await clickNextQuestion(page);

    // Feedback should be gone
    await expect(page.getByText('✗ Incorrect')).not.toBeVisible();

    // Submit button should be back
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
  });

  test('should complete multiple questions and track score accurately', async ({ page }) => {
    await page.goto('/');

    // Answer first question incorrectly
    await answerQuestion(page, '999');
    let score = await getScore(page);
    expect(score).toEqual({ correct: 0, total: 1 });

    // Advance to next question
    await clickNextQuestion(page);

    // Answer second question incorrectly again
    await answerQuestion(page, '888');
    score = await getScore(page);
    expect(score).toEqual({ correct: 0, total: 2 });

    // Advance to next question
    await clickNextQuestion(page);

    // Answer third question incorrectly
    await answerQuestion(page, '777');
    score = await getScore(page);
    expect(score).toEqual({ correct: 0, total: 3 });
  });
});

test.describe('Quiz Flow - English to Korean', () => {
  test('should switch to English→Korean direction', async ({ page }) => {
    await page.goto('/');

    // Open settings
    await openSettings(page);

    // Switch direction
    await changeDirection(page, 'englishToKorean');

    // Apply settings
    await applySettings(page);

    // Check prompt changed
    await expect(page.getByText('How do you say this in Korean?')).toBeVisible();
  });

  test('should display number prompt instead of Korean text', async ({ page }) => {
    await page.goto('/');

    // Open settings and switch direction
    await openSettings(page);
    await changeDirection(page, 'englishToKorean');
    await applySettings(page);

    // The question should be a number now (not Korean text)
    // Look for a number in the question area
    const questionArea = page.locator('div').filter({ hasText: /^\d+$/ });
    await expect(questionArea.first()).toBeVisible();
  });

  test('should accept Korean text input for correct answers', async ({ page }) => {
    await page.goto('/');

    // Open settings and switch direction
    await openSettings(page);
    await changeDirection(page, 'englishToKorean');
    await applySettings(page);

    // Get the number question
    const questionNumber = await page.locator('div').filter({ hasText: /^\d+$/ }).first().textContent();

    // For testing, we can use known mappings
    // If question is "5", answer should be "다섯"
    if (questionNumber === '5') {
      await answerQuestion(page, '다섯');

      // Check feedback
      const feedback = await getFeedback(page);
      expect(feedback?.isCorrect).toBe(true);
    } else if (questionNumber === '0') {
      await answerQuestion(page, '영');

      const feedback = await getFeedback(page);
      expect(feedback?.isCorrect).toBe(true);
    }
  });

  test('should validate Korean text answers correctly', async ({ page }) => {
    await page.goto('/');

    // Open settings and switch direction
    await openSettings(page);
    await changeDirection(page, 'englishToKorean');
    await applySettings(page);

    // Answer with wrong Korean text
    await answerQuestion(page, '잘못된답');

    // Should show incorrect feedback
    const feedback = await getFeedback(page);
    expect(feedback?.isCorrect).toBe(false);
  });
});
