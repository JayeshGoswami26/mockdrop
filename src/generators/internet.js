import firstNames from '../data/firstNames.js';
import lastNames from '../data/lastNames.js';
import { domainSuffixes, domainWords, emailDomains } from '../data/domains.js';
import { emojiCategories, default as allEmojis } from '../data/emojis.js';
import { Clock } from '../core/clock.js';

const EXAMPLE_DOMAINS = ['example.com', 'example.org', 'example.net']; // RFC 2606 reserved

const JWT_ALGORITHMS = [
  'HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512', 'PS256', 'PS384', 'PS512',
];

const HTTP_STATUS_BUCKETS = {
  info: [100, 101, 102, 103],
  success: [200, 201, 202, 203, 204, 205, 206],
  redirection: [300, 301, 302, 303, 304, 307, 308],
  clientError: [400, 401, 402, 403, 404, 405, 406, 408, 409, 410, 418, 422, 429],
  serverError: [500, 501, 502, 503, 504, 505, 507, 511],
};

/**
 * Base64url-encodes a UTF-8 string, working in both the browser (btoa) and
 * Node.js (Buffer) without adding a runtime dependency.
 * @param {string} str
 * @returns {string}
 */
function toBase64Url(str) {
  let base64;
  if (typeof btoa === 'function') {
    base64 = btoa(unescape(encodeURIComponent(str)));
  } else {
    base64 = Buffer.from(str, 'utf-8').toString('base64');
  }
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * @param {import('../core/prng.js').PRNG} prng
 * @param {Clock} [clock] - Source of "now" for `jwt()`'s `iat`/`exp` claims.
 */
export function createInternetGenerator(prng, clock = new Clock()) {
  const defaultDomains = emailDomains;

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
    /** An email guaranteed to use an RFC-2606 reserved domain (example.com/.org/.net) — safe for docs and tests. */
    exampleEmail(options = {}) {
      const domain = options.domain || prng.pick(EXAMPLE_DOMAINS);
      return this.email({ ...options, domain });
    },
    /**
     * A username. Pass `firstName`/`lastName` to derive it from a specific
     * person so it lines up with their name and email.
     * @param {{ firstName?: string, lastName?: string }} [options]
     */
    username(options = {}) {
      const fName = (options.firstName || prng.pick(firstNames)).toLowerCase();
      const lName = (options.lastName || prng.pick(lastNames)).toLowerCase();
      const suffix = prng.bool(0.7) ? prng.int(1, 999) : '';
      const separator = prng.pick(['', '_', '.']);
      return `${fName}${separator}${lName}${suffix}`.replace(/[^a-z0-9._]/g, '');
    },
    /** A human-readable public display name, e.g. "Jayesh.Goswami" or "Jayesh Goswami". */
    displayName() {
      const fName = prng.pick(firstNames);
      const lName = prng.pick(lastNames);
      const style = prng.pick(['plain', 'dotted', 'underscored', 'withNumber']);
      switch (style) {
        case 'dotted': return `${fName}.${lName}`;
        case 'underscored': return `${fName}_${lName}`;
        case 'withNumber': return `${fName}${lName}${prng.int(1, 99)}`;
        default: return `${fName} ${lName}`;
      }
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
    /** Alias for {@link ip} — explicit IPv4. */
    ipv4() {
      return this.ip();
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
    /** A domain suffix without the leading dot, e.g. "com". */
    domainSuffix() {
      return prng.pick(domainSuffixes).replace('.', '');
    },
    domainWord() {
      return prng.pick(domainWords);
    },
    /**
     * @param {{ types?: (keyof typeof emojiCategories)[] }} [options] Restrict to one or more categories: smileys, animals, food, travel, activities, objects.
     */
    emoji(options = {}) {
      const { types } = options;
      const pool = types && types.length
        ? types.flatMap((t) => emojiCategories[t] || [])
        : allEmojis;
      return prng.pick(pool.length ? pool : allEmojis);
    },
    httpMethod() {
      return prng.pick(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']);
    },
    statusCode() {
      return prng.pick([200, 201, 204, 301, 302, 400, 401, 403, 404, 500, 502, 503]);
    },
    /**
     * @param {{ types?: ('info'|'success'|'redirection'|'clientError'|'serverError')[] }} [options]
     */
    httpStatusCode(options = {}) {
      const { types } = options;
      const pool = types && types.length
        ? types.flatMap((t) => HTTP_STATUS_BUCKETS[t] || [])
        : Object.values(HTTP_STATUS_BUCKETS).flat();
      return prng.pick(pool.length ? pool : Object.values(HTTP_STATUS_BUCKETS).flat());
    },
    protocol() {
      return prng.pick(['http', 'https', 'ftp']);
    },
    /** A random port number in the full valid range [0, 65535]. */
    port() {
      return prng.int(0, 65535);
    },
    jwtAlgorithm() {
      return prng.pick(JWT_ALGORITHMS);
    },
    /**
     * A structurally valid JWT (header.payload.signature). The signature is
     * random — not cryptographically signed — so this is for shaping mock
     * data, not for auth testing.
     * @param {{ algorithm?: string, payload?: object }} [options]
     */
    jwt(options = {}) {
      const algorithm = options.algorithm || this.jwtAlgorithm();
      const header = { alg: algorithm, typ: 'JWT' };
      const now = Math.floor(clock.now() / 1000);
      const payload = options.payload || {
        sub: prng.string(24, 'abcdef0123456789'),
        iat: now,
        exp: now + prng.int(3600, 86400),
      };
      const signature = prng.string(43, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_');
      return `${toBase64Url(JSON.stringify(header))}.${toBase64Url(JSON.stringify(payload))}.${signature}`;
    },
  };
}
