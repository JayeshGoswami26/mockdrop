import { describe, it, expect } from 'vitest';
import mockdrop from '../src/index.js';

describe('animal generator', () => {
  const categories = [
    'bear', 'bird', 'cat', 'cetacean', 'cow', 'crocodilia', 'dog', 'fish',
    'horse', 'insect', 'lion', 'petName', 'rabbit', 'rodent', 'snake', 'type',
  ];

  it.each(categories)('%s() returns a non-empty string', (method) => {
    const value = mockdrop.animal[method]();
    expect(typeof value).toBe('string');
    expect(value.length).toBeGreaterThan(0);
  });

  it('type() returns a plausible biological category', () => {
    const types = ['Mammal', 'Bird', 'Reptile', 'Amphibian', 'Fish', 'Insect', 'Arachnid', 'Crustacean', 'Mollusk'];
    expect(types).toContain(mockdrop.animal.type());
  });
});
