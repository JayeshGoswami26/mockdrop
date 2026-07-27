import { luhnCheckDigit } from '../core/luhn.js';

const NUMBER_FORMATS = {
  US: (prng) => `+1 (${prng.string(3, '0123456789')}) ${prng.string(3, '0123456789')}-${prng.string(4, '0123456789')}`,
  UK: (prng) => `+44 ${prng.string(4, '0123456789')} ${prng.string(6, '0123456789')}`,
  IN: (prng) => `+91 ${prng.string(5, '0123456789')} ${prng.string(5, '0123456789')}`,
  INTERNATIONAL: (prng) => `+${prng.int(1, 99)} ${prng.string(10, '0123456789')}`,
};

export function createPhoneGenerator(prng) {
  return {
    /**
     * @param {'US' | 'UK' | 'IN' | 'INTERNATIONAL' | string} [format='US']
     */
    number(format = 'US') {
      const build = NUMBER_FORMATS[format.toUpperCase()] || NUMBER_FORMATS.INTERNATIONAL;
      return build(prng);
    },
    /**
     * A 15-digit IMEI (8-digit TAC + 6-digit serial + Luhn check digit),
     * formatted as `##-######-######-#`.
     */
    imei() {
      const body = prng.string(14, '0123456789');
      const digits = body + luhnCheckDigit(body);
      return `${digits.slice(0, 2)}-${digits.slice(2, 8)}-${digits.slice(8, 14)}-${digits.slice(14)}`;
    },
  };
}
