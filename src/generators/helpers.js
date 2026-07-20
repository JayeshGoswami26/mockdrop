export function createHelpersGenerator(prng) {
  return {
    pick(array) {
      if (!Array.isArray(array) || array.length === 0) return undefined;
      return prng.pick(array);
    },
    pickMultiple(array, count) {
      if (!Array.isArray(array) || array.length === 0) return [];
      return prng.pickMultiple(array, count);
    },
    pickUnique(array, count) {
      if (!Array.isArray(array) || array.length === 0) return [];
      return prng.pickUnique(array, count);
    },
    shuffle(array) {
      if (!Array.isArray(array)) return [];
      return prng.shuffle(array);
    },
    unique(fn, count, maxRetries = 100) {
      const results = new Set();
      let retries = 0;
      const maxAttempts = count * maxRetries;
      
      while (results.size < count) {
        if (retries >= maxAttempts) {
          throw new Error(`unique() could not find ${count} unique values after ${maxAttempts} attempts.`);
        }
        const val = fn();
        // Since Set uses strict equality, we stringify objects for uniqueness if needed, but for simplicity we rely on Set
        const sizeBefore = results.size;
        results.add(val);
        if (results.size === sizeBefore) {
          retries++;
        }
      }
      return Array.from(results);
    },
    maybe(fn, probability = 0.5) {
      return prng.bool(probability) ? fn() : null;
    },
    replicate(fn, count) {
      const result = [];
      for (let i = 0; i < count; i++) {
        result.push(fn());
      }
      return result;
    },
    int(min, max) {
      return prng.int(min, max);
    },
    float(min, max, decimals = 2) {
      return prng.float(min, max, decimals);
    },
    bool(probability = 0.5) {
      return prng.bool(probability);
    },
    letter() {
      return prng.char('abcdefghijklmnopqrstuvwxyz');
    },
    alphaNumeric(length = 8) {
      return prng.string(length, 'abcdefghijklmnopqrstuvwxyz0123456789');
    },
    arrayElement(array) {
      return this.pick(array);
    },
    objectValue(obj) {
      if (!obj || typeof obj !== 'object') return undefined;
      const keys = Object.keys(obj);
      if (keys.length === 0) return undefined;
      const key = prng.pick(keys);
      return obj[key];
    },
    objectKey(obj) {
      if (!obj || typeof obj !== 'object') return undefined;
      const keys = Object.keys(obj);
      if (keys.length === 0) return undefined;
      return prng.pick(keys);
    },
    enumValue(enumObj) {
      return this.objectValue(enumObj);
    }
  };
}
