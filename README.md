# Mockdrop

> Generate high-quality dummy data instantly. Zero dependencies. Works everywhere.

A zero-dependency, isomorphic dummy data generator with a schema-based API, deep customization, and a pluggable architecture built for scale.

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
  leadName: () => mockdrop.projectName(),
  leadDescription: () => mockdrop.projectDescription(),
  leadAmount: () => mockdrop.amount(1000, 50000),
  leadCreatedAt: () => mockdrop.past(),
  leadCreatedBy: () => mockdrop.fullName(),
  leadSource: () => mockdrop.platformName(),
  leadEmail: () => mockdrop.email({ domain: 'mailinator.com' })
}, 20);

console.log(leads);
```

### Schema value rules

Each value in a `create()` schema can be:

| Value | Behavior |
| --- | --- |
| A generator reference — `mockdrop.projectName` (no parentheses) | Called once **per item**, so every row gets a fresh value |
| An arrow function — `() => mockdrop.email({ domain: 'mailinator.com' })` | Same, but lets you pass options |
| A function using the index — `(i) => i + 1` | Receives the item index (auto-increment ids) |
| A nested object | Resolved recursively as a sub-schema |
| Anything else — `'admin'`, `42`, `true` | Copied as-is into every item |

> ⚠️ Don't *call* the generator inside the schema (`leadName: mockdrop.projectName()`) — that runs once and repeats the same value in all rows. Pass the reference or wrap it in an arrow function.

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

Mockdrop provides an extensive set of generators organized by namespace. You can access them via their namespace (`mockdrop.person.fullName()`) or via top-level aliases (`mockdrop.fullName()`).

### Person (`mockdrop.person`)
- `firstName()`
- `lastName()`
- `fullName()`
- `age(min, max)`
- `gender()`
- `avatar()`
- `bio()`
- `phone(format)`
- `jobTitle()`
- `prefix()`

> `mockdrop.user` is an alias for `mockdrop.person`, with `user.name()` mapping to `fullName()` — so schemas can read naturally: `createdBy: mockdrop.user.name`.

### Internet (`mockdrop.internet`)
- `email(options)`
- `username()`
- `password(length, options)`
- `url()`
- `ip()`
- `ipv6()`
- `userAgent()`
- `color()`
- `mac()`
- `domainName()`

### Company (`mockdrop.company`)
- `name()`
- `catchPhrase()`
- `industry()`
- `platformName()`
- `projectName()`
- `projectDescription()`
- `department()`
- `buzzword()`

### Date (`mockdrop.date`)
- `past(years)` / `pastDate(years)`
- `future(years)` / `futureDate(years)`
- `recent(days)`
- `between(from, to)`
- `month()`
- `weekday()`
- `timestamp()`
- `iso()`

### Finance (`mockdrop.finance`)
- `amount(min, max, decimals)`
- `currency()`
- `creditCard()`
- `accountNumber(length)`
- `routingNumber()`
- `transactionId()`
- `bitcoinAddress()`
- `iban()`

### Lorem (`mockdrop.lorem`)
- `word()`
- `words(count)`
- `sentence(wordCount)`
- `sentences(count)`
- `paragraph(sentenceCount)`
- `paragraphs(count)`
- `slug(wordCount)`

### System (`mockdrop.system`)
- `uuid()`
- `objectId()`
- `fileName(ext)`
- `mimeType()`
- `semver()`
- `filePath()`
- `directoryPath()`

### Helpers (`mockdrop.helpers`)
- `pick(array)`
- `pickMultiple(array, count)`
- `shuffle(array)`
- `unique(fn, count)`
- `maybe(fn, probability)`
- `int(min, max)`
- `float(min, max)`
- `bool(probability)`

---

## Architecture

- **Isomorphic**: Works in Node.js and the Browser
- **Zero dependencies**: Ships nothing but its own code
- **TypeScript**: Written with JSDoc and full `.d.ts` types for rich IntelliSense
- **Pluggable**: Easy to extend with custom namespaces and data

---

## License

MIT © Jayesh Puri Goswami