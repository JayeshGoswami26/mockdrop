# MOCKDROP BY JAYESH PURI GOSWAMI

Generate high-quality dummy data instantly.

No API.
No signup.
No internet.
Just install and start building.

---

## Installation

```bash
npm install dummy-by-jayesh
```

or

```bash
yarn add dummy-by-jayesh
```

or

```bash
pnpm add dummy-by-jayesh
```

---

## Quick Start

```js
import { getData } from "dummy-by-jayesh";

const users = getData("users");

console.log(users);
```

---

## Available Keys

| Key | Description |
|------|-------------|
| users | User profiles |
| products | Product catalog |
| posts | Blog posts |
| companies | Company information |
| images | Image URLs |
| addresses | Addresses |
| countries | Countries |
| cities | Cities |
| jobs | Job titles |
| reviews | Product reviews |

Example:

```js
import { getData } from "dummy-by-jayesh";

const products = getData("products");
```

---

## Response Example

```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "age": 25
  }
]
```

---

## TypeScript

Fully typed.

```ts
import { getData } from "dummy-by-jayesh";

const users = getData("users");
```

---

## Why Dummy By Jayesh?

- Lightweight
- Zero dependencies
- TypeScript support
- Ready-to-use JSON
- Offline
- Fast
- Easy to use

---

## Coming Soon

- Faker-like generators
- Random data generation
- Custom dataset creation
- Filtering
- Pagination
- Categories
- CLI support

---

## Contributing

Contributions are welcome.

Fork the repository and submit a Pull Request.

---

## License

MIT

---

Made with ❤️ by Jayesh.