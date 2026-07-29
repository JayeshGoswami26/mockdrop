export class PRNG {
  setSeed(seed?: number): void;
  next(): number;
  int(min: number, max: number): number;
  float(min: number, max: number, decimals?: number): number;
  pick<T>(array: T[]): T;
  pickMultiple<T>(array: T[], count: number): T[];
  pickUnique<T>(array: T[], count: number): T[];
  shuffle<T>(array: T[]): T[];
  bool(probability?: number): boolean;
  char(charset?: string): string;
  string(length: number, charset?: string): string;
  weighted<T>(options: { value: T, weight: number }[]): T;
}

export interface PersonGenerator {
  firstName(): string;
  lastName(): string;
  fullName(): string;
  age(min?: number, max?: number): number;
  gender(): string;
  avatar(): string;
  bio(): string;
  /** Also reachable at `mockdrop.phone.number()` — the top-level `phone` namespace takes precedence over this shortcut. */
  phone(format?: 'US' | 'UK' | 'IN' | 'INTERNATIONAL' | string): string;
  jobTitle(): string;
  prefix(): string;
  /**
   * A person whose fields agree with one another — the email and username are
   * derived from the same name instead of being drawn independently.
   */
  coherent(options?: { firstName?: string; lastName?: string; domain?: string }): CoherentPerson;
}

/** An identity whose name, email, and username all belong to the same person. */
export interface CoherentPerson {
  firstName: string;
  lastName: string;
  fullName: string;
  /** Uppercase first letters, e.g. "JG" — handy for avatar placeholders. */
  initials: string;
  email: string;
  username: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  numericCode: string;
}

export type CreditCardIssuer =
  | 'visa' | 'mastercard' | 'american_express' | 'discover'
  | 'diners_club' | 'jcb' | 'maestro' | 'unionpay';

export type TransactionType = 'deposit' | 'withdrawal' | 'payment' | 'invoice' | 'transfer';

export interface FinanceGenerator {
  amount(min?: number, max?: number, decimals?: number): string;
  amountRaw(min?: number, max?: number, decimals?: number): number;
  currency(): Currency;
  currencyCode(): string;
  currencyName(): string;
  currencyNumericCode(): string;
  currencySymbol(): string;
  accountName(): string;
  accountNumber(length?: number): string;
  routingNumber(): string;
  /** SWIFT/BIC bank identifier code. */
  bic(): string;
  creditCard(): string;
  creditCardFull(): string;
  creditCardIssuer(): CreditCardIssuer;
  /** Luhn-valid card number for the given (or a random) issuer. */
  creditCardNumber(issuer?: CreditCardIssuer): string;
  creditCardCVV(): string;
  transactionId(): string;
  transactionType(): TransactionType;
  transactionDescription(): string;
  pin(): string;
  bitcoinAddress(): string;
  litecoinAddress(): string;
  ethereumAddress(): string;
  iban(): string;
}

export interface EmojiOptions {
  types?: ('smileys' | 'animals' | 'food' | 'travel' | 'activities' | 'objects')[];
}

export interface HttpStatusCodeOptions {
  types?: ('info' | 'success' | 'redirection' | 'clientError' | 'serverError')[];
}

export interface JwtOptions {
  algorithm?: string;
  payload?: object;
}

export interface InternetGenerator {
  email(options?: { domain?: string, firstName?: string, lastName?: string }): string;
  /** Email on an RFC-2606 reserved domain (example.com/.org/.net). */
  exampleEmail(options?: { domain?: string, firstName?: string, lastName?: string }): string;
  /** Pass a name to derive the username from that person rather than a random one. */
  username(options?: { firstName?: string, lastName?: string }): string;
  displayName(): string;
  password(length?: number, options?: { uppercase?: boolean, lowercase?: boolean, numbers?: boolean, symbols?: boolean }): string;
  url(): string;
  ip(): string;
  ipv4(): string;
  ipv6(): string;
  userAgent(): string;
  /** Also reachable at `mockdrop.color.*` — the top-level `color` namespace takes precedence over this shortcut. */
  color(): string;
  hexColor(): string;
  /** Also reachable at `mockdrop.color.rgb()`, which offers more formatting options. */
  rgb(): string;
  mac(): string;
  domainName(): string;
  domainSuffix(): string;
  domainWord(): string;
  emoji(options?: EmojiOptions): string;
  httpMethod(): string;
  statusCode(): number;
  httpStatusCode(options?: HttpStatusCodeOptions): number;
  protocol(): string;
  port(): number;
  jwtAlgorithm(): string;
  jwt(options?: JwtOptions): string;
}

export interface CompanyGenerator {
  name(): string;
  catchPhrase(): string;
  industry(): string;
  platformName(): string;
  projectName(): string;
  projectDescription(): string;
  department(): string;
  buzzword(): string;
}

export interface BirthdateOptions {
  min?: number;
  max?: number;
  mode?: 'age' | 'year';
  refDate?: Date | string | number;
}

export interface DateGenerator {
  past(years?: number): Date;
  future(years?: number): Date;
  pastDate(years?: number): Date;
  futureDate(years?: number): Date;
  /** A date anywhere from one year ago to one year from now. */
  anytime(): Date;
  between(from: Date, to: Date): Date;
  betweens(from: Date, to: Date, count?: number): Date[];
  birthdate(options?: BirthdateOptions): Date;
  recent(days?: number): Date;
  soon(days?: number): Date;
  month(options?: { abbreviated?: boolean }): string;
  weekday(options?: { abbreviated?: boolean }): string;
  /** Also reachable at `mockdrop.location.timeZone()`. */
  timeZone(): string;
  timestamp(): number;
  iso(): string;
  time(): string;
  year(min?: number, max?: number): number;
}

export interface LoremGenerator {
  word(): string;
  words(count?: number): string;
  sentence(wordCount?: number): string;
  sentences(count?: number): string;
  paragraph(sentenceCount?: number): string;
  paragraphs(count?: number): string;
  slug(wordCount?: number): string;
  lines(count?: number): string;
  text(length: number): string;
}

export interface SystemGenerator {
  uuid(): string;
  objectId(): string;
  fileName(ext?: string): string;
  fileExt(): string;
  mimeType(): string;
  semver(): string;
  filePath(): string;
  directoryPath(): string;
  commonFileType(): string;
}

export interface HelpersGenerator {
  pick<T>(array: T[]): T | undefined;
  pickMultiple<T>(array: T[], count: number): T[];
  pickUnique<T>(array: T[], count: number): T[];
  shuffle<T>(array: T[]): T[];
  unique<T>(fn: () => T, count: number, maxRetries?: number): T[];
  maybe<T>(fn: () => T, probability?: number): T | null;
  replicate<T>(fn: () => T, count: number): T[];
  int(min: number, max: number): number;
  float(min: number, max: number, decimals?: number): number;
  bool(probability?: number): boolean;
  letter(): string;
  alphaNumeric(length?: number): string;
  arrayElement<T>(array: T[]): T | undefined;
  objectValue<T>(obj: Record<string, T>): T | undefined;
  objectKey(obj: Record<string, any>): string | undefined;
  enumValue<T>(enumObj: Record<string, T>): T | undefined;
}

export interface NearbyGPSCoordinateOptions {
  origin?: [number, number];
  radius?: number;
  isMetric?: boolean;
}

export interface LocationGenerator {
  buildingNumber(): string;
  cardinalDirection(): string;
  ordinalDirection(): string;
  direction(): string;
  city(): string;
  continent(): string;
  country(): string;
  countryCode(): string;
  county(): string;
  language(): string;
  state(): string;
  street(): string;
  latitude(min?: number, max?: number, precision?: number): number;
  longitude(min?: number, max?: number, precision?: number): number;
  nearbyGPSCoordinate(options?: NearbyGPSCoordinateOptions): [number, number];
  secondaryAddress(): string;
  streetAddress(useFullAddress?: boolean): string;
  postalAddress(): string;
  zipCode(format?: string): string;
  /** Also reachable at `mockdrop.date.timeZone()`. */
  timeZone(): string;
}

export interface Airport {
  name: string;
  iataCode: string;
  city: string;
}

export interface FlightNumberOptions {
  addLeadingZeros?: boolean;
  length?: number;
}

export interface RecordLocatorOptions {
  allowNumerics?: boolean;
}

export interface AirlineGenerator {
  aircraftType(): string;
  /** Airline name, e.g. "Delta Air Lines". Also the namespace's own name — reachable only here, not top-level-aliased. */
  airline(): string;
  airplane(): string;
  airport(): Airport;
  flightNumber(options?: FlightNumberOptions): string;
  recordLocator(options?: RecordLocatorOptions): string;
  seat(): string;
}

export interface AnimalGenerator {
  bear(): string;
  bird(): string;
  cat(): string;
  cetacean(): string;
  cow(): string;
  crocodilia(): string;
  dog(): string;
  fish(): string;
  horse(): string;
  insect(): string;
  lion(): string;
  petName(): string;
  rabbit(): string;
  rodent(): string;
  snake(): string;
  /** General biological category, e.g. "Mammal", "Reptile". */
  type(): string;
}

export interface RgbOptions {
  includeAlpha?: boolean;
  format?: 'css' | 'array';
}

export interface HslOptions {
  includeAlpha?: boolean;
}

export interface ColorByCssColorSpaceOptions {
  space?: string;
}

export interface ColorGenerator {
  /** Also reachable at `mockdrop.internet.rgb()`, a simpler fixed-format version. */
  rgb(options?: RgbOptions): string | number[];
  cmyk(): string;
  hsl(options?: HslOptions): string;
  hwb(): string;
  lab(): string;
  lch(): string;
  /** A human-friendly color name, e.g. "Cerulean". */
  human(): string;
  /** A CSS color space keyword usable inside `color()`. */
  space(): string;
  cssSupportedFunction(): string;
  cssSupportedSpace(): string;
  colorByCSSColorSpace(options?: ColorByCssColorSpaceOptions): string;
}

export interface PhoneGenerator {
  number(format?: 'US' | 'UK' | 'IN' | 'INTERNATIONAL' | string): string;
  /** A 15-digit, Luhn-valid IMEI. */
  imei(): string;
}

// ─── Schema inference ─────────────────────────────────────────────────

/**
 * The record shape a schema produces.
 *
 * Each schema value is resolved the way `create()` resolves it at runtime:
 * functions become their return type, nested plain objects recurse, and
 * anything else (including `Date` and arrays) is copied through as-is.
 *
 * @example
 * type Row = Generated<{ name: () => string; age: () => number }>;
 * // → { name: string; age: number }
 */
export type Generated<S> = {
  [K in keyof S]: S[K] extends (...args: any[]) => infer R
    ? R
    : S[K] extends Date | readonly any[]
      ? S[K]
      : S[K] extends object
        ? Generated<S[K]>
        : S[K];
};

/** An entity's own fields, with any overridden keys replaced by the override's type. */
export type WithOverrides<R, O> = Omit<R, keyof Generated<O>> & Generated<O>;

// ─── Pagination ───────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginateOptions {
  /** 1-based page number. Default 1. */
  page?: number;
  /** Records per page. Default 10. */
  perPage?: number;
  /** Total records across all pages. Default 100. */
  total?: number;
}

// ─── Entity presets ───────────────────────────────────────────────────

export interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  initials: string;
  email: string;
  username: string;
  jobTitle: string;
  phone: string;
  age: number;
  isActive: boolean;
  createdAt: Date;
}

export interface LeadRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  value: number;
  currency: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductRecord {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewCount: number;
  createdAt: Date;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  itemCount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  /** Always equals `subtotal + tax + shipping`. */
  total: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentMethod: string;
  shippingAddress: string;
  placedAt: Date;
}

export interface TransactionRecord {
  id: string;
  reference: string;
  type: TransactionType;
  description: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  method: string;
  account: string;
  date: Date;
}

export interface BlogPostRecord {
  id: string;
  title: string;
  /** Derived from `title`. */
  slug: string;
  excerpt: string;
  body: string;
  author: string;
  authorEmail: string;
  tags: string[];
  readingTime: number;
  published: boolean;
  publishedAt: Date;
}

export interface CommentRecord {
  id: string;
  author: string;
  email: string;
  body: string;
  likes: number;
  edited: boolean;
  postedAt: Date;
}

export interface TodoRecord {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  dueDate: Date;
  completedAt: Date | null;
  createdAt: Date;
}

export interface EventRecord {
  id: string;
  title: string;
  description: string;
  location: string;
  startsAt: Date;
  /** Always after `startsAt`. */
  endsAt: Date;
  durationHours: number;
  organizer: string;
  organizerEmail: string;
  attendeeCount: number;
  isVirtual: boolean;
}

/**
 * Ready-made record shapes. Each takes a count and an optional override
 * schema, which accepts anything `create()` accepts and replaces the
 * preset's own fields.
 */
export interface EntityGenerator {
  user<O extends Record<string, any> = {}>(count?: number, overrides?: O): WithOverrides<UserRecord, O>[];
  lead<O extends Record<string, any> = {}>(count?: number, overrides?: O): WithOverrides<LeadRecord, O>[];
  product<O extends Record<string, any> = {}>(count?: number, overrides?: O): WithOverrides<ProductRecord, O>[];
  order<O extends Record<string, any> = {}>(count?: number, overrides?: O): WithOverrides<OrderRecord, O>[];
  transaction<O extends Record<string, any> = {}>(count?: number, overrides?: O): WithOverrides<TransactionRecord, O>[];
  blogPost<O extends Record<string, any> = {}>(count?: number, overrides?: O): WithOverrides<BlogPostRecord, O>[];
  comment<O extends Record<string, any> = {}>(count?: number, overrides?: O): WithOverrides<CommentRecord, O>[];
  todo<O extends Record<string, any> = {}>(count?: number, overrides?: O): WithOverrides<TodoRecord, O>[];
  event<O extends Record<string, any> = {}>(count?: number, overrides?: O): WithOverrides<EventRecord, O>[];
}

export class Mockdrop {
  constructor(seed?: number);

  prng: PRNG;
  setSeed(seed: number): void;

  /**
   * Generates an array of records from a schema.
   *
   * The record type is inferred from the schema, so no annotation is needed:
   *
   * ```ts
   * const leads = mockdrop.create({ name: mockdrop.fullName, amount: mockdrop.amountRaw }, 20);
   * // leads: { name: string; amount: number }[]
   * ```
   *
   * Passing an explicit type argument still works and wins over inference:
   * `mockdrop.create<Lead>({ … }, 20)` returns `Lead[]`.
   */
  create<T = void, S extends Record<string, any> = Record<string, any>>(
    schema: S,
    count?: number,
  ): T extends void ? Generated<S>[] : T[];

  // ─── Relations ──────────────────────────────────────────────────────

  /** References a random record from `source`; records may repeat (many-to-one). */
  ref<T>(source: readonly T[]): () => T;
  ref<T, K extends keyof T>(source: readonly T[], key: K): () => T[K];

  /** References each record at most once (one-to-one); throws once exhausted. */
  refUnique<T>(source: readonly T[]): () => T;
  refUnique<T, K extends keyof T>(source: readonly T[], key: K): () => T[K];

  /** Cycles through `source` in order so every record gets an even share. */
  refEach<T>(source: readonly T[]): () => T;
  refEach<T, K extends keyof T>(source: readonly T[], key: K): () => T[K];

  // ─── API shapes ─────────────────────────────────────────────────────

  /** Generates one page of a paginated API response. */
  paginate<T = void, S extends Record<string, any> = Record<string, any>>(
    schema: S,
    options?: PaginateOptions,
  ): Paginated<T extends void ? Generated<S> : T>;

  // ─── Namespaces ───────────────────────────────────────────────────
  person: PersonGenerator;
  /** Alias namespace for `person`; `name()` maps to `fullName()`. */
  user: PersonGenerator & { name(): string };
  internet: InternetGenerator;
  company: CompanyGenerator;
  date: DateGenerator;
  finance: FinanceGenerator;
  lorem: LoremGenerator;
  system: SystemGenerator;
  helpers: HelpersGenerator;
  location: LocationGenerator;
  airline: AirlineGenerator;
  animal: AnimalGenerator;
  color: ColorGenerator;
  phone: PhoneGenerator;
  /** Ready-made record shapes: `mockdrop.entity.user(10)`. */
  entity: EntityGenerator;

  // ─── Top-level aliases ──────────────────────────────────────────────
  // Every generator method is reachable directly on the instance, EXCEPT:
  //  - a method whose name matches a namespace name (`person.phone`,
  //    `internet.color`, `airline.airline`) — the namespace object wins
  //    that slot, so use the fully-qualified form for those three.
  //  - a method name claimed by an earlier-registered namespace
  //    (`color.rgb` loses to `internet.rgb`, `location.timeZone` loses to
  //    `date.timeZone`) — both remain reachable via their own namespace.

  // person
  firstName(): string;
  lastName(): string;
  fullName(): string;
  age(min?: number, max?: number): number;
  gender(): string;
  avatar(): string;
  bio(): string;
  jobTitle(): string;
  prefix(): string;

  // internet
  email(options?: { domain?: string, firstName?: string, lastName?: string }): string;
  exampleEmail(options?: { domain?: string, firstName?: string, lastName?: string }): string;
  /** Pass a name to derive the username from that person rather than a random one. */
  username(options?: { firstName?: string, lastName?: string }): string;
  displayName(): string;
  password(length?: number, options?: any): string;
  url(): string;
  ip(): string;
  ipv4(): string;
  ipv6(): string;
  userAgent(): string;
  hexColor(): string;
  rgb(): string;
  mac(): string;
  domainName(): string;
  domainSuffix(): string;
  domainWord(): string;
  emoji(options?: EmojiOptions): string;
  httpMethod(): string;
  statusCode(): number;
  httpStatusCode(options?: HttpStatusCodeOptions): number;
  protocol(): string;
  port(): number;
  jwtAlgorithm(): string;
  jwt(options?: JwtOptions): string;

  // company
  name(): string;
  catchPhrase(): string;
  industry(): string;
  platformName(): string;
  projectName(): string;
  projectDescription(): string;
  department(): string;
  buzzword(): string;

  // date
  past(years?: number): Date;
  future(years?: number): Date;
  pastDate(years?: number): Date;
  futureDate(years?: number): Date;
  anytime(): Date;
  between(from: Date, to: Date): Date;
  betweens(from: Date, to: Date, count?: number): Date[];
  birthdate(options?: BirthdateOptions): Date;
  recent(days?: number): Date;
  soon(days?: number): Date;
  month(options?: { abbreviated?: boolean }): string;
  weekday(options?: { abbreviated?: boolean }): string;
  timeZone(): string;
  timestamp(): number;
  iso(): string;
  time(): string;
  year(min?: number, max?: number): number;

  // finance
  amount(min?: number, max?: number, decimals?: number): string;
  amountRaw(min?: number, max?: number, decimals?: number): number;
  currency(): Currency;
  currencyCode(): string;
  currencyName(): string;
  currencyNumericCode(): string;
  currencySymbol(): string;
  accountName(): string;
  accountNumber(length?: number): string;
  routingNumber(): string;
  bic(): string;
  creditCard(): string;
  creditCardFull(): string;
  creditCardIssuer(): CreditCardIssuer;
  creditCardNumber(issuer?: CreditCardIssuer): string;
  creditCardCVV(): string;
  transactionId(): string;
  transactionType(): TransactionType;
  transactionDescription(): string;
  pin(): string;
  bitcoinAddress(): string;
  litecoinAddress(): string;
  ethereumAddress(): string;
  iban(): string;

  // lorem
  word(): string;
  words(count?: number): string;
  sentence(wordCount?: number): string;
  sentences(count?: number): string;
  paragraph(sentenceCount?: number): string;
  paragraphs(count?: number): string;
  slug(wordCount?: number): string;
  lines(count?: number): string;
  text(length: number): string;

  // system
  uuid(): string;
  objectId(): string;
  fileName(ext?: string): string;
  fileExt(): string;
  mimeType(): string;
  semver(): string;
  filePath(): string;
  directoryPath(): string;
  commonFileType(): string;

  // helpers
  pick<T>(array: T[]): T | undefined;
  pickMultiple<T>(array: T[], count: number): T[];
  pickUnique<T>(array: T[], count: number): T[];
  shuffle<T>(array: T[]): T[];
  unique<T>(fn: () => T, count: number, maxRetries?: number): T[];
  maybe<T>(fn: () => T, probability?: number): T | null;
  replicate<T>(fn: () => T, count: number): T[];
  int(min: number, max: number): number;
  float(min: number, max: number, decimals?: number): number;
  bool(probability?: number): boolean;
  letter(): string;
  alphaNumeric(length?: number): string;
  arrayElement<T>(array: T[]): T | undefined;
  objectValue<T>(obj: Record<string, T>): T | undefined;
  objectKey(obj: Record<string, any>): string | undefined;
  enumValue<T>(enumObj: Record<string, T>): T | undefined;

  // location (timeZone excluded — see date.timeZone above)
  buildingNumber(): string;
  cardinalDirection(): string;
  ordinalDirection(): string;
  direction(): string;
  city(): string;
  continent(): string;
  country(): string;
  countryCode(): string;
  county(): string;
  language(): string;
  state(): string;
  street(): string;
  latitude(min?: number, max?: number, precision?: number): number;
  longitude(min?: number, max?: number, precision?: number): number;
  nearbyGPSCoordinate(options?: NearbyGPSCoordinateOptions): [number, number];
  secondaryAddress(): string;
  streetAddress(useFullAddress?: boolean): string;
  postalAddress(): string;
  zipCode(format?: string): string;

  // airline (airline() excluded — reserved for the namespace, see above)
  aircraftType(): string;
  airplane(): string;
  airport(): Airport;
  flightNumber(options?: FlightNumberOptions): string;
  recordLocator(options?: RecordLocatorOptions): string;
  seat(): string;

  // animal
  bear(): string;
  bird(): string;
  cat(): string;
  cetacean(): string;
  cow(): string;
  crocodilia(): string;
  dog(): string;
  fish(): string;
  horse(): string;
  insect(): string;
  lion(): string;
  petName(): string;
  rabbit(): string;
  rodent(): string;
  snake(): string;
  type(): string;

  // color (rgb() excluded — see internet.rgb above)
  cmyk(): string;
  hsl(options?: HslOptions): string;
  hwb(): string;
  lab(): string;
  lch(): string;
  human(): string;
  space(): string;
  cssSupportedFunction(): string;
  cssSupportedSpace(): string;
  colorByCSSColorSpace(options?: ColorByCssColorSpaceOptions): string;

  // phone (number()/imei() only reachable via mockdrop.phone.*, since
  // `phone` itself is reserved for the namespace)
}

declare const mockdrop: Mockdrop;
export default mockdrop;
