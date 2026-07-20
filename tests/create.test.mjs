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

  it('passes the item index to generator functions', () => {
    const data = mockdrop.create({ id: (i) => i + 1 }, 3);
    expect(data.map((d) => d.id)).toEqual([1, 2, 3]);
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

  it('rejects non-object schemas', () => {
    expect(() => mockdrop.create(null, 5)).toThrow(TypeError);
    expect(() => mockdrop.create('name', 5)).toThrow(TypeError);
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
