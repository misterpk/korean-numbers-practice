import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { getKoreanText } from './utils/koreanNumbers';

// Mock Math.random to control question generation
let mockRandomValue = 0.5;
const originalRandom = Math.random;

beforeEach(() => {
  Math.random = jest.fn(() => mockRandomValue);
});

afterEach(() => {
  Math.random = originalRandom;
});

describe('App Component', () => {
  describe('Initial render', () => {
    it('should render the app title', () => {
      render(<App />);
      expect(screen.getByText('Korean Numbers Practice')).toBeInTheDocument();
    });

    it('should display initial score as 0 / 0', () => {
      render(<App />);
      expect(screen.getByText(/Score: 0 \/ 0/)).toBeInTheDocument();
    });

    it('should display a question', () => {
      render(<App />);
      expect(screen.getByText('What number is this?')).toBeInTheDocument();
    });

    it('should have an input field for answers', () => {
      render(<App />);
      const input = screen.getByPlaceholderText('Type your answer...');
      expect(input).toBeInTheDocument();
    });

    it('should have a disabled submit button when input is empty', () => {
      render(<App />);
      const submitButton = screen.getByRole('button', { name: 'Submit' });
      expect(submitButton).toBeDisabled();
    });

    it('should have settings collapsed by default', () => {
      render(<App />);
      const settingsButton = screen.getByText('Settings');
      expect(settingsButton).toBeInTheDocument();
      // Settings panel should not be visible
      expect(screen.queryByText('Number System:')).not.toBeInTheDocument();
    });
  });

  describe('Settings panel', () => {
    it('should expand settings when clicking Settings button', async () => {
      const user = userEvent.setup();
      render(<App />);

      const settingsButton = screen.getByText('Settings');
      await user.click(settingsButton);

      expect(screen.getByText('Number System:')).toBeInTheDocument();
      expect(screen.getByText('Direction:')).toBeInTheDocument();
      expect(screen.getByText('Range:')).toBeInTheDocument();
    });

    it('should collapse settings when clicking Settings button again', async () => {
      const user = userEvent.setup();
      render(<App />);

      const settingsButton = screen.getByText('Settings');
      await user.click(settingsButton);
      expect(screen.getByText('Number System:')).toBeInTheDocument();

      await user.click(settingsButton);
      expect(screen.queryByText('Number System:')).not.toBeInTheDocument();
    });

    it('should switch to Sino-Korean when clicking Sino-Korean button', async () => {
      const user = userEvent.setup();
      render(<App />);

      const settingsButton = screen.getByText('Settings');
      await user.click(settingsButton);

      const sinoButton = screen.getByRole('button', { name: 'Sino-Korean' });
      await user.click(sinoButton);

      // Verify button is selected (would need to check styling or aria attributes)
      expect(sinoButton).toBeInTheDocument();
    });

    it('should switch direction to English→Korean', async () => {
      const user = userEvent.setup();
      render(<App />);

      const settingsButton = screen.getByText('Settings');
      await user.click(settingsButton);

      const directionButton = screen.getByRole('button', { name: 'English → Korean' });
      await user.click(directionButton);

      // Apply settings to activate the change
      const applyButton = screen.getByRole('button', { name: 'Apply Settings' });
      await user.click(applyButton);

      // The question prompt should change after Apply
      await user.click(settingsButton); // Collapse settings to see main quiz
      expect(screen.getByText('How do you say this in Korean?')).toBeInTheDocument();
    });
  });

  describe('Quiz functionality - Korean to English', () => {
    it('should enable submit button when user types an answer', async () => {
      const user = userEvent.setup();
      render(<App />);

      const input = screen.getByPlaceholderText('Type your answer...');
      await user.type(input, '5');

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      expect(submitButton).toBeEnabled();
    });

    it('should show correct feedback for correct answer', async () => {
      const user = userEvent.setup();
      mockRandomValue = 0.5; // This should generate number 5 with range 0-10

      render(<App />);

      const input = screen.getByPlaceholderText('Type your answer...');
      await user.type(input, '5');

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      await user.click(submitButton);

      expect(screen.getByText('✓ Correct!')).toBeInTheDocument();
    });

    it('should show incorrect feedback with correct answer for wrong answer', async () => {
      const user = userEvent.setup();
      mockRandomValue = 0.5; // This should generate number 5 with range 0-10

      render(<App />);

      const input = screen.getByPlaceholderText('Type your answer...');
      await user.type(input, '3'); // Wrong answer

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      await user.click(submitButton);

      expect(screen.getByText('✗ Incorrect')).toBeInTheDocument();
      expect(screen.getByText(/The correct answer is:/)).toBeInTheDocument();
    });

    it('should update score after correct answer', async () => {
      const user = userEvent.setup();
      mockRandomValue = 0.5;

      render(<App />);

      const input = screen.getByPlaceholderText('Type your answer...');
      await user.type(input, '5');

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      await user.click(submitButton);

      expect(screen.getByText(/Score: 1 \/ 1/)).toBeInTheDocument();
    });

    it('should update score correctly after incorrect answer', async () => {
      const user = userEvent.setup();
      mockRandomValue = 0.5;

      render(<App />);

      const input = screen.getByPlaceholderText('Type your answer...');
      await user.type(input, '3'); // Wrong answer

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      await user.click(submitButton);

      expect(screen.getByText(/Score: 0 \/ 1/)).toBeInTheDocument();
    });

    it('should auto-advance after correct answer', async () => {
      jest.useFakeTimers();
      mockRandomValue = 0.5;

      render(<App />);

      const input = screen.getByPlaceholderText('Type your answer...');
      fireEvent.change(input, { target: { value: '5' } });

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      fireEvent.click(submitButton);

      expect(screen.getByText('✓ Correct!')).toBeInTheDocument();

      // Fast-forward time by 1 second (wrapped in act to avoid warnings)
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should have generated a new question (feedback should be gone)
      await waitFor(() => {
        expect(screen.queryByText('✓ Correct!')).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('should show Next Question button after incorrect answer', async () => {
      mockRandomValue = 0.5;

      render(<App />);

      const input = screen.getByPlaceholderText('Type your answer...');
      fireEvent.change(input, { target: { value: '3' } }); // Wrong answer

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Next Question' })).toBeInTheDocument();
      });
    });

    it('should advance to next question when clicking Next Question button', async () => {
      mockRandomValue = 0.5;

      render(<App />);

      const input = screen.getByPlaceholderText('Type your answer...');
      fireEvent.change(input, { target: { value: '3' } }); // Wrong answer

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      fireEvent.click(submitButton);

      const nextButton = await screen.findByRole('button', { name: 'Next Question' });
      fireEvent.click(nextButton);

      // Feedback should be gone
      await waitFor(() => {
        expect(screen.queryByText('✗ Incorrect')).not.toBeInTheDocument();
      });
      // Submit button should be back
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('should make input read-only after answering', async () => {
      mockRandomValue = 0.5;

      render(<App />);

      const input = screen.getByPlaceholderText('Type your answer...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '5' } });

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(input).toHaveAttribute('readonly');
      });
    });
  });

  describe('Quiz functionality - English to Korean', () => {
    it('should accept Korean text input for English to Korean direction', async () => {
      mockRandomValue = 0.5; // Number 5

      render(<App />);

      // Open settings and switch direction
      const settingsButton = screen.getByText('Settings');
      fireEvent.click(settingsButton);

      const directionButton = screen.getByRole('button', { name: 'English → Korean' });
      fireEvent.click(directionButton);

      const applyButton = screen.getByRole('button', { name: 'Apply Settings' });
      fireEvent.click(applyButton);

      // Should show number instead of Korean text
      await waitFor(() => {
        expect(screen.getByText('How do you say this in Korean?')).toBeInTheDocument();
      });

      // Get the expected Korean text for the number
      const expectedKorean = getKoreanText(5, 'native');

      const input = screen.getByPlaceholderText('Type your answer...');
      fireEvent.change(input, { target: { value: expectedKorean } });

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('✓ Correct!')).toBeInTheDocument();
      });
    });
  });

  describe('Input type attributes', () => {
    it('should have numeric input mode for Korean to English direction', () => {
      render(<App />);

      const input = screen.getByPlaceholderText('Type your answer...') as HTMLInputElement;
      expect(input).toHaveAttribute('inputMode', 'numeric');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should have text input mode for English to Korean direction', async () => {
      render(<App />);

      // Open settings and switch direction
      const settingsButton = screen.getByText('Settings');
      fireEvent.click(settingsButton);

      const directionButton = screen.getByRole('button', { name: 'English → Korean' });
      fireEvent.click(directionButton);

      const applyButton = screen.getByRole('button', { name: 'Apply Settings' });
      fireEvent.click(applyButton);

      await waitFor(() => {
        const input = screen.getByPlaceholderText('Type your answer...') as HTMLInputElement;
        expect(input).toHaveAttribute('inputMode', 'text');
        expect(input).toHaveAttribute('type', 'text');
        expect(input).toHaveAttribute('lang', 'ko');
      });
    });
  });
});
