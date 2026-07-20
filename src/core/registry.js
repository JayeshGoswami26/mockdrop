/**
 * @file Generator Registry
 * @module core/registry
 * @description A lightweight namespace store for data generators. Each
 *              generator module (e.g. "person", "address", "finance")
 *              registers itself under a unique name. The registry is then
 *              consumed by the public API facade to expose a unified
 *              `mockdrop.person.*`, `mockdrop.address.*` interface.
 */

/**
 * Central registry that maps namespace names to their generator objects.
 *
 * @example
 * import { GeneratorRegistry } from './core/registry.js';
 *
 * const registry = new GeneratorRegistry();
 * registry.register('person', personGenerator);
 * registry.get('person').firstName(); // → "Alice"
 */
export class GeneratorRegistry {
  /**
   * Creates a new, empty registry.
   */
  constructor() {
    /**
     * Internal map of namespace → generator object.
     *
     * @type {Map<string, object>}
     * @private
     */
    this._store = new Map();
  }

  // ─── Mutation ───────────────────────────────────────────────────────

  /**
   * Registers a generator under the given namespace name. If the name is
   * already taken, the previous generator is silently replaced.
   *
   * @param {string} name      - Unique namespace identifier (e.g. "person").
   * @param {object} generator - The generator object to store.
   * @returns {void}
   * @throws {TypeError} When `name` is not a non-empty string.
   * @throws {TypeError} When `generator` is not an object.
   */
  register(name, generator) {
    if (typeof name !== 'string' || name.length === 0) {
      throw new TypeError('Generator name must be a non-empty string.');
    }

    if (typeof generator !== 'object' || generator === null) {
      throw new TypeError('Generator must be a non-null object.');
    }

    this._store.set(name, generator);
  }

  // ─── Look-ups ───────────────────────────────────────────────────────

  /**
   * Retrieves the generator registered under the given namespace name.
   *
   * @param {string} name - Namespace to look up.
   * @returns {object | undefined} The generator object, or `undefined` if
   *          no generator is registered under that name.
   */
  get(name) {
    return this._store.get(name);
  }

  /**
   * Returns a plain object whose keys are the registered namespace names
   * and whose values are the corresponding generator objects.
   *
   * @returns {Record<string, object>} A snapshot of all registered generators.
   */
  getAll() {
    /** @type {Record<string, object>} */
    const result = {};
    for (const [name, generator] of this._store) {
      result[name] = generator;
    }
    return result;
  }

  /**
   * Checks whether a generator is registered under the given namespace.
   *
   * @param {string} name - Namespace to check.
   * @returns {boolean} `true` if the namespace exists, otherwise `false`.
   */
  has(name) {
    return this._store.has(name);
  }
}
