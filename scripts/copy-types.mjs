/**
 * @file Publishes the hand-written TypeScript definitions alongside the
 *       build output. `src/types/index.d.ts` is the single source of truth;
 *       this copies it to `dist/index.d.ts`, which is what package.json's
 *       `types` field and `exports["."].types` condition point at.
 */
import { copyFileSync, mkdirSync } from 'node:fs';

mkdirSync('dist', { recursive: true });
copyFileSync('src/types/index.d.ts', 'dist/index.d.ts');
