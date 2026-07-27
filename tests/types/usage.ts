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
} from '../../src/types/index.js';

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
};
