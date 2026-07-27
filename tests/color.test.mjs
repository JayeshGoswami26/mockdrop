import { describe, it, expect } from 'vitest';
import mockdrop from '../src/index.js';

describe('color generator', () => {
  it('rgb() returns a css rgb() string by default', () => {
    expect(mockdrop.color.rgb()).toMatch(/^rgb\(\d{1,3}, \d{1,3}, \d{1,3}\)$/);
  });

  it('rgb() supports alpha and array format', () => {
    expect(mockdrop.color.rgb({ includeAlpha: true })).toMatch(/^rgba\(\d{1,3}, \d{1,3}, \d{1,3}, [\d.]+\)$/);
    const arr = mockdrop.color.rgb({ format: 'array' });
    expect(Array.isArray(arr)).toBe(true);
    expect(arr).toHaveLength(3);
  });

  it('cmyk() returns a device-cmyk() string', () => {
    expect(mockdrop.color.cmyk()).toMatch(/^device-cmyk\(\d{1,3}% \d{1,3}% \d{1,3}% \d{1,3}%\)$/);
  });

  it('hsl()/hwb()/lab()/lch() return well-formed css strings', () => {
    expect(mockdrop.color.hsl()).toMatch(/^hsl\(\d{1,3}, \d{1,3}%, \d{1,3}%\)$/);
    expect(mockdrop.color.hwb()).toMatch(/^hwb\(\d{1,3} \d{1,3}% \d{1,3}%\)$/);
    expect(mockdrop.color.lab()).toMatch(/^lab\([\d.]+% -?[\d.]+ -?[\d.]+\)$/);
    expect(mockdrop.color.lch()).toMatch(/^lch\([\d.]+% [\d.]+ [\d.]+\)$/);
  });

  it('human() returns a known color name', () => {
    expect(typeof mockdrop.color.human()).toBe('string');
  });

  it('space()/cssSupportedSpace() return valid CSS color-space keywords', () => {
    const spaces = ['srgb', 'srgb-linear', 'display-p3', 'a98-rgb', 'prophoto-rgb', 'rec2020', 'xyz', 'xyz-d50', 'xyz-d65'];
    expect(spaces).toContain(mockdrop.color.space());
    expect(spaces).toContain(mockdrop.color.cssSupportedSpace());
  });

  it('cssSupportedFunction() returns a valid CSS color function name', () => {
    const fns = ['rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'color'];
    expect(fns).toContain(mockdrop.color.cssSupportedFunction());
  });

  it('colorByCSSColorSpace() returns a color() function string', () => {
    expect(mockdrop.color.colorByCSSColorSpace()).toMatch(/^color\([a-z0-9-]+ [\d.]+ [\d.]+ [\d.]+\)$/);
    expect(mockdrop.color.colorByCSSColorSpace({ space: 'display-p3' })).toMatch(/^color\(display-p3 /);
  });
});
