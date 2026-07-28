import { describe, it, expect } from 'vitest';
import mockdrop, { Mockdrop } from '../src/index.js';

describe('mockdrop.create()', () => {
  it('generates the requested number of items', () => {
    const data = mockdrop.create({ name: mockdrop.fullName }, 20);
    expect(data).toHaveLength(20);
    for (const item of data) {
      expect(typeof item.name).toBe('string');
      expect(item.name.length).toBeGreaterThan(0);
    }
  });

  it('defaults to a single-item array when count is omitted', () => {
    const data = mockdrop.create({ id: mockdrop.uuid });
    expect(data).toHaveLength(1);
  });

  it('re-invokes generator functions per item (values vary across rows)', () => {
    const data = mockdrop.create({ id: () => mockdrop.uuid() }, 10);
    const unique = new Set(data.map((d) => d.id));
    expect(unique.size).toBe(10);
  });

  it('supports the lead-card schema from the README', () => {
    const leads = mockdrop.create({
      leadName: () => mockdrop.projectName(),
      leadDescription: () => mockdrop.projectDescription(),
      leadAmount: () => mockdrop.amount(1000, 50000),
      leadCreatedAt: () => mockdrop.pastDate(),
      leadCreatedBy: () => mockdrop.user.name(),
      leadSource: () => mockdrop.platformName(),
    }, 5);

    expect(leads).toHaveLength(5);
    for (const lead of leads) {
      expect(typeof lead.leadName).toBe('string');
      expect(typeof lead.leadDescription).toBe('string');
      expect(typeof lead.leadAmount).toBe('string');
      expect(lead.leadCreatedAt).toBeInstanceOf(Date);
      expect(lead.leadCreatedAt.getTime()).toBeLessThanOrEqual(Date.now());
      expect(typeof lead.leadCreatedBy).toBe('string');
      expect(typeof lead.leadSource).toBe('string');
    }
  });

  it('passes the item index to user-supplied functions', () => {
    const data = mockdrop.create({ id: (i) => i + 1 }, 3);
    expect(data.map((d) => d.id)).toEqual([1, 2, 3]);
  });

  // Regression: `create()` used to pass the index to *every* schema function,
  // so a bare generator reference was invoked as `pastDate(0)`, `zipCode(0)`,
  // … and the index was swallowed as that generator's first parameter.
  describe('built-in generator references ignore the item index', () => {
    it('date references keep their default range instead of receiving 0 years', () => {
      const data = mockdrop.create({ createdAt: mockdrop.pastDate }, 5);
      for (const { createdAt } of data) {
        expect(createdAt).toBeInstanceOf(Date);
        // `pastDate(0)` would collapse to exactly "now"; the default is 1 year back.
        expect(createdAt.getTime()).toBeLessThan(Date.now());
      }
    });

    it('zipCode reference keeps its default format instead of receiving 0', () => {
      const data = mockdrop.create({ zip: mockdrop.location.zipCode }, 5);
      for (const { zip } of data) {
        expect(zip).toMatch(/^\d{5}$/);
      }
    });

    it('creditCardNumber reference still produces a full-length card', () => {
      const data = mockdrop.create({ card: mockdrop.finance.creditCardNumber }, 5);
      for (const { card } of data) {
        expect(card.replace(/\s/g, '').length).toBeGreaterThanOrEqual(14);
      }
    });

    it('length-taking references keep their defaults instead of being sized by the index', () => {
      // If the index leaked through, item 0 would ask for zero words / zero
      // digits and come back empty.
      const data = mockdrop.create({
        words: mockdrop.lorem.words,
        account: mockdrop.finance.accountNumber,
      }, 5);

      for (const { words, account } of data) {
        expect(words.split(' ')).toHaveLength(5);
        expect(account).toMatch(/^\d{10}$/);
      }
    });

    it('user-supplied wrappers around generators still receive the index', () => {
      const data = mockdrop.create({ label: (i) => `${mockdrop.projectName()}-${i}` }, 3);
      expect(data.map((d) => d.label.split('-').pop())).toEqual(['0', '1', '2']);
    });
  });

  it('resolves nested schema objects recursively', () => {
    const data = mockdrop.create({
      profile: {
        name: mockdrop.fullName,
        contact: { email: mockdrop.email },
      },
    }, 2);

    for (const item of data) {
      expect(typeof item.profile.name).toBe('string');
      expect(item.profile.contact.email).toMatch(/@/);
    }
  });

  it('copies static values into every item', () => {
    const data = mockdrop.create({ role: 'admin', active: true, retries: 0 }, 3);
    for (const item of data) {
      expect(item).toEqual({ role: 'admin', active: true, retries: 0 });
    }
  });

  describe('non-plain objects are values, not nested schemas', () => {
    it('keeps a static Date intact', () => {
      const at = new Date('2026-01-15T10:30:00.000Z');
      for (const item of mockdrop.create({ at }, 3)) {
        expect(item.at).toBeInstanceOf(Date);
        expect(item.at.toISOString()).toBe('2026-01-15T10:30:00.000Z');
      }
    });

    it('keeps a static array intact instead of turning it into an object', () => {
      for (const item of mockdrop.create({ tags: ['a', 'b'] }, 3)) {
        expect(Array.isArray(item.tags)).toBe(true);
        expect(item.tags).toEqual(['a', 'b']);
      }
    });

    it('keeps a class instance intact', () => {
      const value = new Map([['k', 'v']]);
      const item = mockdrop.create({ value }, 1)[0];
      expect(item.value).toBeInstanceOf(Map);
      expect(item.value.get('k')).toBe('v');
    });

    it('passes null through', () => {
      expect(mockdrop.create({ deletedAt: null }, 1)[0].deletedAt).toBeNull();
    });
  });

  it('rejects non-object schemas', () => {
    expect(() => mockdrop.create(null, 5)).toThrow(TypeError);
    expect(() => mockdrop.create('name', 5)).toThrow(TypeError);
    expect(() => mockdrop.create([], 5)).toThrow(TypeError);
  });
});

describe('seeding', () => {
  it('two instances with the same seed generate identical data', () => {
    const a = new Mockdrop(42);
    const b = new Mockdrop(42);
    const dataA = a.create({ name: a.fullName, email: a.email }, 10);
    const dataB = b.create({ name: b.fullName, email: b.email }, 10);
    expect(dataA).toEqual(dataB);
  });

  it('setSeed() makes the singleton reproducible', () => {
    mockdrop.setSeed(7);
    const first = mockdrop.fullName();
    mockdrop.setSeed(7);
    const second = mockdrop.fullName();
    expect(first).toBe(second);
  });
});

describe('API surface', () => {
  it('exposes namespaces and top-level aliases for the same generators', () => {
    expect(typeof mockdrop.person.fullName).toBe('function');
    expect(typeof mockdrop.fullName).toBe('function');
    expect(typeof mockdrop.internet.email).toBe('function');
    expect(typeof mockdrop.company.projectName).toBe('function');
    expect(typeof mockdrop.date.past).toBe('function');
    expect(typeof mockdrop.finance.amount).toBe('function');
    expect(typeof mockdrop.lorem.sentence).toBe('function');
    expect(typeof mockdrop.system.uuid).toBe('function');
    expect(typeof mockdrop.helpers.pick).toBe('function');
  });

  it('user is an alias namespace for person', () => {
    expect(typeof mockdrop.user.name).toBe('function');
    expect(typeof mockdrop.user.firstName).toBe('function');
    expect(typeof mockdrop.user.fullName).toBe('function');
    const name = mockdrop.user.name();
    expect(name).toMatch(/^\S+ \S+$/);
  });
});
