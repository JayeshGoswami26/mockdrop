import { describe, it, expect } from 'vitest';
import { PRNG } from '../src/core/prng.js';

describe('PRNG', () => {
  it('produces an identical sequence for the same seed', () => {
    const a = new PRNG(42);
    const b = new PRNG(42);
    const seqA = Array.from({ length: 20 }, () => a.next());
    const seqB = Array.from({ length: 20 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it('produces different sequences for different seeds', () => {
    const a = new PRNG(1);
    const b = new PRNG(2);
    const seqA = Array.from({ length: 10 }, () => a.next());
    const seqB = Array.from({ length: 10 }, () => b.next());
    expect(seqA).not.toEqual(seqB);
  });

  it('setSeed resets the sequence', () => {
    const rng = new PRNG(7);
    const first = [rng.next(), rng.next(), rng.next()];
    rng.setSeed(7);
    const second = [rng.next(), rng.next(), rng.next()];
    expect(first).toEqual(second);
  });

  it('next() stays within [0, 1)', () => {
    const rng = new PRNG(123);
    for (let i = 0; i < 1000; i++) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('int() stays within the inclusive bounds and hits both ends', () => {
    const rng = new PRNG(99);
    const seen = new Set();
    for (let i = 0; i < 1000; i++) {
      const v = rng.int(1, 5);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(5);
      seen.add(v);
    }
    expect(seen.has(1)).toBe(true);
    expect(seen.has(5)).toBe(true);
  });

  it('float() respects bounds and decimal precision', () => {
    const rng = new PRNG(5);
    for (let i = 0; i < 100; i++) {
      const v = rng.float(1, 2, 2);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(2);
      expect(Number(v.toFixed(2))).toBe(v);
    }
  });

  it('bool() honors probability extremes', () => {
    const rng = new PRNG(11);
    for (let i = 0; i < 50; i++) {
      expect(rng.bool(1)).toBe(true);
      expect(rng.bool(0)).toBe(false);
    }
  });

  it('pick() only returns elements from the source array', () => {
    const rng = new PRNG(3);
    const source = ['a', 'b', 'c'];
    for (let i = 0; i < 100; i++) {
      expect(source).toContain(rng.pick(source));
    }
  });

  it('pickUnique() returns distinct elements and throws when count exceeds length', () => {
    const rng = new PRNG(8);
    const source = [1, 2, 3, 4, 5];
    const picked = rng.pickUnique(source, 5);
    expect(new Set(picked).size).toBe(5);
    expect(() => rng.pickUnique(source, 6)).toThrow(RangeError);
  });

  it('shuffle() keeps all elements and does not mutate the source', () => {
    const rng = new PRNG(4);
    const source = [1, 2, 3, 4, 5];
    const copy = [...source];
    const shuffled = rng.shuffle(source);
    expect(source).toEqual(copy);
    expect([...shuffled].sort()).toEqual([...source].sort());
  });

  it('string() builds from the given charset at the given length', () => {
    const rng = new PRNG(6);
    const s = rng.string(16, 'ab');
    expect(s).toHaveLength(16);
    expect(s).toMatch(/^[ab]+$/);
  });

  it('weighted() always selects the only positively weighted option', () => {
    const rng = new PRNG(10);
    for (let i = 0; i < 50; i++) {
      const v = rng.weighted([
        { value: 'never', weight: 0 },
        { value: 'always', weight: 1 },
      ]);
      expect(v).toBe('always');
    }
  });

  it('weighted() rejects empty or zero-weight inputs', () => {
    const rng = new PRNG(10);
    expect(() => rng.weighted([])).toThrow();
    expect(() => rng.weighted([{ value: 'x', weight: 0 }])).toThrow();
  });
});
