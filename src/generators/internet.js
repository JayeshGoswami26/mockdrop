import firstNames from '../data/firstNames.js';
import lastNames from '../data/lastNames.js';
import { domainSuffixes, domainWords } from '../data/domains.js';

export function createInternetGenerator(prng) {
  const defaultDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'protonmail.com', 'mail.com'];

  return {
    email(options = {}) {
      const fName = (options.firstName || prng.pick(firstNames)).toLowerCase();
      const lName = (options.lastName || prng.pick(lastNames)).toLowerCase();
      const domain = options.domain || prng.pick(defaultDomains);
      
      const formats = [
        `${fName}.${lName}`,
        `${fName}${lName}`,
        `${fName}_${lName}`,
        `${fName}.${lName}${prng.int(1, 99)}`
      ];
      
      const username = prng.pick(formats).replace(/[^a-z0-9._]/g, '');
      return `${username}@${domain}`;
    },
    username() {
      const fName = prng.pick(firstNames).toLowerCase();
      const lName = prng.pick(lastNames).toLowerCase();
      const suffix = prng.bool(0.7) ? prng.int(1, 999) : '';
      const separator = prng.pick(['', '_', '.']);
      return `${fName}${separator}${lName}${suffix}`.replace(/[^a-z0-9._]/g, '');
    },
    password(length = 12, options = { uppercase: true, lowercase: true, numbers: true, symbols: true }) {
      let charset = '';
      if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
      if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (options.numbers) charset += '0123456789';
      if (options.symbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';
      
      if (!charset) charset = 'abcdefghijklmnopqrstuvwxyz'; // fallback
      return prng.string(length, charset);
    },
    url() {
      const protocol = prng.bool(0.8) ? 'https' : 'http';
      const domain = this.domainName();
      return `${protocol}://${domain}`;
    },
    ip() {
      return `${prng.int(1, 255)}.${prng.int(0, 255)}.${prng.int(0, 255)}.${prng.int(0, 255)}`;
    },
    ipv6() {
      const parts = [];
      for (let i = 0; i < 8; i++) {
        parts.push(prng.int(0, 65535).toString(16));
      }
      return parts.join(':');
    },
    userAgent() {
      const browsers = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1'
      ];
      return prng.pick(browsers);
    },
    color() {
      const hex = prng.int(0, 16777215).toString(16).padStart(6, '0');
      return `#${hex}`;
    },
    hexColor() {
      return this.color();
    },
    rgb() {
      return `rgb(${prng.int(0, 255)}, ${prng.int(0, 255)}, ${prng.int(0, 255)})`;
    },
    mac() {
      const parts = [];
      for (let i = 0; i < 6; i++) {
        parts.push(prng.int(0, 255).toString(16).padStart(2, '0').toUpperCase());
      }
      return parts.join(':');
    },
    domainName() {
      const word = prng.pick(domainWords);
      const suffix = prng.pick(domainSuffixes);
      return `${word}${suffix}`;
    },
    httpMethod() {
      return prng.pick(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']);
    },
    statusCode() {
      return prng.pick([200, 201, 204, 301, 302, 400, 401, 403, 404, 500, 502, 503]);
    },
    protocol() {
      return prng.pick(['http', 'https', 'ftp']);
    }
  };
}
