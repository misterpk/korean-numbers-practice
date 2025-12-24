import {
  convertToSinoKorean,
  getKoreanText,
  getMaxNumber,
  nativeKorean,
  NumberSystem
} from './koreanNumbers';

describe('convertToSinoKorean', () => {
  describe('edge cases', () => {
    it('should return 영 for 0', () => {
      expect(convertToSinoKorean(0)).toBe('영');
    });
  });

  describe('single digits (1-9)', () => {
    const cases: [number, string][] = [
      [1, '일'],
      [2, '이'],
      [3, '삼'],
      [4, '사'],
      [5, '오'],
      [6, '육'],
      [7, '칠'],
      [8, '팔'],
      [9, '구']
    ];

    test.each(cases)('should convert %i to %s', (num, expected) => {
      expect(convertToSinoKorean(num)).toBe(expected);
    });
  });

  describe('tens (10-90)', () => {
    it('should convert 10 to 십 (not 일십)', () => {
      expect(convertToSinoKorean(10)).toBe('십');
    });

    it('should convert 20 to 이십', () => {
      expect(convertToSinoKorean(20)).toBe('이십');
    });

    it('should convert 50 to 오십', () => {
      expect(convertToSinoKorean(50)).toBe('오십');
    });

    it('should convert 90 to 구십', () => {
      expect(convertToSinoKorean(90)).toBe('구십');
    });
  });

  describe('compound numbers', () => {
    it('should convert 11 to 십일', () => {
      expect(convertToSinoKorean(11)).toBe('십일');
    });

    it('should convert 25 to 이십오', () => {
      expect(convertToSinoKorean(25)).toBe('이십오');
    });

    it('should convert 99 to 구십구', () => {
      expect(convertToSinoKorean(99)).toBe('구십구');
    });
  });

  describe('hundreds', () => {
    it('should convert 100 to 백 (not 일백)', () => {
      expect(convertToSinoKorean(100)).toBe('백');
    });

    it('should convert 200 to 이백', () => {
      expect(convertToSinoKorean(200)).toBe('이백');
    });

    it('should convert 500 to 오백', () => {
      expect(convertToSinoKorean(500)).toBe('오백');
    });

    it('should convert 123 to 백이십삼', () => {
      expect(convertToSinoKorean(123)).toBe('백이십삼');
    });

    it('should convert 999 to 구백구십구', () => {
      expect(convertToSinoKorean(999)).toBe('구백구십구');
    });
  });

  describe('thousands', () => {
    it('should convert 1000 to 천 (not 일천)', () => {
      expect(convertToSinoKorean(1000)).toBe('천');
    });

    it('should convert 2000 to 이천', () => {
      expect(convertToSinoKorean(2000)).toBe('이천');
    });

    it('should convert 5000 to 오천', () => {
      expect(convertToSinoKorean(5000)).toBe('오천');
    });

    it('should convert 1234 to 천이백삼십사', () => {
      expect(convertToSinoKorean(1234)).toBe('천이백삼십사');
    });

    it('should convert 5678 to 오천육백칠십팔', () => {
      expect(convertToSinoKorean(5678)).toBe('오천육백칠십팔');
    });

    it('should convert 9999 to 구천구백구십구', () => {
      expect(convertToSinoKorean(9999)).toBe('구천구백구십구');
    });
  });

  describe('numbers with zeros', () => {
    it('should convert 101 to 백일', () => {
      expect(convertToSinoKorean(101)).toBe('백일');
    });

    it('should convert 1001 to 천일', () => {
      expect(convertToSinoKorean(1001)).toBe('천일');
    });

    it('should convert 1010 to 천십', () => {
      expect(convertToSinoKorean(1010)).toBe('천십');
    });

    it('should convert 1100 to 천백', () => {
      expect(convertToSinoKorean(1100)).toBe('천백');
    });

    it('should convert 2005 to 이천오', () => {
      expect(convertToSinoKorean(2005)).toBe('이천오');
    });
  });
});

describe('nativeKorean', () => {
  it('should have exactly 100 entries (0-99)', () => {
    expect(nativeKorean).toHaveLength(100);
  });

  it('should start with 영 for 0', () => {
    expect(nativeKorean[0]).toBe('영');
  });

  it('should have 하나 for 1', () => {
    expect(nativeKorean[1]).toBe('하나');
  });

  it('should have 열 for 10', () => {
    expect(nativeKorean[10]).toBe('열');
  });

  it('should have 스물 for 20', () => {
    expect(nativeKorean[20]).toBe('스물');
  });

  it('should have 아흔아홉 for 99', () => {
    expect(nativeKorean[99]).toBe('아흔아홉');
  });
});

describe('getKoreanText', () => {
  describe('native Korean system', () => {
    const numberSystem: NumberSystem = 'native';

    it('should return correct native Korean for 0', () => {
      expect(getKoreanText(0, numberSystem)).toBe('영');
    });

    it('should return correct native Korean for 1', () => {
      expect(getKoreanText(1, numberSystem)).toBe('하나');
    });

    it('should return correct native Korean for 10', () => {
      expect(getKoreanText(10, numberSystem)).toBe('열');
    });

    it('should return correct native Korean for 50', () => {
      expect(getKoreanText(50, numberSystem)).toBe('쉰');
    });

    it('should return correct native Korean for 99', () => {
      expect(getKoreanText(99, numberSystem)).toBe('아흔아홉');
    });

    it('should return 범위 초과 for numbers >= 100', () => {
      expect(getKoreanText(100, numberSystem)).toBe('범위 초과');
      expect(getKoreanText(1000, numberSystem)).toBe('범위 초과');
    });
  });

  describe('Sino-Korean system', () => {
    const numberSystem: NumberSystem = 'sino';

    it('should return correct Sino-Korean for 0', () => {
      expect(getKoreanText(0, numberSystem)).toBe('영');
    });

    it('should return correct Sino-Korean for 1', () => {
      expect(getKoreanText(1, numberSystem)).toBe('일');
    });

    it('should return correct Sino-Korean for 10', () => {
      expect(getKoreanText(10, numberSystem)).toBe('십');
    });

    it('should return correct Sino-Korean for 100', () => {
      expect(getKoreanText(100, numberSystem)).toBe('백');
    });

    it('should return correct Sino-Korean for 1234', () => {
      expect(getKoreanText(1234, numberSystem)).toBe('천이백삼십사');
    });

    it('should return correct Sino-Korean for 9999', () => {
      expect(getKoreanText(9999, numberSystem)).toBe('구천구백구십구');
    });
  });
});

describe('getMaxNumber', () => {
  it('should return 99 for native Korean system', () => {
    expect(getMaxNumber('native')).toBe(99);
  });

  it('should return 9999 for Sino-Korean system', () => {
    expect(getMaxNumber('sino')).toBe(9999);
  });
});
