/**
 * @file Vitest Configuration for Mockdrop
 * @description Points the test runner at the `tests/` directory and enables
 *              global test helpers so specs don't need manual imports.
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Root directory where Vitest looks for test files.
    dir: 'tests',

    // Make `describe`, `it`, `expect`, etc. available without explicit imports.
    globals: true,

    // Node environment is the sensible default for a data-generation library.
    environment: 'node',
  },
});
