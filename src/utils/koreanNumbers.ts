export type NumberSystem = 'native' | 'sino';

// Native Korean numbers (0-99)
export const nativeKorean = [
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

/**
 * Converts a number to Sino-Korean representation
 * @param num - The number to convert (0-9999)
 * @returns The Sino-Korean representation as a string
 */
export const convertToSinoKorean = (num: number): string => {
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

/**
 * Gets the Korean text representation of a number based on the number system
 * @param num - The number to convert
 * @param numberSystem - The number system to use ('native' or 'sino')
 * @returns The Korean text representation
 */
export const getKoreanText = (num: number, numberSystem: NumberSystem): string => {
  if (numberSystem === 'native') {
    return num < nativeKorean.length ? nativeKorean[num] : '범위 초과';
  } else {
    return convertToSinoKorean(num);
  }
};

/**
 * Gets the maximum allowed number for a given number system
 * @param numberSystem - The number system ('native' or 'sino')
 * @returns The maximum allowed number
 */
export const getMaxNumber = (numberSystem: NumberSystem): number => {
  return numberSystem === 'native' ? 99 : 9999;
};
