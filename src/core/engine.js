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
  }

  setSeed(seed) {
    this.prng.setSeed(seed);
  }

  /**
   * Generates dummy data based on a schema
   * @param {Object} schema - Key-value pairs where values are functions returning dummy data
   * @param {number} count - Number of items to generate (default: 1)
   * @returns {Array|Object} Generated data (Array if count > 1 or explicitly requested, else Array)
   * We will always return an array based on the user's example in the prompt, even for count = 1.
   * "and i get 20 items of in this array" -> always return array if count passed.
   * Wait, if no count is passed, perhaps return array of 1, or just let it be. Let's return array for consistency with `create`.
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
