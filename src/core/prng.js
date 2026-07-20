/**
 * @file Seedable Pseudo-Random Number Generator (PRNG)
 * @module core/prng
 * @description Implements the Mulberry32 algorithm — a fast, high-quality
 *              32-bit PRNG with a single 32-bit state word. Every public method
 *              derives randomness from `next()`, making the entire sequence
 *              fully deterministic when a seed is supplied.
 */

/**
 * Creates a Mulberry32 generator function.
 *
 * The returned closure advances the internal state on each call and produces
 * a uniformly distributed float in [0, 1).
 *
 * @param {number} seed - Initial 32-bit seed value.
 * @returns {() => number} A function that returns the next pseudo-random float.
 * @see https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
 * @private
 */
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Default character set used by {@link PRNG#char} and {@link PRNG#string}
 * when the caller does not provide one.
 *
 * @type {string}
 * @private
 */
const DEFAULT_CHARSET = 'abcdefghijklmnopqrstuvwxyz';

/**
 * Seedable PRNG exposing a rich set of convenience methods for generating
 * integers, floats, booleans, strings, and performing weighted / shuffled
 * selections — all deterministically reproducible when given the same seed.
 *
 * @example
 * import { PRNG } from './core/prng.js';
 *
 * const rng = new PRNG(42);
 * rng.int(1, 10);            // deterministic integer
 * rng.pick(['a', 'b', 'c']); // deterministic pick
 */
export class PRNG {
  /**
   * Creates a new PRNG instance.
   *
   * @param {number} [seed] - Optional seed. Defaults to `Date.now()` when
   *                          omitted, producing a non-deterministic sequence.
   */
  constructor(seed) {
    /** @type {number} The current seed value. */
    this._seed = seed !== undefined ? seed : Date.now();

    /** @type {() => number} Internal Mulberry32 generator. */
    this._generator = mulberry32(this._seed);
  }

  // ─── Seed Management ────────────────────────────────────────────────

  /**
   * Replaces the current seed and resets the internal generator, producing a
   * brand-new deterministic sequence from the given seed.
   *
   * @param {number} seed - The new seed value.
   * @returns {void}
   */
  setSeed(seed) {
    this._seed = seed;
    this._generator = mulberry32(this._seed);
  }

  // ─── Primitive Generators ───────────────────────────────────────────

  /**
   * Returns the next pseudo-random float in the half-open interval [0, 1).
   *
   * @returns {number} A float ≥ 0 and < 1.
   */
  next() {
    return this._generator();
  }

  /**
   * Returns a pseudo-random integer in the closed interval [min, max].
   *
   * @param {number} min - Lower bound (inclusive).
   * @param {number} max - Upper bound (inclusive).
   * @returns {number} An integer between `min` and `max`.
   */
  int(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Returns a pseudo-random float in the half-open interval [min, max),
   * rounded to the specified number of decimal places.
   *
   * @param {number} min      - Lower bound (inclusive).
   * @param {number} max      - Upper bound (exclusive).
   * @param {number} [decimals=2] - Number of decimal places to keep.
   * @returns {number} A float with the requested precision.
   */
  float(min, max, decimals = 2) {
    const value = this.next() * (max - min) + min;
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  // ─── Boolean ────────────────────────────────────────────────────────

  /**
   * Returns `true` with the given probability (0 = never, 1 = always).
   *
   * @param {number} [probability=0.5] - Chance of returning `true`.
   * @returns {boolean}
   */
  bool(probability = 0.5) {
    return this.next() < probability;
  }

  // ─── Array Utilities ────────────────────────────────────────────────

  /**
   * Returns a single random element from the provided array.
   *
   * @template T
   * @param {T[]} array - Source array (must not be empty).
   * @returns {T} A randomly selected element.
   */
  pick(array) {
    return array[this.int(0, array.length - 1)];
  }

  /**
   * Returns `count` random elements from the array. Elements **may** repeat
   * because each pick is independent.
   *
   * @template T
   * @param {T[]} array - Source array.
   * @param {number} count - Number of elements to pick.
   * @returns {T[]} An array of `count` randomly chosen elements.
   */
  pickMultiple(array, count) {
    /** @type {T[]} */
    const results = [];
    for (let i = 0; i < count; i++) {
      results.push(this.pick(array));
    }
    return results;
  }

  /**
   * Returns `count` **unique** random elements from the array (no repeats).
   * Throws if `count` exceeds the array length.
   *
   * @template T
   * @param {T[]} array - Source array.
   * @param {number} count - Number of unique elements to select.
   * @returns {T[]} An array of `count` distinct elements.
   * @throws {RangeError} When `count` > `array.length`.
   */
  pickUnique(array, count) {
    if (count > array.length) {
      throw new RangeError(
        `Cannot pick ${count} unique elements from an array of length ${array.length}.`,
      );
    }
    // Shuffle a copy and slice — avoids bias and is O(n).
    return this.shuffle(array).slice(0, count);
  }

  /**
   * Returns a **new** array with the elements of the source array in random
   * order, using the Fisher-Yates (Knuth) shuffle. The original array is
   * never mutated.
   *
   * @template T
   * @param {T[]} array - Source array.
   * @returns {T[]} A new shuffled array.
   */
  shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  // ─── String Generators ─────────────────────────────────────────────

  /**
   * Returns a single random character from the given charset.
   *
   * @param {string} [charset='abcdefghijklmnopqrstuvwxyz'] - Characters to
   *                  choose from.
   * @returns {string} A one-character string.
   */
  char(charset = DEFAULT_CHARSET) {
    return charset[this.int(0, charset.length - 1)];
  }

  /**
   * Returns a random string of the specified length, built from the given
   * charset.
   *
   * @param {number} length  - Desired string length.
   * @param {string} [charset='abcdefghijklmnopqrstuvwxyz'] - Characters to
   *                  draw from.
   * @returns {string} A random string.
   */
  string(length, charset = DEFAULT_CHARSET) {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += this.char(charset);
    }
    return result;
  }

  // ─── Weighted Selection ─────────────────────────────────────────────

  /**
   * Selects a value from a weighted options list.
   *
   * Each option has a `value` and a numeric `weight`. Higher weights increase
   * the likelihood of selection proportionally.
   *
   * @template T
   * @param {{ value: T, weight: number }[]} options - Array of weighted
   *        options. Every weight must be ≥ 0, and at least one must be > 0.
   * @returns {T} The selected value.
   * @throws {Error} When the options array is empty or total weight is zero.
   *
   * @example
   * rng.weighted([
   *   { value: 'common',   weight: 70 },
   *   { value: 'uncommon', weight: 25 },
   *   { value: 'rare',     weight: 5  },
   * ]);
   */
  weighted(options) {
    if (!options || options.length === 0) {
      throw new Error('weighted() requires a non-empty options array.');
    }

    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);

    if (totalWeight <= 0) {
      throw new Error('Total weight must be greater than zero.');
    }

    let random = this.next() * totalWeight;

    for (const option of options) {
      random -= option.weight;
      if (random < 0) {
        return option.value;
      }
    }

    // Fallback — should only be reached due to floating-point edge cases.
    return options[options.length - 1].value;
  }
}
