import colorNames from '../data/colorNames.js';

const CSS_FUNCTIONS = ['rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'color'];
const CSS_COLOR_SPACES = [
  'srgb', 'srgb-linear', 'display-p3', 'a98-rgb', 'prophoto-rgb', 'rec2020',
  'xyz', 'xyz-d50', 'xyz-d65',
];

export function createColorGenerator(prng) {
  return {
    /**
     * @param {{ includeAlpha?: boolean, format?: 'css' | 'array' }} [options]
     */
    rgb(options = {}) {
      const { includeAlpha = false, format = 'css' } = options;
      const r = prng.int(0, 255);
      const g = prng.int(0, 255);
      const b = prng.int(0, 255);

      if (format === 'array') {
        return includeAlpha ? [r, g, b, prng.float(0, 1, 2)] : [r, g, b];
      }
      return includeAlpha
        ? `rgba(${r}, ${g}, ${b}, ${prng.float(0, 1, 2)})`
        : `rgb(${r}, ${g}, ${b})`;
    },
    cmyk() {
      const c = prng.int(0, 100);
      const m = prng.int(0, 100);
      const y = prng.int(0, 100);
      const k = prng.int(0, 100);
      return `device-cmyk(${c}% ${m}% ${y}% ${k}%)`;
    },
    /**
     * @param {{ includeAlpha?: boolean }} [options]
     */
    hsl(options = {}) {
      const { includeAlpha = false } = options;
      const h = prng.int(0, 360);
      const s = prng.int(0, 100);
      const l = prng.int(0, 100);
      return includeAlpha
        ? `hsla(${h}, ${s}%, ${l}%, ${prng.float(0, 1, 2)})`
        : `hsl(${h}, ${s}%, ${l}%)`;
    },
    hwb() {
      const h = prng.int(0, 360);
      const w = prng.int(0, 100);
      const b = prng.int(0, 100);
      return `hwb(${h} ${w}% ${b}%)`;
    },
    lab() {
      const l = prng.float(0, 100, 2);
      const a = prng.float(-125, 125, 2);
      const b = prng.float(-125, 125, 2);
      return `lab(${l}% ${a} ${b})`;
    },
    lch() {
      const l = prng.float(0, 100, 2);
      const c = prng.float(0, 150, 2);
      const h = prng.float(0, 360, 2);
      return `lch(${l}% ${c} ${h})`;
    },
    /** A human-friendly color name, e.g. "Cerulean". */
    human() {
      return prng.pick(colorNames);
    },
    /** A CSS color space keyword usable inside `color()`. */
    space() {
      return prng.pick(CSS_COLOR_SPACES);
    },
    /** A CSS color function name, e.g. "hwb". */
    cssSupportedFunction() {
      return prng.pick(CSS_FUNCTIONS);
    },
    cssSupportedSpace() {
      return prng.pick(CSS_COLOR_SPACES);
    },
    /**
     * @param {{ space?: string }} [options]
     */
    colorByCSSColorSpace(options = {}) {
      const space = options.space || this.space();
      const r = prng.float(0, 1, 3);
      const g = prng.float(0, 1, 3);
      const b = prng.float(0, 1, 3);
      return `color(${space} ${r} ${g} ${b})`;
    },
  };
}
