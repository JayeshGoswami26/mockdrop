import { describe, it, expect } from 'vitest';
import mockdrop from '../src/index.js';

describe('phone generator', () => {
  it('number() supports region formats and defaults to US', () => {
    expect(mockdrop.phone.number()).toMatch(/^\+1 \(\d{3}\) \d{3}-\d{4}$/);
    expect(mockdrop.phone.number('UK')).toMatch(/^\+44 \d{4} \d{6}$/);
    expect(mockdrop.phone.number('IN')).toMatch(/^\+91 \d{5} \d{5}$/);
    expect(mockdrop.phone.number('INTERNATIONAL')).toMatch(/^\+\d{1,2} \d{10}$/);
  });

  it('imei() is a 15-digit, Luhn-valid identifier', () => {
    for (let i = 0; i < 30; i++) {
      const imei = mockdrop.phone.imei();
      expect(imei).toMatch(/^\d{2}-\d{6}-\d{6}-\d{1}$/);
      const digits = imei.replace(/-/g, '');
      expect(digits).toHaveLength(15);
      expect(isLuhnValid(digits)).toBe(true);
    }
  });
});

function isLuhnValid(numStr) {
  let sum = 0;
  let double = false;
  for (let i = numStr.length - 1; i >= 0; i--) {
    let n = Number(numStr[i]);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return sum % 10 === 0;
}
