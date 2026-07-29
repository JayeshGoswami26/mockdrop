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
import { createEntityGenerator } from '../generators/entity.js';

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

/**
 * Marks a generator that carries state across the rows of a single `create()`
 * call — `refUnique` and `refEach` track which records they have handed out.
 * `create()` calls this hook once before generating so that reusing the same
 * schema object for a second call starts from a clean slate instead of
 * continuing (or exhausting) the previous run's pool.
 *
 * @type {symbol}
 */
export const RESET = Symbol.for('mockdrop.reset');

/**
 * True for `{}`-style objects only. Dates, arrays, class instances and the
 * like are values to copy, not nested schemas to walk.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Validates a `ref()` source and returns it as a plain array.
 *
 * @param {readonly unknown[]} source
 * @param {string} method - Name used in the error message.
 * @returns {unknown[]}
 */
function toRefList(source, method) {
  if (!Array.isArray(source)) {
    throw new TypeError(`${method}() expects an array of records to reference.`);
  }
  if (source.length === 0) {
    throw new RangeError(`${method}() cannot reference an empty array.`);
  }
  return source;
}

/**
 * Reads `key` off a referenced record, or returns the whole record when no
 * key was supplied.
 *
 * @param {unknown} record
 * @param {string|number|symbol|undefined} key
 * @returns {unknown}
 */
function projectRef(record, key) {
  return key === undefined ? record : record?.[key];
}

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

    // Entity presets compose the namespaces above, so they are built last and
    // attached directly — going through the registry would expose `user`,
    // `order`, etc. as top-level aliases and collide with the `user` namespace.
    this.entity = createEntityGenerator(this);
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
    if (!isPlainObject(schema)) {
      throw new TypeError('Schema must be an object');
    }

    // Stateful generators restart here, not in `_generate`, so that a nested
    // schema (generated one row at a time) doesn't reset on every row and
    // hand back the same record each time.
    resetSchema(schema);

    return this._generate(schema, count);
  }

  /**
   * Row-building half of {@link Mockdrop#create}, without the reset pass.
   *
   * @param {Object} schema
   * @param {number} count
   * @returns {Array<Object>}
   * @private
   */
  _generate(schema, count) {
    const results = [];

    for (let i = 0; i < count; i++) {
      const item = {};
      for (const [key, valueFn] of Object.entries(schema)) {
        if (typeof valueFn === 'function') {
          // Built-in generators run with their own defaults; only user-supplied
          // functions receive the index, so a bare `mockdrop.pastDate` is never
          // called as `pastDate(0)` with the index posing as its `years` arg.
          item[key] = valueFn[GENERATOR] ? valueFn() : valueFn(i);
        } else if (isPlainObject(valueFn)) {
          // Nested schema. Only plain objects qualify — a Date or an array in
          // a schema is a value the caller wants copied verbatim.
          item[key] = this._generate(valueFn, 1)[0];
        } else {
          // Static value
          item[key] = valueFn;
        }
      }
      results.push(item);
    }

    return results;
  }

  // ─── Relations ──────────────────────────────────────────────────────

  /**
   * References a record from an already-generated array, so rows can share
   * owners the way real data does — twenty leads belonging to five reps
   * rather than twenty unrelated names.
   *
   * Records repeat, which is what you want for a many-to-one relation.
   *
   * @template T
   * @param {readonly T[]} source - Records to reference.
   * @param {keyof T} [key] - Field to read; omit to embed the whole record.
   * @returns {() => any} A generator for use in a schema.
   *
   * @example
   * const reps  = mockdrop.create({ id: mockdrop.uuid, name: mockdrop.user.name }, 5);
   * const leads = mockdrop.create({
   *   ownerId: mockdrop.ref(reps, 'id'),
   *   owner:   mockdrop.ref(reps),
   * }, 20);
   */
  ref(source, key) {
    const list = toRefList(source, 'ref');
    const generator = () => projectRef(this.prng.pick(list), key);
    generator[GENERATOR] = true;
    return generator;
  }

  /**
   * Like {@link Mockdrop#ref} but never repeats a record — a one-to-one
   * relation. Throws once the source is exhausted, so generating more rows
   * than there are records is a loud error rather than silent duplication.
   *
   * @template T
   * @param {readonly T[]} source
   * @param {keyof T} [key]
   * @returns {() => any}
   */
  refUnique(source, key) {
    const list = toRefList(source, 'refUnique');
    let pool = this.prng.shuffle(list);

    const generator = () => {
      if (pool.length === 0) {
        throw new RangeError(
          `refUnique() ran out of records: the source holds ${list.length}, ` +
          'but more rows than that were requested.',
        );
      }
      return projectRef(pool.shift(), key);
    };

    generator[GENERATOR] = true;
    generator[RESET] = () => { pool = this.prng.shuffle(list); };
    return generator;
  }

  /**
   * Like {@link Mockdrop#ref} but cycles through the source in order, giving
   * every record an even share. Useful when a demo should show each owner
   * holding roughly the same number of rows instead of a lopsided random
   * split. Wraps around once the source is used up.
   *
   * @template T
   * @param {readonly T[]} source
   * @param {keyof T} [key]
   * @returns {() => any}
   */
  refEach(source, key) {
    const list = toRefList(source, 'refEach');
    let cursor = 0;

    const generator = () => projectRef(list[cursor++ % list.length], key);
    generator[GENERATOR] = true;
    generator[RESET] = () => { cursor = 0; };
    return generator;
  }

  // ─── API shapes ─────────────────────────────────────────────────────

  /**
   * Generates one page of a paginated API response — the shape a frontend
   * actually consumes, rather than a bare array.
   *
   * The final page is short when `total` isn't a multiple of `perPage`, and a
   * page past the end comes back empty, both matching how a real endpoint
   * behaves.
   *
   * @param {Object} schema - Schema for a single record.
   * @param {{ page?: number, perPage?: number, total?: number }} [options]
   * @returns {{ data: Array<Object>, meta: { page: number, perPage: number,
   *            total: number, totalPages: number, hasNextPage: boolean,
   *            hasPrevPage: boolean } }}
   *
   * @example
   * mockdrop.paginate({ id: mockdrop.uuid }, { page: 7, perPage: 20, total: 137 });
   * // → { data: [ …17 records… ], meta: { page: 7, totalPages: 7, hasNextPage: false, … } }
   */
  paginate(schema, options = {}) {
    const { page = 1, perPage = 10, total = 100 } = options;

    if (!Number.isInteger(page) || page < 1) {
      throw new RangeError('paginate() requires `page` to be an integer >= 1.');
    }
    if (!Number.isInteger(perPage) || perPage < 1) {
      throw new RangeError('paginate() requires `perPage` to be an integer >= 1.');
    }
    if (!Number.isInteger(total) || total < 0) {
      throw new RangeError('paginate() requires `total` to be an integer >= 0.');
    }

    const totalPages = Math.ceil(total / perPage);
    const offset = (page - 1) * perPage;
    const size = Math.max(0, Math.min(perPage, total - offset));

    return {
      data: size > 0 ? this.create(schema, size) : [],
      meta: {
        page,
        perPage,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1 && page <= totalPages + 1,
      },
    };
  }
}

/**
 * Walks a schema and restarts every stateful generator it contains.
 *
 * @param {Object} schema
 * @returns {void}
 */
function resetSchema(schema) {
  for (const value of Object.values(schema)) {
    if (typeof value === 'function') {
      value[RESET]?.();
    } else if (isPlainObject(value)) {
      resetSchema(value);
    }
  }
}
