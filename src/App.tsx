import { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import { NumberSystem, getKoreanText, getMaxNumber } from './utils/koreanNumbers'

type Direction = 'koreanToEnglish' | 'englishToKorean'

interface Feedback {
  isCorrect: boolean
  correctAnswer: string
}

interface Score {
  correct: number
  total: number
}

function App() {
  // Active settings (used for quiz generation)
  const [numberSystem, setNumberSystem] = useState<NumberSystem>('native');
  const [direction, setDirection] = useState<Direction>('koreanToEnglish');
  const [minRange, setMinRange] = useState<number>(0);
  const [maxRange, setMaxRange] = useState<number>(10);

  // Pending settings (edited in settings panel, applied on button click)
  const [pendingNumberSystem, setPendingNumberSystem] = useState<NumberSystem>('native');
  const [pendingDirection, setPendingDirection] = useState<Direction>('koreanToEnglish');
  const [pendingMinRange, setPendingMinRange] = useState<number>(0);
  const [pendingMaxRange, setPendingMaxRange] = useState<number>(10);

  const [settingsCollapsed, setSettingsCollapsed] = useState<boolean>(true);

  // Quiz state
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [score, setScore] = useState<Score>({ correct: 0, total: 0 });
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [recentNumbers, setRecentNumbers] = useState<number[]>([]);

  // Generate new question with improved randomization
  const generateQuestion = (): void => {
    const min = Math.max(0, minRange || 0);
    const max = Math.min(getMaxNumber(numberSystem), maxRange || 10);
    const range = max - min + 1;

    // If range is very small, just do simple random
    if (range <= 3) {
      const randomNum = Math.floor(Math.random() * range) + min;
      setCurrentNumber(randomNum);
      setUserAnswer('');
      setFeedback(null);
      setHasAnswered(false);
      return;
    }

    // Avoid recent numbers (last 5 questions)
    let randomNum;
    let attempts = 0;
    const maxAttempts = 50;

    do {
      randomNum = Math.floor(Math.random() * range) + min;
      attempts++;
    } while (recentNumbers.includes(randomNum) && attempts < maxAttempts);

    // Update recent numbers history (keep last 5)
    setRecentNumbers(prev => {
      const updated = [...prev, randomNum];
      return updated.slice(-5);
    });

    setCurrentNumber(randomNum);
    setUserAnswer('');
    setFeedback(null);
    setHasAnswered(false);
  };

  // Initialize with first question
  useEffect(() => {
    generateQuestion();
  }, []);

  const checkAnswer = (): void => {
    if (currentNumber === null) return;

    const correctAnswer = direction === 'koreanToEnglish'
      ? currentNumber.toString()
      : getKoreanText(currentNumber, numberSystem);

    const isCorrect = userAnswer.trim() === correctAnswer.trim();

    setFeedback({
      isCorrect,
      correctAnswer
    });
    setScore(prevScore => ({
      correct: prevScore.correct + (isCorrect ? 1 : 0),
      total: prevScore.total + 1
    }));
    setHasAnswered(true);

    // Auto-advance only if correct (after 1 second)
    // If incorrect, wait for user to manually advance so they can review
    if (isCorrect) {
      setTimeout(() => {
        generateQuestion();
      }, 1000);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!hasAnswered && userAnswer.trim()) {
      checkAnswer();
    } else if (hasAnswered) {
      // Allow Enter to advance after answering (useful for incorrect answers)
      generateQuestion();
    }
  };

  const applySettings = (): void => {
    // Apply pending settings to active settings
    setNumberSystem(pendingNumberSystem);
    setDirection(pendingDirection);
    setMinRange(pendingMinRange);
    setMaxRange(pendingMaxRange);
    // Generate new question with updated settings
    generateQuestion();
  };

  const prompt = currentNumber !== null
    ? (direction === 'koreanToEnglish' ? getKoreanText(currentNumber, numberSystem) : currentNumber)
    : '';

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', fontSize: 'clamp(24px, 6vw, 32px)' }}>Korean Numbers Practice</h1>

      {/* Quiz Area */}
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '30px' }}>
        {/* Score */}
        <div style={{ textAlign: 'right', marginBottom: '20px', color: '#666' }}>
          Score: {score.correct} / {score.total}
        </div>

        {/* Question */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
            {direction === 'koreanToEnglish' ? 'What number is this?' : 'How do you say this in Korean?'}
          </div>
          <div style={{ fontSize: 'clamp(36px, 10vw, 48px)', fontWeight: 'bold', marginBottom: '20px' }}>
            {prompt}
          </div>
        </div>

        {/* Answer Input */}
        <form onSubmit={handleSubmit}>
          <input
            type={direction === 'koreanToEnglish' ? 'number' : 'text'}
            inputMode={direction === 'koreanToEnglish' ? 'numeric' : 'text'}
            pattern={direction === 'koreanToEnglish' ? '[0-9]*' : undefined}
            lang={direction === 'englishToKorean' ? 'ko' : undefined}
            value={userAnswer}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setUserAnswer(e.target.value)}
            readOnly={hasAnswered}
            placeholder="Type your answer..."
            style={{
              width: '100%',
              padding: '12px',
              minHeight: '44px',
              fontSize: '18px',
              borderRadius: '4px',
              border: '2px solid #ddd',
              marginBottom: '15px',
              backgroundColor: hasAnswered ? '#f5f5f5' : '#fff',
              cursor: hasAnswered ? 'default' : 'text',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = '0 0 0 3px rgba(33, 150, 243, 0.3)';
              e.target.style.borderColor = '#2196F3';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = '#ddd';
            }}
            autoFocus
          />

          {!hasAnswered && (
            <button
              type="submit"
              disabled={!userAnswer.trim()}
              style={{
                width: '100%',
                padding: '12px',
                minHeight: '44px',
                fontSize: '16px',
                backgroundColor: userAnswer.trim() ? '#4CAF50' : '#ccc',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: userAnswer.trim() ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
                outline: 'none'
              }}
              onFocus={(e) => {
                if (userAnswer.trim()) {
                  e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.3)';
                }
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
              }}
            >
              Submit
            </button>
          )}
        </form>

        {/* Feedback */}
        {feedback && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            borderRadius: '4px',
            backgroundColor: feedback.isCorrect ? '#d4edda' : '#f8d7da',
            color: feedback.isCorrect ? '#155724' : '#721c24',
            border: `1px solid ${feedback.isCorrect ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
              {feedback.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </div>
            {!feedback.isCorrect && (
              <div>The correct answer is: <strong>{feedback.correctAnswer}</strong></div>
            )}
          </div>
        )}

        {/* Next Button */}
        {hasAnswered && !feedback?.isCorrect && (
          <button
            onClick={generateQuestion}
            autoFocus
            style={{
              width: '100%',
              padding: '12px',
              minHeight: '44px',
              fontSize: '16px',
              backgroundColor: '#2196F3',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginTop: '15px',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = '0 0 0 3px rgba(33, 150, 243, 0.3)';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none';
            }}
          >
            Next Question
          </button>
        )}
      </div>

      {/* Settings Panel - Collapsible */}
      <div style={{ backgroundColor: '#f5f5f5', borderRadius: '8px', overflow: 'hidden' }}>
        <button
          onClick={() => {
            if (settingsCollapsed) {
              // Sync pending settings with active settings when opening
              setPendingNumberSystem(numberSystem);
              setPendingDirection(direction);
              setPendingMinRange(minRange);
              setPendingMaxRange(maxRange);
            }
            setSettingsCollapsed(!settingsCollapsed);
          }}
          style={{
            width: '100%',
            padding: '15px 20px',
            backgroundColor: '#e0e0e0',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            outline: 'none'
          }}
          onFocus={(e) => {
            e.target.style.boxShadow = '0 0 0 3px rgba(0, 0, 0, 0.2)';
          }}
          onBlur={(e) => {
            e.target.style.boxShadow = 'none';
          }}
        >
          <span>Settings</span>
          <span style={{ fontSize: '20px' }}>{settingsCollapsed ? '▼' : '▲'}</span>
        </button>

        {!settingsCollapsed && (
          <div style={{ padding: '20px' }}>
            {/* Number System Toggle */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Number System:</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setPendingNumberSystem('native')}
                  style={{
                    padding: '12px 16px',
                    minHeight: '44px',
                    flex: '1 1 auto',
                    backgroundColor: pendingNumberSystem === 'native' ? '#4CAF50' : '#fff',
                    color: pendingNumberSystem === 'native' ? '#fff' : '#000',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.3)';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Native Korean
                </button>
                <button
                  onClick={() => setPendingNumberSystem('sino')}
                  style={{
                    padding: '12px 16px',
                    minHeight: '44px',
                    flex: '1 1 auto',
                    backgroundColor: pendingNumberSystem === 'sino' ? '#4CAF50' : '#fff',
                    color: pendingNumberSystem === 'sino' ? '#fff' : '#000',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.3)';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Sino-Korean
                </button>
              </div>
            </div>

            {/* Direction Toggle */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Direction:</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setPendingDirection('koreanToEnglish')}
                  style={{
                    padding: '12px 16px',
                    minHeight: '44px',
                    flex: '1 1 auto',
                    backgroundColor: pendingDirection === 'koreanToEnglish' ? '#2196F3' : '#fff',
                    color: pendingDirection === 'koreanToEnglish' ? '#fff' : '#000',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 0 0 3px rgba(33, 150, 243, 0.3)';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Korean → English
                </button>
                <button
                  onClick={() => setPendingDirection('englishToKorean')}
                  style={{
                    padding: '12px 16px',
                    minHeight: '44px',
                    flex: '1 1 auto',
                    backgroundColor: pendingDirection === 'englishToKorean' ? '#2196F3' : '#fff',
                    color: pendingDirection === 'englishToKorean' ? '#fff' : '#000',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 0 0 3px rgba(33, 150, 243, 0.3)';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  English → Korean
                </button>
              </div>
            </div>

            {/* Range Settings */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Range:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="number"
                  value={pendingMinRange}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPendingMinRange(Number(e.target.value))}
                  style={{ width: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  min="0"
                />
                <span>to</span>
                <input
                  type="number"
                  value={pendingMaxRange}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPendingMaxRange(Number(e.target.value))}
                  style={{ width: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  min="0"
                />
              </div>
            </div>

            {/* Apply Settings Button */}
            <button
              onClick={applySettings}
              style={{
                width: '100%',
                padding: '12px',
                minHeight: '44px',
                fontSize: '16px',
                backgroundColor: '#FF9800',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginTop: '15px',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 0 0 3px rgba(255, 152, 0, 0.3)';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
              }}
            >
              Apply Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
