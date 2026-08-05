import { describe, it, expect } from 'vitest';
import mockdrop, { Mockdrop } from '../src/index.js';

describe('row-aware schema fields', () => {
  it('hands each function the row built so far', () => {
    const rows = mockdrop.create({
      first: () => 'a',
      second: (i, row) => `${row.first}b`,
      third: (i, row) => `${row.second}c`,
    }, 3);

    for (const row of rows) {
      expect(row).toEqual({ first: 'a', second: 'ab', third: 'abc' });
    }
  });

  it('gives the first field an empty row', () => {
    const seen = [];
    mockdrop.create({ first: (i, row) => { seen.push({ ...row }); return 1; } }, 2);
    expect(seen).toEqual([{}, {}]);
  });

  it('exposes only the keys declared above, never the ones below', () => {
    const seen = [];
    mockdrop.create({
      a: () => 1,
      b: (i, row) => { seen.push(Object.keys(row)); return 2; },
      c: () => 3,
    }, 1);

    expect(seen).toEqual([['a']]);
  });

  it('keeps the index as the first argument', () => {
    const rows = mockdrop.create({
      id: (i) => i + 1,
      label: (i, row) => `row-${i}-${row.id}`,
    }, 3);

    expect(rows.map((r) => r.label)).toEqual(['row-0-1', 'row-1-2', 'row-2-3']);
  });

  it('holds a dependent invariant across many rows', () => {
    const rows = mockdrop.create({
      tasksTotal: () => mockdrop.helpers.int(8, 40),
      tasksDone: (i, row) => mockdrop.helpers.int(0, row.tasksTotal),
      progress: (i, row) => Math.round((row.tasksDone / row.tasksTotal) * 100),
    }, 200);

    for (const row of rows) {
      expect(row.tasksDone).toBeLessThanOrEqual(row.tasksTotal);
      expect(row.tasksDone).toBeGreaterThanOrEqual(0);
      expect(row.progress).toBe(Math.round((row.tasksDone / row.tasksTotal) * 100));
      expect(row.progress).toBeGreaterThanOrEqual(0);
      expect(row.progress).toBeLessThanOrEqual(100);
    }
  });

  it('orders a date pair off the row', () => {
    const rows = mockdrop.create({
      startDate: mockdrop.pastDate,
      endDate: (i, row) => mockdrop.date.between(row.startDate, mockdrop.getNow()),
    }, 100);

    for (const { startDate, endDate } of rows) {
      expect(endDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
    }
  });

  it('starts each row from a clean slate', () => {
    const rows = mockdrop.create({
      seen: (i, row) => Object.keys(row).length,
      id: (i) => i,
    }, 3);

    expect(rows.map((r) => r.seen)).toEqual([0, 0, 0]);
  });

  // Regression: built-ins must keep running with their own defaults, never
  // handed the index or the row.
  it('still calls built-in generator references with no arguments', () => {
    const rows = mockdrop.create({
      zip: mockdrop.location.zipCode,
      words: mockdrop.lorem.words,
      createdAt: mockdrop.pastDate,
    }, 5);

    for (const row of rows) {
      expect(row.zip).toMatch(/^\d{5}$/);
      expect(row.words.split(' ')).toHaveLength(5);
      expect(row.createdAt).toBeInstanceOf(Date);
    }
  });

  it('passes the parent row to a nested sub-schema', () => {
    const rows = mockdrop.create({
      budget: () => 1000,
      cost: {
        amount: (i, row, parent) => parent.budget / 2,
        parentKeys: (i, row, parent) => Object.keys(parent).join(','),
      },
    }, 2);

    for (const row of rows) {
      expect(row.cost.amount).toBe(500);
      expect(row.cost.parentKeys).toBe('budget');
    }
  });

  it('is deterministic under a seed', () => {
    const build = (md) => md.create({
      total: () => md.helpers.int(8, 40),
      done: (i, row) => md.helpers.int(0, row.total),
    }, 20);

    expect(build(new Mockdrop(11))).toEqual(build(new Mockdrop(11)));
  });

  it('reproduces a dependent dataset across runs with a pinned clock', () => {
    const build = () => {
      const md = new Mockdrop(1);
      md.setNow(new Date('2026-06-25'));
      return md.create({
        startDate: md.pastDate,
        endDate: (i, row) => md.date.between(row.startDate, md.getNow()),
        total: () => md.helpers.int(8, 40),
        done: (i, row) => md.helpers.int(0, row.total),
      }, 20);
    };

    expect(JSON.stringify(build())).toBe(JSON.stringify(build()));
  });
});

describe('create() derive', () => {
  it('runs once per row after every field resolves', () => {
    const rows = mockdrop.create({
      title: () => 'Hello World',
      amount: () => 10,
    }, 3, {
      derive: (row) => ({ ...row, slug: row.title.toLowerCase().replace(/\s+/g, '-') }),
    });

    for (const row of rows) {
      expect(row).toEqual({ title: 'Hello World', amount: 10, slug: 'hello-world' });
    }
  });

  it('receives the row index', () => {
    const rows = mockdrop.create({ v: () => 1 }, 3, {
      derive: (row, i) => ({ ...row, i }),
    });
    expect(rows.map((r) => r.i)).toEqual([0, 1, 2]);
  });

  it('accepts a mutating derive that returns nothing', () => {
    const rows = mockdrop.create({ a: () => 1 }, 2, {
      derive: (row) => { row.b = row.a + 1; },
    });
    for (const row of rows) {
      expect(row).toEqual({ a: 1, b: 2 });
    }
  });

  it('may reshape the row entirely', () => {
    const rows = mockdrop.create({ a: () => 1 }, 2, { derive: (row) => row.a });
    expect(rows).toEqual([1, 1]);
  });

  it('sees fields produced by row-aware functions', () => {
    const rows = mockdrop.create({
      total: () => 10,
      done: (i, row) => row.total - 4,
    }, 1, {
      derive: (row) => ({ ...row, remaining: row.total - row.done }),
    });

    expect(rows[0]).toEqual({ total: 10, done: 6, remaining: 4 });
  });

  it('rejects a non-function derive', () => {
    expect(() => mockdrop.create({ a: () => 1 }, 1, { derive: 'nope' })).toThrow(TypeError);
  });

  it('is optional and unchanged when omitted', () => {
    expect(mockdrop.create({ a: () => 1 }, 1)).toEqual([{ a: 1 }]);
    expect(mockdrop.create({ a: () => 1 }, 1, {})).toEqual([{ a: 1 }]);
  });
});

describe('paginate() carries the same capability', () => {
  it('supports row-aware fields', () => {
    const { data } = mockdrop.paginate({
      total: () => mockdrop.helpers.int(8, 40),
      done: (i, row) => mockdrop.helpers.int(0, row.total),
    }, { page: 1, perPage: 10, total: 40 });

    expect(data).toHaveLength(10);
    for (const row of data) {
      expect(row.done).toBeLessThanOrEqual(row.total);
    }
  });

  it('supports derive', () => {
    const { data, meta } = mockdrop.paginate({ title: () => 'A B' }, {
      page: 2,
      perPage: 5,
      total: 12,
      derive: (row) => ({ ...row, slug: row.title.toLowerCase().replace(' ', '-') }),
    });

    expect(meta.page).toBe(2);
    expect(data).toHaveLength(5);
    for (const row of data) {
      expect(row.slug).toBe('a-b');
    }
  });
});

describe('entity overrides carry the same capability', () => {
  it('exposes the preset fields to an override function', () => {
    const orders = mockdrop.entity.order(20, {
      label: (i, row) => `#${row.orderNumber}`,
      grandTotal: (i, row) => row.subtotal + row.tax + row.shipping,
    });

    for (const order of orders) {
      expect(order.label).toBe(`#${order.orderNumber}`);
      expect(order.grandTotal).toBeCloseTo(order.total, 5);
    }
  });

  it('lets a later override read an earlier one', () => {
    const users = mockdrop.entity.user(5, {
      seq: (i) => i + 1,
      tag: (i, row) => `u-${row.seq}`,
    });

    expect(users.map((u) => u.tag)).toEqual(['u-1', 'u-2', 'u-3', 'u-4', 'u-5']);
  });

  it('supports a derive pass over the finished row', () => {
    const users = mockdrop.entity.user(5, {}, {
      derive: (row) => ({ id: row.id, display: `${row.fullName} <${row.email}>` }),
    });

    for (const user of users) {
      expect(Object.keys(user)).toEqual(['id', 'display']);
      expect(user.display).toMatch(/^.+ <.+@.+>$/);
    }
  });

  it('keeps the existing override behaviours intact', () => {
    const users = mockdrop.entity.user(10, { isActive: true, role: 'admin' });
    for (const user of users) {
      expect(user.isActive).toBe(true);
      expect(user.role).toBe('admin');
      expect(user.email).toBeTruthy();
    }
  });

  it('still restarts refUnique on every call', () => {
    const desks = mockdrop.create({ id: mockdrop.uuid }, 4);
    const overrides = { deskId: mockdrop.refUnique(desks, 'id') };

    for (let run = 0; run < 3; run++) {
      const users = mockdrop.entity.user(4, overrides);
      expect(new Set(users.map((u) => u.deskId)).size).toBe(4);
    }
  });

  it('keeps preset field order, with overridden keys in place', () => {
    const [user] = mockdrop.entity.user(1, { age: () => 30, extra: 1 });
    const keys = Object.keys(user);

    expect(keys.indexOf('age')).toBeLessThan(keys.indexOf('extra'));
    expect(keys[0]).toBe('id');
    expect(keys[keys.length - 1]).toBe('extra');
  });
});
