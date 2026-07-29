import { describe, it, expect } from 'vitest';
import mockdrop from '../src/index.js';

const schema = { id: mockdrop.uuid, title: mockdrop.projectName };

describe('paginate()', () => {
  it('returns a full page with correct metadata', () => {
    const page = mockdrop.paginate(schema, { page: 2, perPage: 20, total: 137 });

    expect(page.data).toHaveLength(20);
    expect(page.meta).toEqual({
      page: 2,
      perPage: 20,
      total: 137,
      totalPages: 7,
      hasNextPage: true,
      hasPrevPage: true,
    });
  });

  it('short-fills the final page', () => {
    const page = mockdrop.paginate(schema, { page: 7, perPage: 20, total: 137 });

    expect(page.data).toHaveLength(17); // 137 - 6 * 20
    expect(page.meta.hasNextPage).toBe(false);
    expect(page.meta.hasPrevPage).toBe(true);
  });

  it('marks the first page as having no previous page', () => {
    const page = mockdrop.paginate(schema, { page: 1, perPage: 10, total: 50 });
    expect(page.meta.hasPrevPage).toBe(false);
    expect(page.meta.hasNextPage).toBe(true);
  });

  it('returns an empty page past the end, like a real endpoint', () => {
    const page = mockdrop.paginate(schema, { page: 99, perPage: 10, total: 50 });
    expect(page.data).toEqual([]);
    expect(page.meta.totalPages).toBe(5);
    expect(page.meta.hasNextPage).toBe(false);
  });

  it('handles an empty collection', () => {
    const page = mockdrop.paginate(schema, { page: 1, perPage: 10, total: 0 });
    expect(page.data).toEqual([]);
    expect(page.meta.totalPages).toBe(0);
    expect(page.meta.hasNextPage).toBe(false);
    expect(page.meta.hasPrevPage).toBe(false);
  });

  it('applies sensible defaults', () => {
    const page = mockdrop.paginate(schema);
    expect(page.data).toHaveLength(10);
    expect(page.meta).toMatchObject({ page: 1, perPage: 10, total: 100, totalPages: 10 });
  });

  it('generates real records that match the schema', () => {
    const page = mockdrop.paginate(schema, { page: 1, perPage: 5, total: 5 });
    for (const row of page.data) {
      expect(typeof row.id).toBe('string');
      expect(typeof row.title).toBe('string');
    }
    expect(new Set(page.data.map((r) => r.id)).size).toBe(5);
  });

  it('every page together covers exactly `total` records', () => {
    const total = 47;
    const perPage = 10;
    let seen = 0;
    for (let page = 1; page <= Math.ceil(total / perPage); page++) {
      seen += mockdrop.paginate(schema, { page, perPage, total }).data.length;
    }
    expect(seen).toBe(total);
  });

  it('rejects invalid pagination arguments', () => {
    expect(() => mockdrop.paginate(schema, { page: 0 })).toThrow(RangeError);
    expect(() => mockdrop.paginate(schema, { page: 1.5 })).toThrow(RangeError);
    expect(() => mockdrop.paginate(schema, { perPage: 0 })).toThrow(RangeError);
    expect(() => mockdrop.paginate(schema, { total: -1 })).toThrow(RangeError);
  });

  it('works with relations inside the schema', () => {
    const owners = mockdrop.create({ id: mockdrop.uuid }, 3);
    const page = mockdrop.paginate(
      { id: mockdrop.uuid, ownerId: mockdrop.ref(owners, 'id') },
      { page: 1, perPage: 10, total: 10 },
    );

    const ids = new Set(owners.map((o) => o.id));
    for (const row of page.data) {
      expect(ids.has(row.ownerId)).toBe(true);
    }
  });
});
