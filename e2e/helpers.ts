import { Page, expect } from '@playwright/test';

/**
 * Helper utilities for E2E tests
 */

/**
 * Fill in answer and submit the quiz form
 */
export async function answerQuestion(page: Page, answer: string) {
  const input = page.getByPlaceholder('Type your answer...');
  await input.fill(answer);

  const submitButton = page.getByRole('button', { name: 'Submit' });
  await submitButton.click();
}

/**
 * Get the current score as an object with correct and total
 */
export async function getScore(page: Page): Promise<{ correct: number; total: number }> {
  const scoreText = await page.locator('text=/Score: \\d+ \\/ \\d+/').textContent();
  const match = scoreText?.match(/Score: (\d+) \/ (\d+)/);

  if (!match) {
    throw new Error(`Could not parse score from: ${scoreText}`);
  }

  return {
    correct: parseInt(match[1]),
    total: parseInt(match[2])
  };
}

/**
 * Open the settings panel
 */
export async function openSettings(page: Page) {
  // Match Settings button with icon (not "Apply Settings")
  const settingsButton = page.getByRole('button', { name: /^Settings/ });
  await settingsButton.click();

  // Wait for settings panel to be visible
  await expect(page.getByText('Number System:')).toBeVisible();
}

/**
 * Change the number system (native or sino)
 */
export async function changeNumberSystem(page: Page, system: 'native' | 'sino') {
  const buttonName = system === 'native' ? 'Native Korean' : 'Sino-Korean';
  const button = page.getByRole('button', { name: buttonName });
  await button.click();
}

/**
 * Change the quiz direction
 */
export async function changeDirection(page: Page, direction: 'koreanToEnglish' | 'englishToKorean') {
  const buttonName = direction === 'koreanToEnglish' ? 'Korean → English' : 'English → Korean';
  const button = page.getByRole('button', { name: buttonName });
  await button.click();
}

/**
 * Apply settings changes
 */
export async function applySettings(page: Page) {
  const applyButton = page.getByRole('button', { name: 'Apply Settings' });
  await applyButton.click();
}

/**
 * Change the number range
 */
export async function changeRange(page: Page, min: number, max: number) {
  const inputs = page.getByRole('spinbutton');
  const minInput = inputs.first();
  const maxInput = inputs.last();

  await minInput.fill(min.toString());
  await maxInput.fill(max.toString());
}

/**
 * Get the current question text
 */
export async function getCurrentQuestion(page: Page): Promise<string> {
  // The question is in the large bold text div
  const questionText = await page.locator('div').filter({ hasText: /^(영|하나|둘|셋|넷|다섯|여섯|일곱|여덟|아홉|열|\d+)$/ }).first().textContent();
  return questionText || '';
}

/**
 * Wait for a new question to appear (different from current)
 */
export async function waitForNewQuestion(page: Page, previousQuestion: string) {
  await page.waitForFunction(
    (prev) => {
      const questionDivs = Array.from(document.querySelectorAll('div'));
      const questionDiv = questionDivs.find(div => {
        const text = div.textContent;
        return text && text !== prev && /^(영|하나|둘|셋|넷|다섯|여섯|일곱|여덟|아홉|열|\d+)$/.test(text);
      });
      return questionDiv !== undefined;
    },
    previousQuestion,
    { timeout: 5000 }
  );
}

/**
 * Click the Next Question button (appears after incorrect answer)
 */
export async function clickNextQuestion(page: Page) {
  const nextButton = page.getByRole('button', { name: 'Next Question' });
  await nextButton.click();
}

/**
 * Check if feedback is displayed
 */
export async function getFeedback(page: Page): Promise<{ isCorrect: boolean; text: string } | null> {
  const correctFeedback = page.getByText('✓ Correct!');
  const incorrectFeedback = page.getByText('✗ Incorrect');

  const isCorrectVisible = await correctFeedback.isVisible().catch(() => false);
  const isIncorrectVisible = await incorrectFeedback.isVisible().catch(() => false);

  if (isCorrectVisible) {
    return { isCorrect: true, text: await correctFeedback.textContent() || '' };
  } else if (isIncorrectVisible) {
    const fullText = await page.locator('text=✗ Incorrect').locator('..').textContent();
    return { isCorrect: false, text: fullText || '' };
  }

  return null;
}
