import { PRNG } from './prng.js';
import { Clock } from './clock.js';
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

    /**
     * The instance's source of "now". Live by default; `setNow()` pins it so
     * relative dates stop moving between runs.
     *
     * @type {Clock}
     */
    this.clock = new Clock();

    this.registry = new GeneratorRegistry();

    // Register all generators
    this.registry.register('person', createPersonGenerator(this.prng));
    this.registry.register('internet', createInternetGenerator(this.prng, this.clock));
    this.registry.register('company', createCompanyGenerator(this.prng));
    this.registry.register('date', createDateGenerator(this.prng, this.clock));
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

  // ─── Clock ──────────────────────────────────────────────────────────

  /**
   * Pins "now" for every date generator that works relative to the present —
   * `past()`, `future()`, `recent()`, `soon()`, `anytime()`, `birthdate()`,
   * and `internet.jwt()`'s `iat`/`exp` claims.
   *
   * Seeding alone does not make those reproducible: the seed fixes the random
   * offset, but the offset is measured from whenever the code ran. Under SSR
   * the mock module is evaluated once on the server and again at hydration, so
   * the two passes produce different dates and React reports a hydration
   * mismatch. Pinning the clock removes that second variable — seed + fixed
   * clock is then enough to reproduce a dataset exactly.
   *
   * Independent of {@link Mockdrop#setSeed}: pinning the clock does not reset
   * the PRNG, and re-seeding does not release the clock.
   *
   * @param {Date | string | number | null} [date] - The instant to pin to, or
   *        `null` to resume the live system clock.
   * @returns {void}
   * @throws {TypeError} When `date` is not a valid date.
   *
   * @example
   * mockdrop.setSeed(1);
   * mockdrop.setNow(new Date('2026-06-25'));
   * mockdrop.recent(7);   // identical on the server and during hydration
   *
   * @example
   * mockdrop.setNow(null); // back to live time
   */
  setNow(date) {
    this.clock.set(date);
  }

  /**
   * The instant the date generators currently treat as "now" — the pinned
   * value, or the live system time when the clock is not pinned.
   *
   * Returns a fresh `Date` each call, so mutating it cannot corrupt the
   * pinned instant.
   *
   * @returns {Date}
   */
  getNow() {
    return this.clock.date();
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
   * Fields resolve in declaration order, and your own functions receive the
   * row built so far as their second argument, so a field can depend on the
   * ones above it — a count that stays inside its own total, an end date that
   * follows its own start date.
   *
   * Always returns an array (even for count = 1) so consuming code can map
   * over the result without shape checks.
   *
   * @param {Object} schema - Key/value pairs describing one item.
   * @param {number} [count=1] - Number of items to generate.
   * @param {{ derive?: (row: Object, index: number) => Object }} [options]
   *        `derive` runs once per row after every field is resolved, for
   *        whole-row computation. Return a new row to replace it, or mutate
   *        the one you are given and return nothing.
   * @returns {Array<Object>} The generated items.
   *
   * @example
   * mockdrop.create({
   *   tasksTotal: () => mockdrop.helpers.int(8, 40),
   *   tasksDone:  (i, row) => mockdrop.helpers.int(0, row.tasksTotal),
   *   progress:   (i, row) => Math.round((row.tasksDone / row.tasksTotal) * 100),
   * }, 20);
   *
   * @example
   * mockdrop.create(schema, 20, {
   *   derive: (row) => ({ ...row, slug: slugify(row.title) }),
   * });
   */
  create(schema, count = 1, options = {}) {
    if (!isPlainObject(schema)) {
      throw new TypeError('Schema must be an object');
    }

    const { derive } = options || {};
    if (derive !== undefined && typeof derive !== 'function') {
      throw new TypeError('create() expects `derive` to be a function.');
    }

    // Stateful generators restart here, not in `_generate`, so that a nested
    // schema (generated one row at a time) doesn't reset on every row and
    // hand back the same record each time.
    resetSchema(schema);

    return this._generate(schema, count, { derive });
  }

  /**
   * Row-building half of {@link Mockdrop#create}, without the reset pass.
   *
   * @param {Object} schema
   * @param {number} count
   * @param {Object} [options]
   * @param {(row: Object, index: number) => Object} [options.derive] - Whole-row
   *        post-pass, applied once per row.
   * @param {Object} [options.parent] - The enclosing row, handed to schema
   *        functions as their third argument so a nested or child schema can
   *        sit inside its parent's values.
   * @param {(index: number) => Object} [options.seed] - Builds the starting
   *        row, so the schema's own functions already see those fields in
   *        `row`. The entity presets use this to expose the preset's fields
   *        to an override schema.
   * @returns {Array<Object>}
   * @private
   */
  _generate(schema, count, { derive, parent, seed } = {}) {
    const results = [];

    for (let i = 0; i < count; i++) {
      // `item` is handed to each field function as it is being filled in, so
      // a field sees every key declared above it and none of the ones below.
      const item = seed ? { ...seed(i) } : {};

      for (const [key, valueFn] of Object.entries(schema)) {
        if (typeof valueFn === 'function') {
          // Built-in generators run with their own defaults; only user-supplied
          // functions receive the index, so a bare `mockdrop.pastDate` is never
          // called as `pastDate(0)` with the index posing as its `years` arg.
          item[key] = valueFn[GENERATOR] ? valueFn() : valueFn(i, item, parent);
        } else if (isPlainObject(valueFn)) {
          // Nested schema. Only plain objects qualify — a Date or an array in
          // a schema is a value the caller wants copied verbatim. The row being
          // built is passed down as the sub-schema's `parent`.
          item[key] = this._generate(valueFn, 1, { parent: item })[0];
        } else {
          // Static value
          item[key] = valueFn;
        }
      }

      // A `derive` that mutates and returns nothing is as valid as one that
      // returns a new object, so `undefined` means "keep the row as built".
      const derived = derive ? derive(item, i) : undefined;
      results.push(derived === undefined ? item : derived);
    }

    return results;
  }

  /**
   * `create()` with every row pre-filled from `seed(index)` before the schema
   * runs, so a schema function's `row` argument already holds those fields.
   *
   * This is how the entity presets apply overrides: the preset builds its own
   * row first, then the override schema resolves on top of it and can read
   * what the preset produced.
   *
   * @param {Object} schema
   * @param {number} count
   * @param {(index: number) => Object} seed
   * @param {(row: Object, index: number) => Object} [derive]
   * @returns {Array<Object>}
   * @private
   */
  _createSeeded(schema, count, seed, derive) {
    if (!isPlainObject(schema)) {
      throw new TypeError('Schema must be an object');
    }
    if (derive !== undefined && typeof derive !== 'function') {
      throw new TypeError('`derive` must be a function.');
    }

    resetSchema(schema);

    return this._generate(schema, count, { derive, seed });
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
   * The schema is a full `create()` schema, so row-aware fields and `derive`
   * work here exactly as they do there.
   *
   * @param {Object} schema - Schema for a single record.
   * @param {{ page?: number, perPage?: number, total?: number,
   *          derive?: (row: Object, index: number) => Object }} [options]
   * @returns {{ data: Array<Object>, meta: { page: number, perPage: number,
   *            total: number, totalPages: number, hasNextPage: boolean,
   *            hasPrevPage: boolean } }}
   *
   * @example
   * mockdrop.paginate({ id: mockdrop.uuid }, { page: 7, perPage: 20, total: 137 });
   * // → { data: [ …17 records… ], meta: { page: 7, totalPages: 7, hasNextPage: false, … } }
   */
  paginate(schema, options = {}) {
    const { page = 1, perPage = 10, total = 100, derive } = options;

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
      data: size > 0 ? this.create(schema, size, { derive }) : [],
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
