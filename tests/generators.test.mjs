import { describe, it, expect } from 'vitest';
import mockdrop from '../src/index.js';

describe('internet generator', () => {
  it('email() produces a valid-looking address', () => {
    for (let i = 0; i < 50; i++) {
      expect(mockdrop.email()).toMatch(/^[a-z0-9._]+@[a-z0-9.-]+\.[a-z]+$/i);
    }
  });

  it('email() honors a custom domain', () => {
    for (let i = 0; i < 20; i++) {
      expect(mockdrop.email({ domain: 'mailinator.com' })).toMatch(/@mailinator\.com$/);
    }
  });

  it('email() honors provided first/last name', () => {
    const email = mockdrop.email({ firstName: 'Jayesh', lastName: 'Goswami', domain: 'mailinator.com' });
    expect(email).toMatch(/^jayesh[._]?goswami\d*@mailinator\.com$/);
  });

  it('ip() stays within valid octet ranges', () => {
    for (let i = 0; i < 50; i++) {
      const octets = mockdrop.ip().split('.').map(Number);
      expect(octets).toHaveLength(4);
      for (const o of octets) {
        expect(o).toBeGreaterThanOrEqual(0);
        expect(o).toBeLessThanOrEqual(255);
      }
    }
  });

  it('color() returns a 6-digit hex code', () => {
    for (let i = 0; i < 50; i++) {
      expect(mockdrop.internet.color()).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe('date generator', () => {
  it('past()/pastDate() return dates before now', () => {
    for (let i = 0; i < 20; i++) {
      expect(mockdrop.past().getTime()).toBeLessThanOrEqual(Date.now());
      expect(mockdrop.pastDate().getTime()).toBeLessThanOrEqual(Date.now());
    }
  });

  it('future()/futureDate() return dates after now', () => {
    for (let i = 0; i < 20; i++) {
      expect(mockdrop.future().getTime()).toBeGreaterThanOrEqual(Date.now());
      expect(mockdrop.futureDate().getTime()).toBeGreaterThanOrEqual(Date.now());
    }
  });

  it('between() stays inside the given range', () => {
    const from = new Date('2020-01-01');
    const to = new Date('2021-01-01');
    for (let i = 0; i < 20; i++) {
      const d = mockdrop.between(from, to);
      expect(d.getTime()).toBeGreaterThanOrEqual(from.getTime());
      expect(d.getTime()).toBeLessThanOrEqual(to.getTime());
    }
  });

  it('iso() returns a parseable ISO string', () => {
    const iso = mockdrop.iso();
    expect(new Date(iso).toISOString()).toBe(iso);
  });
});

describe('finance generator', () => {
  it('amountRaw() respects bounds', () => {
    for (let i = 0; i < 50; i++) {
      const v = mockdrop.amountRaw(100, 200);
      expect(v).toBeGreaterThanOrEqual(100);
      expect(v).toBeLessThanOrEqual(200);
    }
  });

  it('amount() formats with thousands separators and two decimals', () => {
    expect(mockdrop.amount(1000, 50000)).toMatch(/^\d{1,3}(,\d{3})*\.\d{2}$/);
  });

  it('currency() returns code, symbol, and name', () => {
    const c = mockdrop.currency();
    expect(c).toHaveProperty('code');
    expect(c).toHaveProperty('symbol');
    expect(c).toHaveProperty('name');
  });

  it('creditCardFull() groups digits correctly', () => {
    for (let i = 0; i < 20; i++) {
      expect(mockdrop.creditCardFull()).toMatch(/^\d{4} (\d{4} \d{4} \d{4}|\d{6} \d{5})$/);
    }
  });
});

describe('system generator', () => {
  it('uuid() matches RFC 4122 v4 shape', () => {
    for (let i = 0; i < 50; i++) {
      expect(mockdrop.uuid()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    }
  });

  it('objectId() is a 24-char hex string', () => {
    expect(mockdrop.objectId()).toMatch(/^[0-9a-f]{24}$/);
  });

  it('semver() has three numeric parts', () => {
    expect(mockdrop.semver()).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe('lorem generator', () => {
  it('sentence() is capitalized and ends with a period', () => {
    const s = mockdrop.sentence();
    expect(s[0]).toBe(s[0].toUpperCase());
    expect(s.endsWith('.')).toBe(true);
  });

  it('words() returns the requested word count', () => {
    expect(mockdrop.words(7).split(' ')).toHaveLength(7);
  });

  it('slug() is lowercase and hyphenated', () => {
    expect(mockdrop.slug(3)).toMatch(/^[a-z]+(-[a-z]+){2}$/);
  });
});

describe('helpers generator', () => {
  it('unique() returns distinct values', () => {
    const values = mockdrop.helpers.unique(() => mockdrop.helpers.int(1, 1000), 50);
    expect(new Set(values).size).toBe(50);
  });

  it('unique() throws when the value space is too small', () => {
    expect(() => mockdrop.helpers.unique(() => 1, 2, 3)).toThrow();
  });

  it('maybe() respects probability extremes', () => {
    expect(mockdrop.helpers.maybe(() => 'x', 1)).toBe('x');
    expect(mockdrop.helpers.maybe(() => 'x', 0)).toBeNull();
  });

  it('replicate() calls the factory count times', () => {
    const result = mockdrop.helpers.replicate(() => mockdrop.helpers.bool(), 5);
    expect(result).toHaveLength(5);
  });

  it('pick() handles empty input gracefully', () => {
    expect(mockdrop.helpers.pick([])).toBeUndefined();
    expect(mockdrop.helpers.pick(null)).toBeUndefined();
  });
});

describe('person generator', () => {
  it('age() respects custom bounds', () => {
    for (let i = 0; i < 50; i++) {
      const a = mockdrop.age(30, 40);
      expect(a).toBeGreaterThanOrEqual(30);
      expect(a).toBeLessThanOrEqual(40);
    }
  });

  it('phone() supports region formats', () => {
    expect(mockdrop.person.phone('US')).toMatch(/^\+1 \(\d{3}\) \d{3}-\d{4}$/);
    expect(mockdrop.person.phone('IN')).toMatch(/^\+91 \d{5} \d{5}$/);
  });
});
