/**
 * @file Rollup Configuration for Mockdrop
 * @description Builds three output formats (CJS, ESM, UMD) from a single
 *              ES-module source entry point. Minifies all bundles via terser
 *              and stamps each with a version banner.
 */

import { readFileSync } from 'node:fs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

// Read package metadata once so the banner stays in sync automatically.
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

/**
 * Banner injected at the top of every output bundle.
 * Includes package name, version, license, and build timestamp.
 */
const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.description}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 * Released under the ${pkg.license} License
 */`;

/** @type {import('rollup').RollupOptions} */
export default {
  input: 'src/index.js',

  output: [
    // ── CommonJS (Node.js require()) ──────────────────────────────────
    {
      file: pkg.main,          // dist/mockdrop.cjs.js
      format: 'cjs',
      exports: 'named',
      banner,
      sourcemap: true,
    },

    // ── ES Module (import / export) ───────────────────────────────────
    {
      file: pkg.module,        // dist/mockdrop.esm.js
      format: 'es',
      banner,
      sourcemap: true,
    },

    // ── UMD (browser <script> tag + AMD) ──────────────────────────────
    {
      file: pkg.browser,       // dist/mockdrop.umd.js
      format: 'umd',
      name: 'mockdrop',        // global variable name when loaded via <script>
      exports: 'named',
      banner,
      sourcemap: true,
    },
  ],

  plugins: [
    // Resolve bare module specifiers (node_modules look-up).
    resolve(),

    // Minify all output bundles while preserving the banner comment.
    terser({
      format: {
        // Keep the leading banner comment intact after minification.
        comments: /^!/,
      },
    }),
  ],
};
