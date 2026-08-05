/**
 * @file Fixed clock
 * @module core/clock
 * @description The single source of "now" for every generator that produces a
 *              date relative to the present.
 *
 * Relative generators (`past()`, `recent()`, `soon()`, …) read the live system
 * clock by default, which makes them non-reproducible in one specific and very
 * common situation: server-side rendering. A mock module is evaluated once on
 * the server and again during hydration, and because the two passes happen at
 * different instants, the same seed yields different dates — React then reports
 * a hydration mismatch. Pinning the clock with `setNow()` removes the second
 * source of non-determinism, so seed + fixed clock fully determines the output.
 *
 * The clock is deliberately independent of the PRNG: seeding and pinning are
 * separate concerns, and `setSeed()` never disturbs the clock (nor the reverse).
 */

/**
 * A clock that either follows the system time or is pinned to a fixed instant.
 *
 * @example
 * const clock = new Clock();
 * clock.now();                        // → Date.now()
 * clock.set(new Date('2026-06-25'));
 * clock.now();                        // → 1782345600000, every time
 * clock.set(null);                    // back to the live system clock
 */
export class Clock {
  constructor() {
    /**
     * Fixed instant in epoch milliseconds, or `null` while the clock follows
     * the live system time.
     *
     * @type {number | null}
     * @private
     */
    this._fixed = null;
  }

  /**
   * Pins the clock to an instant, or releases it back to system time.
   *
   * @param {Date | string | number | null} [value] - The instant to pin to.
   *        A `Date`, anything the `Date` constructor parses, or epoch
   *        milliseconds. Pass `null` (or `undefined`) to resume live time.
   * @returns {void}
   * @throws {TypeError} When `value` is not a valid date.
   */
  set(value) {
    if (value === null || value === undefined) {
      this._fixed = null;
      return;
    }

    const time = value instanceof Date ? value.getTime() : new Date(value).getTime();

    if (!Number.isFinite(time)) {
      throw new TypeError(
        'setNow() expects a Date, a parsable date string, epoch milliseconds, ' +
        'or null to restore the live clock.',
      );
    }

    this._fixed = time;
  }

  /**
   * The current instant in epoch milliseconds — the pinned value when the
   * clock is fixed, otherwise the live system time.
   *
   * @returns {number}
   */
  now() {
    return this._fixed === null ? Date.now() : this._fixed;
  }

  /**
   * The current instant as a fresh `Date`. A new object every call, so callers
   * can mutate the result without corrupting the pinned instant.
   *
   * @returns {Date}
   */
  date() {
    return new Date(this.now());
  }

  /**
   * Whether the clock is currently pinned.
   *
   * @returns {boolean}
   */
  isFixed() {
    return this._fixed !== null;
  }
}
