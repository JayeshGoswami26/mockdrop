/**
 * @file Luhn checksum helper
 * @module core/luhn
 * @description Shared by `finance.creditCardNumber()` and `phone.imei()` so
 *              generated numbers pass real-world checksum validation without
 *              being tied to any actual account or device.
 */

/**
 * Computes the Luhn check digit that should be appended to `digits` so the
 * resulting full number passes the Luhn (mod 10) algorithm.
 *
 * @param {string} digits - The number's digits, without a check digit.
 * @returns {number} The check digit (0-9) to append.
 */
export function luhnCheckDigit(digits) {
  let sum = 0;
  let double = true; // Doubling starts from the rightmost digit of `digits`.

  for (let i = digits.length - 1; i >= 0; i--) {
    let n = digits.charCodeAt(i) - 48; // '0' -> 48
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }

  return (10 - (sum % 10)) % 10;
}
