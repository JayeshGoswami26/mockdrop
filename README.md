# Mockdrop

> Generate high-quality dummy data instantly. Zero dependencies. Works everywhere.

A zero-dependency, isomorphic dummy data generator with a schema-based API, deep customization, and a pluggable architecture built for scale. 13 namespaces covering people, locations, finance, dates, airlines, animals, colors, phones, and more.

---

## Installation

```bash
npm install mockdrop
```
or
```bash
yarn add mockdrop
```
or
```bash
pnpm add mockdrop
```

---

## Quick Start

```js
import mockdrop from "mockdrop";

// Generate an array of 20 lead objects
const leads = mockdrop.create({
  leadName: mockdrop.projectName,
  leadDescription: mockdrop.projectDescription,
  leadAmount: () => mockdrop.amount(1000, 50000),
  leadCreatedAt: mockdrop.pastDate,
  leadCreatedBy: mockdrop.user.name,
  leadSource: mockdrop.platformName,
  leadEmail: () => mockdrop.email({ domain: 'mailinator.com' })
}, 20);

console.log(leads);
```

### Schema value rules

Each value in a `create()` schema can be:

| Value | Behavior |
| --- | --- |
| A generator reference — `mockdrop.projectName` (no parentheses) | Called once **per item** with its own defaults, so every row gets a fresh value |
| Your own arrow function — `() => mockdrop.email({ domain: 'mailinator.com' })` | Same, but lets you pass options |
| Your own function using the index — `(i) => i + 1` | Receives the item index (auto-increment ids) |
| A nested object | Resolved recursively as a sub-schema |
| Anything else — `'admin'`, `42`, `true` | Copied as-is into every item |

> ⚠️ Don't *call* the generator inside the schema (`leadName: mockdrop.projectName()`) — that runs once and repeats the same value in all rows. Pass the reference or wrap it in an arrow function.

The item index is handed only to **your own** functions. Built-in generators always run with their own defaults, so `createdAt: mockdrop.pastDate` is never quietly invoked as `pastDate(0)`. If you want the index alongside a generator, wrap it yourself:

```js
mockdrop.create({
  id: (i) => i + 1,                              // 1, 2, 3, …
  createdAt: mockdrop.pastDate,                  // default 1-year window
  label: (i) => `${mockdrop.projectName()}-${i}` // both
}, 3);
```

---

## Customizing Email Domains

Want all emails to come from a specific domain for testing?

```js
const user = mockdrop.create({
  name: () => mockdrop.fullName(),
  email: () => mockdrop.email({ domain: 'mailinator.com' })
});

console.log(user[0].email); // e.g. "jayesh.goswami@mailinator.com"
```

---

## Reproducible Data (Seeding)

Mockdrop uses a seedable PRNG so you can generate the exact same data every time, useful for snapshot testing:

```js
mockdrop.setSeed(42);
console.log(mockdrop.fullName()); // Always returns the same name for seed 42
```

---

## API Reference

Mockdrop provides an extensive set of generators organized into 13 namespaces. You can reach them via their namespace (`mockdrop.person.fullName()`) or via top-level shortcuts (`mockdrop.fullName()`).

### Namespace vs. shortcut naming

Three method names are also namespace names. In those cases the **namespace wins** the top-level slot, and the method stays available in full form:

| You want | Use this | Not this |
| --- | --- | --- |
| A phone number | `mockdrop.phone.number()` or `mockdrop.person.phone()` | ~~`mockdrop.phone()`~~ — that's the namespace |
| A hex color | `mockdrop.internet.color()` | ~~`mockdrop.color()`~~ — that's the namespace |
| An airline name | `mockdrop.airline.airline()` | ~~`mockdrop.airline()`~~ — that's the namespace |

Two more names are claimed by whichever namespace registers first; both forms always work fully qualified:

- `mockdrop.rgb()` → `internet.rgb()`. For the richer version use `mockdrop.color.rgb({ includeAlpha: true })`.
- `mockdrop.timeZone()` → `date.timeZone()`. Identical data is at `mockdrop.location.timeZone()`.

### Person (`mockdrop.person`)
`firstName()` · `lastName()` · `fullName()` · `age(min, max)` · `gender()` · `avatar()` · `bio()` · `phone(format)` · `jobTitle()` · `prefix()`

> `mockdrop.user` is an alias for `mockdrop.person`, with `user.name()` mapping to `fullName()` — so schemas can read naturally: `createdBy: mockdrop.user.name`.

### Internet (`mockdrop.internet`)
`email(options)` · `exampleEmail(options)` · `username()` · `displayName()` · `password(length, options)` · `url()` · `ip()` · `ipv4()` · `ipv6()` · `userAgent()` · `color()` · `hexColor()` · `rgb()` · `mac()` · `domainName()` · `domainSuffix()` · `domainWord()` · `emoji(options)` · `httpMethod()` · `statusCode()` · `httpStatusCode(options)` · `protocol()` · `port()` · `jwt(options)` · `jwtAlgorithm()`

```js
mockdrop.internet.exampleEmail();                          // "arthursmith@example.org" (RFC 2606 safe)
mockdrop.internet.emoji({ types: ['animals'] });           // "🐻"
mockdrop.internet.httpStatusCode({ types: ['serverError'] }); // 503
mockdrop.internet.jwt();                                   // "eyJhbGciOiJSUzM4NCIsInR5cCI6IkpXVCJ9.…"
```

> `jwt()` is structurally valid (`header.payload.signature`, base64url-encoded) but the signature is random — it's for shaping mock data, not for auth testing.

### Location (`mockdrop.location`)
`buildingNumber()` · `cardinalDirection()` · `ordinalDirection()` · `direction()` · `city()` · `continent()` · `country()` · `countryCode()` · `county()` · `language()` · `state()` · `street()` · `streetAddress(useFullAddress)` · `secondaryAddress()` · `postalAddress()` · `zipCode(format)` · `latitude(min, max, precision)` · `longitude(min, max, precision)` · `nearbyGPSCoordinate(options)` · `timeZone()`

```js
mockdrop.location.postalAddress();          // "3402 Birch Court, Dublin, Alaska 16942"
mockdrop.location.zipCode('#####-####');    // "48201-9317"
mockdrop.location.nearbyGPSCoordinate({ origin: [40.7128, -74.006], radius: 5 }); // [40.7194, -73.9498]
```

> Each key resolves independently, so `country()` and `countryCode()` in the same schema won't match each other. Pick one, or derive both from a single `() => { … }` function.

### Company (`mockdrop.company`)
`name()` · `catchPhrase()` · `industry()` · `platformName()` · `projectName()` · `projectDescription()` · `department()` · `buzzword()`

### Date (`mockdrop.date`)
`past(years)` / `pastDate(years)` · `future(years)` / `futureDate(years)` · `recent(days)` · `soon(days)` · `anytime()` · `between(from, to)` · `betweens(from, to, count)` · `birthdate(options)` · `month(options)` · `weekday(options)` · `timeZone()` · `timestamp()` · `iso()` · `time()` · `year(min, max)`

```js
mockdrop.date.birthdate({ min: 25, max: 40 });              // age-based (default)
mockdrop.date.birthdate({ min: 1990, max: 2000, mode: 'year' });
mockdrop.date.betweens(new Date('2024-01-01'), new Date('2025-01-01'), 5); // 5 sorted dates
mockdrop.date.month({ abbreviated: true });                 // "Feb"
```

### Finance (`mockdrop.finance`)
`amount(min, max, decimals)` · `amountRaw(…)` · `currency()` · `currencyCode()` · `currencyName()` · `currencyNumericCode()` · `currencySymbol()` · `accountName()` · `accountNumber(length)` · `routingNumber()` · `bic()` · `creditCard()` · `creditCardFull()` · `creditCardNumber(issuer)` · `creditCardIssuer()` · `creditCardCVV()` · `pin()` · `transactionId()` · `transactionType()` · `transactionDescription()` · `bitcoinAddress()` · `litecoinAddress()` · `ethereumAddress()` · `iban()`

```js
mockdrop.finance.creditCardNumber('visa');  // "4532 8821 0049 7211" — passes Luhn validation
mockdrop.finance.bic();                     // "ZPLGSG5N"
mockdrop.finance.ethereumAddress();         // "0xd15f12f241295fc6f78ada43255060e7508826a7"
```

> `creditCardNumber()` produces Luhn-valid, correctly-prefixed numbers so they survive form validation. They're structurally valid only — never tied to a real account.

### Airline (`mockdrop.airline`)
`aircraftType()` · `airline()` · `airplane()` · `airport()` · `flightNumber(options)` · `recordLocator(options)` · `seat()`

```js
mockdrop.airline.flightNumber();                   // "BA353"
mockdrop.airline.airport();                        // { name: "…", iataCode: "IST", city: "Istanbul" }
mockdrop.airline.recordLocator();                  // "5YX1H9"
mockdrop.airline.seat();                           // "39C"
```

### Animal (`mockdrop.animal`)
`bear()` · `bird()` · `cat()` · `cetacean()` · `cow()` · `crocodilia()` · `dog()` · `fish()` · `horse()` · `insect()` · `lion()` · `petName()` · `rabbit()` · `rodent()` · `snake()` · `type()`

### Color (`mockdrop.color`)
`rgb(options)` · `cmyk()` · `hsl(options)` · `hwb()` · `lab()` · `lch()` · `human()` · `space()` · `cssSupportedFunction()` · `cssSupportedSpace()` · `colorByCSSColorSpace(options)`

```js
mockdrop.color.human();                          // "Cerulean"
mockdrop.color.rgb({ format: 'array' });         // [122, 30, 200]
mockdrop.color.rgb({ includeAlpha: true });      // "rgba(122, 30, 200, 0.42)"
mockdrop.color.colorByCSSColorSpace({ space: 'display-p3' });
```

### Phone (`mockdrop.phone`)
`number(format)` · `imei()`

```js
mockdrop.phone.number('IN');   // "+91 17931 04838"  (also 'US', 'UK', 'INTERNATIONAL')
mockdrop.phone.imei();         // "19-348283-094016-6" — Luhn-valid
```

### Lorem (`mockdrop.lorem`)
`word()` · `words(count)` · `sentence(wordCount)` · `sentences(count)` · `paragraph(sentenceCount)` · `paragraphs(count)` · `slug(wordCount)` · `lines(count)` · `text(length)`

### System (`mockdrop.system`)
`uuid()` · `objectId()` · `fileName(ext)` · `fileExt()` · `mimeType()` · `semver()` · `filePath()` · `directoryPath()` · `commonFileType()`

### Helpers (`mockdrop.helpers`)
`pick(array)` · `pickMultiple(array, count)` · `pickUnique(array, count)` · `shuffle(array)` · `unique(fn, count)` · `maybe(fn, probability)` · `replicate(fn, count)` · `int(min, max)` · `float(min, max, decimals)` · `bool(probability)` · `letter()` · `alphaNumeric(length)` · `arrayElement(array)` · `objectValue(obj)` · `objectKey(obj)` · `enumValue(enumObj)`

---

## Architecture

- **Isomorphic**: Works in Node.js and the Browser
- **Zero dependencies**: Ships nothing but its own code
- **TypeScript**: Written with JSDoc and full `.d.ts` types for rich IntelliSense
- **Pluggable**: Easy to extend with custom namespaces and data

Every generator draws from one seedable PRNG, so `setSeed()` makes an entire dataset — across every namespace — reproducible.

Adding a namespace follows one pattern: drop the word lists in [src/data/](src/data/), add a `createXGenerator(prng)` factory in [src/generators/](src/generators/), register it in [src/core/engine.js](src/core/engine.js), then extend [src/types/index.d.ts](src/types/index.d.ts).

---

## License

MIT © Jayesh Puri Goswami