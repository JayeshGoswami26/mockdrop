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

    // Expose namespaces directly on the instance
    const generators = this.registry.getAll();
    for (const [namespace, methods] of Object.entries(generators)) {
      this[namespace] = methods;
      
      // Bind methods to the namespace so `this` is correct inside them
      for (const [methodName, methodFn] of Object.entries(methods)) {
        if (typeof methodFn === 'function') {
          this[namespace][methodName] = methodFn.bind(methods);
          
          // Expose top-level aliases (avoiding overwriting core methods)
          if (!this[methodName]) {
            this[methodName] = this[namespace][methodName];
          }
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
   *  - a generator reference (`mockdrop.projectName`) or arrow function
   *    (`() => mockdrop.email({ domain: 'mailinator.com' })`) — invoked once
   *    per item, receiving the item index (useful for incrementing ids)
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
          // Pass the current index to the function in case they want an auto-incrementing ID
          item[key] = valueFn(i);
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
