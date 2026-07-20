export function createFinanceGenerator(prng) {
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
    { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
    { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
    { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
    { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
    { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
    { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' }
  ];

  return {
    amount(min = 0, max = 10000, decimals = 2) {
      const raw = this.amountRaw(min, max, decimals);
      return raw.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    },
    amountRaw(min = 0, max = 10000, decimals = 2) {
      return prng.float(min, max, decimals);
    },
    currency() {
      return prng.pick(currencies);
    },
    currencyCode() {
      return this.currency().code;
    },
    currencySymbol() {
      return this.currency().symbol;
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
    accountNumber(length = 10) {
      return prng.string(length, '0123456789');
    },
    routingNumber() {
      return prng.string(9, '0123456789');
    },
    transactionId() {
      return `TXN-${prng.string(12, 'abcdef0123456789')}`;
    },
    bitcoinAddress() {
      const start = prng.pick(['1', '3', 'bc1']);
      const length = start === 'bc1' ? 39 : prng.int(26, 35);
      return `${start}${prng.string(length, '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz')}`;
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
