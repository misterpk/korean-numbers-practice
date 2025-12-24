import { useState, useEffect } from 'react'

function App() {
  // Native Korean numbers (0-99)
  const nativeKorean = [
    '영', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉', '열',
    '열하나', '열둘', '열셋', '열넷', '열다섯', '열여섯', '열일곱', '열여덟', '열아홉', '스물',
    '스물하나', '스물둘', '스물셋', '스물넷', '스물다섯', '스물여섯', '스물일곱', '스물여덟', '스물아홉', '서른',
    '서른하나', '서른둘', '서른셋', '서른넷', '서른다섯', '서른여섯', '서른일곱', '서른여덟', '서른아홉', '마흔',
    '마흔하나', '마흔둘', '마흔셋', '마흔넷', '마흔다섯', '마흔여섯', '마흔일곱', '마흔여덟', '마흔아홉', '쉰',
    '쉰하나', '쉰둘', '쉰셋', '쉰넷', '쉰다섯', '쉰여섯', '쉰일곱', '쉰여덟', '쉰아홉', '예순',
    '예순하나', '예순둘', '예순셋', '예순넷', '예순다섯', '예순여섯', '예순일곱', '예순여덟', '예순아홉', '일흔',
    '일흔하나', '일흔둘', '일흔셋', '일흔넷', '일흔다섯', '일흔여섯', '일흔일곱', '일흔여덟', '일흔아홉', '여든',
    '여든하나', '여든둘', '여든셋', '여든넷', '여든다섯', '여든여섯', '여든일곱', '여든여덟', '여든아홉', '아흔',
    '아흔하나', '아흔둘', '아흔셋', '아흔넷', '아흔다섯', '아흔여섯', '아흔일곱', '아흔여덟', '아흔아홉'
  ];

  // Sino-Korean conversion
  const sinoKoreanDigits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  const sinoKoreanUnits = ['', '십', '백', '천'];

  const convertToSinoKorean = (num) => {
    if (num === 0) return '영';

    let result = '';
    const numStr = num.toString();
    const length = numStr.length;

    for (let i = 0; i < length; i++) {
      const digit = parseInt(numStr[i]);
      const position = length - i - 1;

      if (digit !== 0) {
        if (digit === 1 && position > 0) {
          result += sinoKoreanUnits[position];
        } else {
          result += sinoKoreanDigits[digit] + sinoKoreanUnits[position];
        }
      }
    }

    return result;
  };

  // Settings state
  const [numberSystem, setNumberSystem] = useState('native');
  const [direction, setDirection] = useState('koreanToEnglish');
  const [minRange, setMinRange] = useState(0);
  const [maxRange, setMaxRange] = useState(10);
  const [settingsCollapsed, setSettingsCollapsed] = useState(true);

  // Quiz state
  const [currentNumber, setCurrentNumber] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [hasAnswered, setHasAnswered] = useState(false);
  const [recentNumbers, setRecentNumbers] = useState([]);

  // Generate new question with improved randomization
  const generateQuestion = () => {
    const min = Math.max(0, parseInt(minRange) || 0);
    const max = Math.min(numberSystem === 'native' ? 99 : 9999, parseInt(maxRange) || 10);
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

  const getKoreanText = (num) => {
    if (numberSystem === 'native') {
      return num < nativeKorean.length ? nativeKorean[num] : '범위 초과';
    } else {
      return convertToSinoKorean(num);
    }
  };

  const checkAnswer = () => {
    const correctAnswer = direction === 'koreanToEnglish'
      ? currentNumber.toString()
      : getKoreanText(currentNumber);

    const isCorrect = userAnswer.trim() === correctAnswer.trim();

    setFeedback({
      isCorrect,
      correctAnswer
    });
    setScore({
      correct: score.correct + (isCorrect ? 1 : 0),
      total: score.total + 1
    });
    setHasAnswered(true);

    // Auto-advance only if correct (after 1 second)
    // If incorrect, wait for user to manually advance so they can review
    if (isCorrect) {
      setTimeout(() => {
        generateQuestion();
      }, 1000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasAnswered && userAnswer.trim()) {
      checkAnswer();
    } else if (hasAnswered) {
      // Allow Enter to advance after answering (useful for incorrect answers)
      generateQuestion();
    }
  };

  const prompt = direction === 'koreanToEnglish'
    ? getKoreanText(currentNumber)
    : currentNumber;

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
            onChange={(e) => setUserAnswer(e.target.value)}
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
              cursor: hasAnswered ? 'default' : 'text'
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
                fontWeight: 'bold'
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
        {hasAnswered && (
          <button
            onClick={generateQuestion}
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
              marginTop: '15px'
            }}
          >
            Next Question
          </button>
        )}
      </div>

      {/* Settings Panel - Collapsible */}
      <div style={{ backgroundColor: '#f5f5f5', borderRadius: '8px', overflow: 'hidden' }}>
        <button
          onClick={() => setSettingsCollapsed(!settingsCollapsed)}
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
            alignItems: 'center'
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
                  onClick={() => setNumberSystem('native')}
                  style={{
                    padding: '12px 16px',
                    minHeight: '44px',
                    flex: '1 1 auto',
                    backgroundColor: numberSystem === 'native' ? '#4CAF50' : '#fff',
                    color: numberSystem === 'native' ? '#fff' : '#000',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Native Korean
                </button>
                <button
                  onClick={() => setNumberSystem('sino')}
                  style={{
                    padding: '12px 16px',
                    minHeight: '44px',
                    flex: '1 1 auto',
                    backgroundColor: numberSystem === 'sino' ? '#4CAF50' : '#fff',
                    color: numberSystem === 'sino' ? '#fff' : '#000',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px'
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
                  onClick={() => setDirection('koreanToEnglish')}
                  style={{
                    padding: '12px 16px',
                    minHeight: '44px',
                    flex: '1 1 auto',
                    backgroundColor: direction === 'koreanToEnglish' ? '#2196F3' : '#fff',
                    color: direction === 'koreanToEnglish' ? '#fff' : '#000',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Korean → English
                </button>
                <button
                  onClick={() => setDirection('englishToKorean')}
                  style={{
                    padding: '12px 16px',
                    minHeight: '44px',
                    flex: '1 1 auto',
                    backgroundColor: direction === 'englishToKorean' ? '#2196F3' : '#fff',
                    color: direction === 'englishToKorean' ? '#fff' : '#000',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px'
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
                  value={minRange}
                  onChange={(e) => setMinRange(e.target.value)}
                  style={{ width: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  min="0"
                />
                <span>to</span>
                <input
                  type="number"
                  value={maxRange}
                  onChange={(e) => setMaxRange(e.target.value)}
                  style={{ width: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  min="0"
                />
              </div>
            </div>

            {/* Apply Settings Button */}
            <button
              onClick={generateQuestion}
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
                marginTop: '15px'
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
