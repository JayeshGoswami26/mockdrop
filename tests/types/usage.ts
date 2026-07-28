/**
 * Compile-time check of the published TypeScript definitions.
 *
 * This file is never executed — `npm run typecheck` compiles it with
 * `--strict --noEmit`, so a typo or drift in `src/types/index.d.ts` fails the
 * build instead of reaching consumers. Vitest ignores it (no `.test.` suffix).
 */
import mockdrop, {
  Mockdrop,
  type Airport,
  type Currency,
  type CreditCardIssuer,
  type TransactionType,
  type CoherentPerson,
  type UserRecord,
  type OrderRecord,
  type Paginated,
} from '../../src/types/index.js';

/** Fails to compile unless `Actual` and `Expected` are the same type. */
type Expect<Actual, Expected> =
  (<G>() => G extends Actual ? 1 : 2) extends (<G>() => G extends Expected ? 1 : 2)
    ? true
    : { error: 'Types differ'; actual: Actual; expected: Expected };

interface Lead {
  leadName: string;
  leadAmount: string;
  leadCreatedAt: Date;
  leadCreatedBy: string;
  leadEmail: string;
}

// The schema API, including the generator-reference and arrow-function forms.
const leads: Lead[] = mockdrop.create<Lead>({
  leadName: mockdrop.projectName,
  leadAmount: () => mockdrop.amount(1000, 50000),
  leadCreatedAt: mockdrop.pastDate,
  leadCreatedBy: mockdrop.user.name,
  leadEmail: () => mockdrop.email({ domain: 'mailinator.com' }),
}, 20);

const indexed = mockdrop.create({ id: (i: number) => i + 1 }, 5);

// ─── Schema inference ─────────────────────────────────────────────────
// No type argument and no annotation: the row type comes from the schema.
const inferred = mockdrop.create({
  name: mockdrop.fullName,
  amount: mockdrop.amountRaw,
  createdAt: mockdrop.pastDate,
  active: mockdrop.helpers.bool,
  role: 'admin',
  nested: { city: mockdrop.city },
}, 20);

type InferredRow = (typeof inferred)[number];
const _inferenceCheck: Expect<InferredRow, {
  name: string;
  amount: number;
  createdAt: Date;
  active: boolean;
  role: string;
  nested: { city: string };
}> = true;

// Field access is typed, so a typo or a wrong operation is a compile error.
const inferredName: string = inferred[0].name;
const inferredTotal: number = inferred[0].amount + 1;
const inferredCity: string = inferred[0].nested.city;

// A static Date stays a Date rather than being walked as a nested schema.
const withDate = mockdrop.create({ at: new Date(), tags: ['a', 'b'] }, 1);
const _dateCheck: Expect<(typeof withDate)[number], { at: Date; tags: string[] }> = true;

// ─── Relations ────────────────────────────────────────────────────────
const reps = mockdrop.create({ id: mockdrop.uuid, name: mockdrop.user.name }, 5);

const related = mockdrop.create({
  ownerId: mockdrop.ref(reps, 'id'),      // keyed → the field's type
  owner: mockdrop.ref(reps),              // unkeyed → the whole record
  reviewer: mockdrop.refUnique(reps, 'name'),
  approver: mockdrop.refEach(reps, 'name'),
}, 5);

const _relationCheck: Expect<(typeof related)[number], {
  ownerId: string;
  owner: { id: string; name: string };
  reviewer: string;
  approver: string;
}> = true;

// ─── Entities ─────────────────────────────────────────────────────────
const users: UserRecord[] = mockdrop.entity.user(10);
const orders: OrderRecord[] = mockdrop.entity.order(3);
const coherentPerson: CoherentPerson = mockdrop.person.coherent({ domain: 'mailinator.com' });
const initials: string = coherentPerson.initials;

// Overrides replace the preset's field type.
const overridden = mockdrop.entity.user(5, { age: () => '30-40', ownerId: mockdrop.ref(reps, 'id') });
const _overrideAge: string = overridden[0].age;
const _overrideOwner: string = overridden[0].ownerId;
const _overrideKept: string = overridden[0].email;

// ─── Pagination ───────────────────────────────────────────────────────
const page = mockdrop.paginate({ id: mockdrop.uuid, title: mockdrop.projectName }, {
  page: 2,
  perPage: 20,
  total: 137,
});
const _pageCheck: Expect<typeof page, Paginated<{ id: string; title: string }>> = true;
const pageRows: number = page.data.length;
const hasNext: boolean = page.meta.hasNextPage;

// Namespaced access, with the shapes the docs promise.
const airport: Airport = mockdrop.airline.airport();
const currency: Currency = mockdrop.finance.currency();
const issuer: CreditCardIssuer = mockdrop.finance.creditCardIssuer();
const txnType: TransactionType = mockdrop.finance.transactionType();
const card: string = mockdrop.finance.creditCardNumber(issuer);
const coords: [number, number] = mockdrop.location.nearbyGPSCoordinate({
  origin: [40.7128, -74.006],
  radius: 5,
  isMetric: true,
});
const imei: string = mockdrop.phone.imei();
const phoneNumber: string = mockdrop.phone.number('IN');
const personPhone: string = mockdrop.person.phone('US');
const airlineName: string = mockdrop.airline.airline();
const hexColor: string = mockdrop.internet.color();
const colorName: string = mockdrop.color.human();
const rgbValue: string | number[] = mockdrop.color.rgb({ format: 'array' });
const status: number = mockdrop.internet.httpStatusCode({ types: ['serverError'] });
const emoji: string = mockdrop.internet.emoji({ types: ['animals', 'food'] });
const jwt: string = mockdrop.internet.jwt({ algorithm: 'HS256' });
const birthdate: Date = mockdrop.date.birthdate({ min: 25, max: 40, mode: 'age' });
const spread: Date[] = mockdrop.date.betweens(new Date(), new Date(), 5);
const abbrevMonth: string = mockdrop.date.month({ abbreviated: true });
const timeZone: string = mockdrop.location.timeZone();
const zip: string = mockdrop.location.zipCode('#####-####');
const dog: string = mockdrop.animal.dog();

// Top-level shortcuts.
const fullName: string = mockdrop.fullName();
const country: string = mockdrop.country();
const seat: string = mockdrop.seat();
const eth: string = mockdrop.ethereumAddress();
const pin: string = mockdrop.pin();

// Generic helpers keep their element types.
const picked: number | undefined = mockdrop.helpers.pick([1, 2, 3]);
const shuffled: string[] = mockdrop.helpers.shuffle(['a', 'b']);

// Seeded instances.
const seeded = new Mockdrop(42);
seeded.setSeed(7);
const seededName: string = seeded.person.fullName();

export {
  leads, indexed, airport, currency, issuer, txnType, card, coords, imei, phoneNumber,
  personPhone, airlineName, hexColor, colorName, rgbValue, status, emoji, jwt, birthdate,
  spread, abbrevMonth, timeZone, zip, dog, fullName, country, seat, eth, pin, picked,
  shuffled, seededName,
  // Inference, relations, entities, pagination.
  inferred, inferredName, inferredTotal, inferredCity, withDate, reps, related,
  users, orders, coherentPerson, initials, overridden, page, pageRows, hasNext,
  _inferenceCheck, _dateCheck, _relationCheck, _overrideAge, _overrideOwner,
  _overrideKept, _pageCheck,
};
