import { describe, it, expect } from 'vitest';
import mockdrop from '../src/index.js';

/** Three records is enough to make repetition and exhaustion observable. */
function makeSource(count = 3) {
  return mockdrop.create({ id: mockdrop.uuid, name: mockdrop.user.name }, count);
}

describe('ref()', () => {
  it('only ever yields records from the source', () => {
    const source = makeSource();
    const ids = new Set(source.map((r) => r.id));

    const rows = mockdrop.create({ ownerId: mockdrop.ref(source, 'id') }, 50);
    for (const row of rows) {
      expect(ids.has(row.ownerId)).toBe(true);
    }
  });

  it('embeds the whole record when no key is given', () => {
    const source = makeSource();
    const rows = mockdrop.create({ owner: mockdrop.ref(source) }, 20);

    for (const row of rows) {
      expect(source).toContain(row.owner);
    }
  });

  it('repeats records, so many rows can share few owners', () => {
    const source = makeSource(2);
    const rows = mockdrop.create({ ownerId: mockdrop.ref(source, 'id') }, 30);
    expect(rows).toHaveLength(30);
    expect(new Set(rows.map((r) => r.ownerId)).size).toBeLessThanOrEqual(2);
  });

  it('rejects an empty or non-array source', () => {
    expect(() => mockdrop.ref([])).toThrow(RangeError);
    expect(() => mockdrop.ref('nope')).toThrow(TypeError);
    expect(() => mockdrop.ref(null)).toThrow(TypeError);
  });
});

describe('refUnique()', () => {
  it('never repeats a record', () => {
    const source = makeSource(10);
    const rows = mockdrop.create({ ownerId: mockdrop.refUnique(source, 'id') }, 10);
    expect(new Set(rows.map((r) => r.ownerId)).size).toBe(10);
  });

  it('throws once the source runs out rather than silently repeating', () => {
    const source = makeSource(3);
    expect(() => mockdrop.create({ owner: mockdrop.refUnique(source) }, 4)).toThrow(RangeError);
  });

  it('restarts when the same schema is reused for another create() call', () => {
    const source = makeSource(3);
    // Reusing a schema object is normal; the pool must not carry over.
    const schema = { owner: mockdrop.refUnique(source, 'id') };

    const first = mockdrop.create(schema, 3).map((r) => r.owner);
    const second = mockdrop.create(schema, 3).map((r) => r.owner);

    expect(new Set(first).size).toBe(3);
    expect(new Set(second).size).toBe(3);
  });

  it('stays unique inside a nested schema, which is generated a row at a time', () => {
    const source = makeSource(5);
    const rows = mockdrop.create({
      meta: { reviewerId: mockdrop.refUnique(source, 'id') },
    }, 5);

    expect(new Set(rows.map((r) => r.meta.reviewerId)).size).toBe(5);
  });
});

describe('refEach()', () => {
  it('gives every record an equal share', () => {
    const source = makeSource(3);
    const rows = mockdrop.create({ ownerId: mockdrop.refEach(source, 'id') }, 9);

    const counts = {};
    for (const row of rows) counts[row.ownerId] = (counts[row.ownerId] ?? 0) + 1;

    expect(Object.keys(counts)).toHaveLength(3);
    expect(Object.values(counts)).toEqual([3, 3, 3]);
  });

  it('wraps around instead of throwing when it runs past the end', () => {
    const source = makeSource(2);
    const rows = mockdrop.create({ ownerId: mockdrop.refEach(source, 'id') }, 5);
    expect(rows).toHaveLength(5);
    expect(rows[0].ownerId).toBe(rows[2].ownerId);
    expect(rows[0].ownerId).toBe(rows[4].ownerId);
  });

  it('restarts on reuse so the distribution stays even', () => {
    const source = makeSource(3);
    const schema = { ownerId: mockdrop.refEach(source, 'id') };

    const first = mockdrop.create(schema, 3).map((r) => r.ownerId);
    const second = mockdrop.create(schema, 3).map((r) => r.ownerId);

    expect(first).toEqual(second);
  });
});

describe('relations together', () => {
  it('builds a realistic two-table dataset', () => {
    const reps = mockdrop.create({ id: mockdrop.uuid, name: mockdrop.user.name }, 5);
    const leads = mockdrop.create({
      id: mockdrop.uuid,
      title: mockdrop.projectName,
      ownerId: mockdrop.ref(reps, 'id'),
      owner: mockdrop.ref(reps),
    }, 20);

    expect(leads).toHaveLength(20);
    const repIds = new Set(reps.map((r) => r.id));
    for (const lead of leads) {
      expect(repIds.has(lead.ownerId)).toBe(true);
      expect(repIds.has(lead.owner.id)).toBe(true);
    }
  });
});
