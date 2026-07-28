import { describe, it, expect } from 'vitest';
import mockdrop from '../src/index.js';

const ENTITY_NAMES = [
  'user', 'lead', 'product', 'order', 'transaction',
  'blogPost', 'comment', 'todo', 'event',
];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('entity presets', () => {
  it.each(ENTITY_NAMES)('%s() returns the requested count with a uuid id', (name) => {
    const rows = mockdrop.entity[name](5);
    expect(rows).toHaveLength(5);
    for (const row of rows) {
      expect(row.id).toMatch(UUID);
    }
  });

  it.each(ENTITY_NAMES)('%s() never leaves a field undefined', (name) => {
    for (const row of mockdrop.entity[name](10)) {
      const undefinedKeys = Object.entries(row)
        .filter(([, value]) => value === undefined)
        .map(([key]) => key);
      expect(undefinedKeys).toEqual([]);
    }
  });

  it.each(ENTITY_NAMES)('%s() defaults to one row and accepts zero', (name) => {
    expect(mockdrop.entity[name]()).toHaveLength(1);
    expect(mockdrop.entity[name](0)).toEqual([]);
  });

  it.each(ENTITY_NAMES)('%s() gives each row its own id', (name) => {
    const rows = mockdrop.entity[name](25);
    expect(new Set(rows.map((r) => r.id)).size).toBe(25);
  });

  it.each(ENTITY_NAMES)('%s() rejects a nonsense count', (name) => {
    expect(() => mockdrop.entity[name](-1)).toThrow(RangeError);
    expect(() => mockdrop.entity[name](2.5)).toThrow(RangeError);
  });
});

describe('entity invariants', () => {
  it('order totals add up', () => {
    for (const order of mockdrop.entity.order(50)) {
      const sum = order.subtotal + order.tax + order.shipping;
      expect(Math.abs(sum - order.total)).toBeLessThan(0.011);
      expect(order.total).toBeGreaterThan(0);
    }
  });

  it('event ends after it starts, by the stated duration', () => {
    for (const event of mockdrop.entity.event(50)) {
      expect(event.endsAt.getTime()).toBeGreaterThan(event.startsAt.getTime());
      const hours = (event.endsAt - event.startsAt) / 3_600_000;
      expect(hours).toBeCloseTo(event.durationHours, 5);
    }
  });

  it('user identity fields belong to the same person', () => {
    for (const user of mockdrop.entity.user(50)) {
      expect(user.fullName).toBe(`${user.firstName} ${user.lastName}`);
      expect(user.initials).toBe(`${user.firstName[0]}${user.lastName[0]}`.toUpperCase());
      expect(user.email.split('@')[0]).toContain(user.firstName.toLowerCase().replace(/[^a-z0-9._]/g, ''));
    }
  });

  it('lead is updated at or after it was created', () => {
    for (const lead of mockdrop.entity.lead(50)) {
      expect(lead.updatedAt.getTime()).toBeGreaterThanOrEqual(lead.createdAt.getTime());
    }
  });

  it('blog post slug is url-safe and tracks the title', () => {
    for (const post of mockdrop.entity.blogPost(30)) {
      expect(post.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      const firstWord = post.title.toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, '');
      expect(post.slug.startsWith(firstWord)).toBe(true);
      expect(post.readingTime).toBeGreaterThanOrEqual(1);
    }
  });

  it('product stock flag matches its stock count', () => {
    for (const product of mockdrop.entity.product(100)) {
      expect(product.inStock).toBe(product.stockCount > 0);
      expect(product.rating).toBeGreaterThanOrEqual(1);
      expect(product.rating).toBeLessThanOrEqual(5);
    }
  });

  it('todo records a completion time only when completed', () => {
    for (const todo of mockdrop.entity.todo(100)) {
      if (todo.completed) {
        expect(todo.completedAt).toBeInstanceOf(Date);
      } else {
        expect(todo.completedAt).toBeNull();
      }
    }
  });
});

describe('entity overrides', () => {
  it('replaces a preset field with a static value on every row', () => {
    const users = mockdrop.entity.user(10, { isActive: true, role: 'admin' });
    for (const user of users) {
      expect(user.isActive).toBe(true);
      expect(user.role).toBe('admin');
      expect(user.email).toBeTruthy(); // preset fields survive
    }
  });

  it('calls a function override once per row', () => {
    const users = mockdrop.entity.user(5, { seq: (i) => i + 1 });
    expect(users.map((u) => u.seq)).toEqual([1, 2, 3, 4, 5]);
  });

  it('accepts a ref() relation as an override', () => {
    const teams = mockdrop.create({ id: mockdrop.uuid, name: mockdrop.company.name }, 3);
    const users = mockdrop.entity.user(12, { teamId: mockdrop.ref(teams, 'id') });

    const teamIds = new Set(teams.map((t) => t.id));
    for (const user of users) {
      expect(teamIds.has(user.teamId)).toBe(true);
    }
  });

  it('supports refUnique as an override, restarting per call', () => {
    const desks = mockdrop.create({ id: mockdrop.uuid }, 4);
    const overrides = { deskId: mockdrop.refUnique(desks, 'id') };

    for (let run = 0; run < 3; run++) {
      const users = mockdrop.entity.user(4, overrides);
      expect(new Set(users.map((u) => u.deskId)).size).toBe(4);
    }
  });
});
