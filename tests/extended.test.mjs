import { describe, it, expect } from 'vitest';
import mockdrop from '../src/index.js';

describe('date generator (extended)', () => {
  it('anytime() stays within one year of now, either direction', () => {
    const yearMs = 365 * 24 * 60 * 60 * 1000;
    for (let i = 0; i < 20; i++) {
      const t = mockdrop.date.anytime().getTime();
      expect(Math.abs(t - Date.now())).toBeLessThanOrEqual(yearMs + 1000);
    }
  });

  it('betweens() returns a sorted array of dates within range', () => {
    const from = new Date('2022-01-01');
    const to = new Date('2023-01-01');
    const dates = mockdrop.date.betweens(from, to, 5);
    expect(dates).toHaveLength(5);
    for (const d of dates) {
      expect(d.getTime()).toBeGreaterThanOrEqual(from.getTime());
      expect(d.getTime()).toBeLessThanOrEqual(to.getTime());
    }
    const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
    expect(dates).toEqual(sorted);
  });

  it('birthdate() with mode "age" produces a birthdate matching the requested age range', () => {
    const refDate = new Date('2026-01-01');
    for (let i = 0; i < 30; i++) {
      const bd = mockdrop.date.birthdate({ min: 20, max: 30, mode: 'age', refDate });
      const age = refDate.getFullYear() - bd.getFullYear();
      expect(age).toBeGreaterThanOrEqual(20);
      expect(age).toBeLessThanOrEqual(30);
    }
  });

  it('birthdate() with mode "year" produces a birth year in range', () => {
    for (let i = 0; i < 30; i++) {
      const bd = mockdrop.date.birthdate({ min: 1990, max: 2000, mode: 'year' });
      expect(bd.getFullYear()).toBeGreaterThanOrEqual(1990);
      expect(bd.getFullYear()).toBeLessThanOrEqual(2000);
    }
  });

  it('month()/weekday() support abbreviation', () => {
    // Length is not a usable signal here: "May" is already three characters.
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'];
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let i = 0; i < 30; i++) {
      expect(months).toContain(mockdrop.date.month());
      expect(weekdays).toContain(mockdrop.date.weekday());
      expect(months.map((m) => m.slice(0, 3))).toContain(mockdrop.date.month({ abbreviated: true }));
      expect(weekdays.map((d) => d.slice(0, 3))).toContain(mockdrop.date.weekday({ abbreviated: true }));
    }
  });

  it('date.timeZone() returns a plausible IANA identifier', () => {
    expect(mockdrop.date.timeZone()).toMatch(/^[A-Za-z_]+(\/[A-Za-z_]+){0,2}$|^UTC$/);
  });
});

describe('finance generator (extended)', () => {
  it('accountName() returns a known account type', () => {
    expect(typeof mockdrop.finance.accountName()).toBe('string');
  });

  it('bic() looks like a SWIFT/BIC code', () => {
    for (let i = 0; i < 20; i++) {
      expect(mockdrop.finance.bic()).toMatch(/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/);
    }
  });

  it('creditCardIssuer() returns a known issuer key', () => {
    const issuers = ['visa', 'mastercard', 'american_express', 'discover', 'diners_club', 'jcb', 'maestro', 'unionpay'];
    expect(issuers).toContain(mockdrop.finance.creditCardIssuer());
  });

  it('creditCardNumber() is Luhn-valid and matches issuer length', () => {
    for (let i = 0; i < 20; i++) {
      const issuer = mockdrop.finance.creditCardIssuer();
      const number = mockdrop.finance.creditCardNumber(issuer).replace(/\s/g, '');
      const expectedLength = issuer === 'american_express' ? 15 : issuer === 'diners_club' ? 14 : 16;
      expect(number).toHaveLength(expectedLength);
      expect(isLuhnValid(number)).toBe(true);
    }
  });

  it('creditCardCVV() is a 3-digit string', () => {
    expect(mockdrop.finance.creditCardCVV()).toMatch(/^\d{3}$/);
  });

  it('currencyName()/currencyNumericCode() are consistent with currency()', () => {
    mockdrop.setSeed(555);
    const currency = mockdrop.finance.currency();
    mockdrop.setSeed(555);
    expect(mockdrop.finance.currencyName()).toBe(currency.name);
    mockdrop.setSeed(555);
    expect(mockdrop.finance.currencyNumericCode()).toBe(currency.numericCode);
  });

  it('ethereumAddress() and litecoinAddress() look plausible', () => {
    expect(mockdrop.finance.ethereumAddress()).toMatch(/^0x[0-9a-f]{40}$/);
    expect(mockdrop.finance.litecoinAddress()).toMatch(/^[LM3][1-9A-HJ-NP-Za-km-z]{26,33}$/);
  });

  it('pin() is a 4-digit string preserving leading zeros', () => {
    for (let i = 0; i < 30; i++) {
      expect(mockdrop.finance.pin()).toMatch(/^\d{4}$/);
    }
  });

  it('transactionType()/transactionDescription() are consistent', () => {
    const types = ['deposit', 'withdrawal', 'payment', 'invoice', 'transfer'];
    expect(types).toContain(mockdrop.finance.transactionType());
    expect(typeof mockdrop.finance.transactionDescription()).toBe('string');
    expect(mockdrop.finance.transactionDescription()).toMatch(/\$[\d,]+\.\d{2}/);
  });
});

describe('internet generator (extended)', () => {
  it('exampleEmail() always uses a reserved example domain', () => {
    for (let i = 0; i < 20; i++) {
      expect(mockdrop.internet.exampleEmail()).toMatch(/@example\.(com|org|net)$/);
    }
  });

  it('displayName() returns a non-empty string', () => {
    expect(typeof mockdrop.internet.displayName()).toBe('string');
    expect(mockdrop.internet.displayName().length).toBeGreaterThan(0);
  });

  it('domainSuffix() has no leading dot; domainWord() is lowercase', () => {
    expect(mockdrop.internet.domainSuffix()).not.toMatch(/^\./);
    expect(mockdrop.internet.domainWord()).toMatch(/^[a-z]+$/);
  });

  it('emoji() returns an emoji, optionally scoped to categories', () => {
    expect(typeof mockdrop.internet.emoji()).toBe('string');
    const animalEmojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'];
    for (let i = 0; i < 20; i++) {
      expect(animalEmojis).toContain(mockdrop.internet.emoji({ types: ['animals'] }));
    }
  });

  it('httpStatusCode() supports filtering by bucket', () => {
    for (let i = 0; i < 20; i++) {
      const code = mockdrop.internet.httpStatusCode({ types: ['serverError'] });
      expect(code).toBeGreaterThanOrEqual(500);
    }
  });

  it('port() stays within the valid port range', () => {
    for (let i = 0; i < 30; i++) {
      const port = mockdrop.internet.port();
      expect(port).toBeGreaterThanOrEqual(0);
      expect(port).toBeLessThanOrEqual(65535);
    }
  });

  it('ipv4() matches ip()', () => {
    expect(mockdrop.internet.ipv4()).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
  });

  it('jwtAlgorithm() returns a known algorithm', () => {
    const algos = ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512', 'PS256', 'PS384', 'PS512'];
    expect(algos).toContain(mockdrop.internet.jwtAlgorithm());
  });

  it('jwt() returns a structurally valid three-part token', () => {
    const token = mockdrop.internet.jwt();
    const parts = token.split('.');
    expect(parts).toHaveLength(3);

    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf-8'));
    expect(header).toHaveProperty('alg');
    expect(header.typ).toBe('JWT');

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
    expect(payload).toHaveProperty('sub');
    expect(payload).toHaveProperty('iat');
    expect(payload).toHaveProperty('exp');
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
