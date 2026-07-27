import { PRNG } from './prng.js';
import { GeneratorRegistry } from './registry.js';

import { createPersonGenerator } from '../generators/person.js';
import { createInternetGenerator } from '../generators/internet.js';
import { createCompanyGenerator } from '../generators/company.js';
import { createDateGenerator } from '../generators/date.js';
import { createFinanceGenerator } from '../generators/finance.js';
import { createLoremGenerator } from '../generators/lorem.js';
import { createSystemGenerator } from '../generators/system.js';
import { createHelpersGenerator } from '../generators/helpers.js';
import { createLocationGenerator } from '../generators/location.js';
import { createAirlineGenerator } from '../generators/airline.js';
import { createAnimalGenerator } from '../generators/animal.js';
import { createColorGenerator } from '../generators/color.js';
import { createPhoneGenerator } from '../generators/phone.js';

/**
 * Marks a function as a built-in Mockdrop generator.
 *
 * `create()` calls tagged functions with **no arguments** so they use their
 * own defaults, and calls untagged (user-written) functions with the item
 * index. Without this distinction, passing a bare reference such as
 * `mockdrop.pastDate` would invoke `pastDate(0)`, `pastDate(1)`, … and the
 * index would be silently swallowed as the generator's first parameter.
 *
 * @type {symbol}
 */
export const GENERATOR = Symbol.for('mockdrop.generator');

export class Mockdrop {
  constructor(seed) {
    this.prng = new PRNG(seed);
    this.registry = new GeneratorRegistry();

    // Register all generators
    this.registry.register('person', createPersonGenerator(this.prng));
    this.registry.register('internet', createInternetGenerator(this.prng));
    this.registry.register('company', createCompanyGenerator(this.prng));
    this.registry.register('date', createDateGenerator(this.prng));
    this.registry.register('finance', createFinanceGenerator(this.prng));
    this.registry.register('lorem', createLoremGenerator(this.prng));
    this.registry.register('system', createSystemGenerator(this.prng));
    this.registry.register('helpers', createHelpersGenerator(this.prng));
    this.registry.register('location', createLocationGenerator(this.prng));
    this.registry.register('airline', createAirlineGenerator(this.prng));
    this.registry.register('animal', createAnimalGenerator(this.prng));
    this.registry.register('color', createColorGenerator(this.prng));
    this.registry.register('phone', createPhoneGenerator(this.prng));

    const generators = this.registry.getAll();
    // Namespace names are reserved: a method that happens to share a name
    // with a namespace (e.g. `person.phone()` vs. the `phone` namespace,
    // `internet.color()` vs. the `color` namespace, `airline.airline()`
    // vs. the `airline` namespace itself) must never overwrite that
    // namespace's top-level slot — the namespace object always wins there,
    // and the method stays reachable at `mockdrop.<namespace>.<method>()`.
    const namespaceNames = new Set(Object.keys(generators));

    // Pass 1: attach each namespace to the instance, binding every method's
    // `this` to its sibling methods so cross-calls within a namespace work
    // (e.g. `person.fullName()` calling `this.firstName()`).
    for (const [namespace, methods] of Object.entries(generators)) {
      for (const [methodName, methodFn] of Object.entries(methods)) {
        if (typeof methodFn === 'function') {
          const bound = methodFn.bind(methods);
          bound[GENERATOR] = true; // see GENERATOR above — affects create()
          methods[methodName] = bound;
        }
      }
      this[namespace] = methods;
    }

    // Pass 2: expose top-level aliases for convenience (`mockdrop.fullName()`
    // instead of `mockdrop.person.fullName()`), skipping anything that would
    // shadow a namespace or a method already aliased by an earlier namespace.
    for (const methods of Object.values(generators)) {
      for (const [methodName, methodFn] of Object.entries(methods)) {
        if (namespaceNames.has(methodName)) continue;
        if (!this[methodName]) {
          this[methodName] = methodFn;
        }
      }
    }

    // `user` is an alias namespace for `person`, with `name()` mapped to
    // `fullName()` so schemas can read naturally: mockdrop.user.name
    this.user = { ...this.person, name: this.person.fullName };
  }

  setSeed(seed) {
    this.prng.setSeed(seed);
  }

  /**
   * Generates an array of objects from a schema.
   *
   * Schema values may be:
   *  - a built-in generator reference (`mockdrop.projectName`) — invoked once
   *    per item with its own defaults
   *  - your own function (`() => mockdrop.email({ domain: 'mailinator.com' })`
   *    or `(i) => i + 1`) — invoked once per item and handed the item index,
   *    which is useful for auto-incrementing ids
   *  - a nested schema object — resolved recursively per item
   *  - any other value — copied as-is into every item
   *
   * Always returns an array (even for count = 1) so consuming code can map
   * over the result without shape checks.
   *
   * @param {Object} schema - Key/value pairs describing one item.
   * @param {number} [count=1] - Number of items to generate.
   * @returns {Array<Object>} The generated items.
   */
  create(schema, count = 1) {
    if (typeof schema !== 'object' || schema === null) {
      throw new TypeError('Schema must be an object');
    }

    const results = [];

    for (let i = 0; i < count; i++) {
      const item = {};
      for (const [key, valueFn] of Object.entries(schema)) {
        if (typeof valueFn === 'function') {
          // Built-in generators run with their own defaults; only user-supplied
          // functions receive the index, so a bare `mockdrop.pastDate` is never
          // called as `pastDate(0)` with the index posing as its `years` arg.
          item[key] = valueFn[GENERATOR] ? valueFn() : valueFn(i);
        } else if (typeof valueFn === 'object' && valueFn !== null) {
          // Support for nested schemas
          item[key] = this.create(valueFn, 1)[0];
        } else {
          // Static value
          item[key] = valueFn;
        }
      }
      results.push(item);
    }
    
    return results;
  }
}
