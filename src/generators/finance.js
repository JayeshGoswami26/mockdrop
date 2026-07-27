import currencies from '../data/currencies.js';
import countries from '../data/countries.js';
import companies from '../data/companies.js';
import { luhnCheckDigit } from '../core/luhn.js';

/** Card-issuer number prefixes and total digit lengths (industry-standard ranges). */
const CARD_ISSUERS = {
  visa: { prefixes: ['4'], length: 16 },
  mastercard: { prefixes: ['51', '52', '53', '54', '55'], length: 16 },
  american_express: { prefixes: ['34', '37'], length: 15 },
  discover: { prefixes: ['6011'], length: 16 },
  diners_club: { prefixes: ['300', '301', '302', '303', '304', '305', '36', '38'], length: 14 },
  jcb: { prefixes: ['35'], length: 16 },
  maestro: { prefixes: ['50', '56', '57', '58', '67'], length: 16 },
  unionpay: { prefixes: ['62'], length: 16 },
};
const CARD_ISSUER_NAMES = Object.keys(CARD_ISSUERS);

const ACCOUNT_NAMES = [
  'Checking Account', 'Savings Account', 'Business Checking', 'Business Savings',
  'Money Market Account', 'Certificate of Deposit', 'Investment Account',
  'Retirement Account', 'Joint Account', 'Trust Account',
];

const TRANSACTION_TYPES = ['deposit', 'withdrawal', 'payment', 'invoice', 'transfer'];

export function createFinanceGenerator(prng) {
  return {
    amount(min = 0, max = 10000, decimals = 2) {
      const raw = this.amountRaw(min, max, decimals);
      return raw.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    },
    amountRaw(min = 0, max = 10000, decimals = 2) {
      return prng.float(min, max, decimals);
    },
    /** @returns {{ code: string, symbol: string, name: string, numericCode: string }} */
    currency() {
      return prng.pick(currencies);
    },
    currencyCode() {
      return this.currency().code;
    },
    currencyName() {
      return this.currency().name;
    },
    currencyNumericCode() {
      return this.currency().numericCode;
    },
    currencySymbol() {
      return this.currency().symbol;
    },
    accountName() {
      return prng.pick(ACCOUNT_NAMES);
    },
    accountNumber(length = 10) {
      return prng.string(length, '0123456789');
    },
    routingNumber() {
      return prng.string(9, '0123456789');
    },
    /** SWIFT/BIC code: 4-letter bank code + 2-letter country + 2 alnum location [+ 3 alnum branch]. */
    bic() {
      const bank = prng.string(4, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      const country = prng.pick(countries).code;
      const location = prng.string(2, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
      const branch = prng.bool(0.5) ? prng.string(3, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') : '';
      return `${bank}${country}${location}${branch}`;
    },
    creditCard() {
      // Masked variant — only the first four digits are real.
      const start = prng.pick(['4', '5', '3']);
      return `${start}${prng.string(3, '0123456789')} XXXX XXXX ${prng.string(4, '0123456789')}`;
    },
    creditCardFull() {
      const start = prng.pick(['4', '5', '3']);
      const length = start === '3' ? 15 : 16;
      const digits = start + prng.string(length - 1, '0123456789');
      if (length === 15) {
        return `${digits.substring(0, 4)} ${digits.substring(4, 10)} ${digits.substring(10, 15)}`;
      }
      return `${digits.substring(0, 4)} ${digits.substring(4, 8)} ${digits.substring(8, 12)} ${digits.substring(12, 16)}`;
    },
    /** e.g. 'visa', 'mastercard', 'american_express', 'discover', 'diners_club', 'jcb', 'maestro', 'unionpay' */
    creditCardIssuer() {
      return prng.pick(CARD_ISSUER_NAMES);
    },
    /**
     * A Luhn-valid card number for the given (or a random) issuer, grouped
     * in blocks of 4. Structurally valid, but not tied to any real account.
     * @param {string} [issuer]
     */
    creditCardNumber(issuer) {
      const resolved = CARD_ISSUERS[issuer] ? issuer : this.creditCardIssuer();
      const { prefixes, length } = CARD_ISSUERS[resolved];
      let digits = prng.pick(prefixes);
      while (digits.length < length - 1) {
        digits += prng.int(0, 9);
      }
      digits += luhnCheckDigit(digits);
      return digits.match(/.{1,4}/g).join(' ');
    },
    /** 3-digit card verification value. */
    creditCardCVV() {
      return prng.string(3, '0123456789');
    },
    transactionId() {
      return `TXN-${prng.string(12, 'abcdef0123456789')}`;
    },
    transactionType() {
      return prng.pick(TRANSACTION_TYPES);
    },
    transactionDescription() {
      const type = this.transactionType();
      const party = prng.pick(companies);
      const amt = this.amount();
      const templates = {
        deposit: `Deposit from ${party} - $${amt}`,
        withdrawal: `Withdrawal at ${party} - $${amt}`,
        payment: `Payment to ${party} - $${amt}`,
        invoice: `Invoice #${prng.int(1000, 9999)} to ${party} - $${amt}`,
        transfer: `Transfer to ${party} - $${amt}`,
      };
      return templates[type];
    },
    /** 4-digit PIN, preserving leading zeros. */
    pin() {
      return prng.string(4, '0123456789');
    },
    bitcoinAddress() {
      const start = prng.pick(['1', '3', 'bc1']);
      const length = start === 'bc1' ? 39 : prng.int(26, 35);
      return `${start}${prng.string(length, '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz')}`;
    },
    litecoinAddress() {
      const start = prng.pick(['L', 'M', '3']);
      const length = prng.int(26, 33);
      return `${start}${prng.string(length, '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz')}`;
    },
    ethereumAddress() {
      return `0x${prng.string(40, '0123456789abcdef')}`;
    },
    iban() {
      const country = prng.pick(['DE', 'FR', 'GB', 'IT', 'ES', 'NL', 'CH']);
      const check = prng.string(2, '0123456789');
      const bban = prng.string(20, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      const ibanStr = `${country}${check}${bban}`;
      return ibanStr.replace(/(.{4})/g, '$1 ').trim();
    }
  };
}
