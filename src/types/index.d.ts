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

export class Mockdrop {
  constructor(seed?: number);
  
  prng: PRNG;
  setSeed(seed: number): void;

  create<T = any>(schema: Record<string, any>, count?: number): T[];

  // Namespaces
  person: {
    firstName(): string;
    lastName(): string;
    fullName(): string;
    age(min?: number, max?: number): number;
    gender(): string;
    avatar(): string;
    bio(): string;
    phone(format?: 'US' | 'UK' | 'IN' | 'international' | string): string;
    jobTitle(): string;
    prefix(): string;
  };

  internet: {
    email(options?: { domain?: string, firstName?: string, lastName?: string }): string;
    username(): string;
    password(length?: number, options?: { uppercase?: boolean, lowercase?: boolean, numbers?: boolean, symbols?: boolean }): string;
    url(): string;
    ip(): string;
    ipv6(): string;
    userAgent(): string;
    color(): string;
    hexColor(): string;
    rgb(): string;
    mac(): string;
    domainName(): string;
    httpMethod(): string;
    statusCode(): number;
    protocol(): string;
  };

  company: {
    name(): string;
    catchPhrase(): string;
    industry(): string;
    platformName(): string;
    projectName(): string;
    projectDescription(): string;
    department(): string;
    buzzword(): string;
  };

  date: {
    past(years?: number): Date;
    future(years?: number): Date;
    recent(days?: number): Date;
    soon(days?: number): Date;
    between(from: Date, to: Date): Date;
    month(): string;
    weekday(): string;
    timestamp(): number;
    iso(): string;
    time(): string;
    year(min?: number, max?: number): number;
  };

  finance: {
    amount(min?: number, max?: number, decimals?: number): string;
    amountRaw(min?: number, max?: number, decimals?: number): number;
    currency(): { code: string, symbol: string, name: string };
    currencyCode(): string;
    currencySymbol(): string;
    creditCard(): string;
    creditCardFull(): string;
    accountNumber(length?: number): string;
    routingNumber(): string;
    transactionId(): string;
    bitcoinAddress(): string;
    iban(): string;
  };

  lorem: {
    word(): string;
    words(count?: number): string;
    sentence(wordCount?: number): string;
    sentences(count?: number): string;
    paragraph(sentenceCount?: number): string;
    paragraphs(count?: number): string;
    slug(wordCount?: number): string;
    lines(count?: number): string;
    text(length: number): string;
  };

  system: {
    uuid(): string;
    objectId(): string;
    fileName(ext?: string): string;
    fileExt(): string;
    mimeType(): string;
    semver(): string;
    filePath(): string;
    directoryPath(): string;
    commonFileType(): string;
  };

  helpers: {
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
  };

  // Top-level aliases
  firstName(): string;
  lastName(): string;
  fullName(): string;
  age(min?: number, max?: number): number;
  gender(): string;
  avatar(): string;
  bio(): string;
  phone(format?: string): string;
  jobTitle(): string;
  prefix(): string;
  email(options?: { domain?: string, firstName?: string, lastName?: string }): string;
  username(): string;
  password(length?: number, options?: any): string;
  url(): string;
  ip(): string;
  ipv6(): string;
  userAgent(): string;
  color(): string;
  hexColor(): string;
  rgb(): string;
  mac(): string;
  domainName(): string;
  httpMethod(): string;
  statusCode(): number;
  protocol(): string;
  name(): string;
  catchPhrase(): string;
  industry(): string;
  platformName(): string;
  projectName(): string;
  projectDescription(): string;
  department(): string;
  buzzword(): string;
  past(years?: number): Date;
  future(years?: number): Date;
  recent(days?: number): Date;
  soon(days?: number): Date;
  between(from: Date, to: Date): Date;
  month(): string;
  weekday(): string;
  timestamp(): number;
  iso(): string;
  time(): string;
  year(min?: number, max?: number): number;
  amount(min?: number, max?: number, decimals?: number): string;
  amountRaw(min?: number, max?: number, decimals?: number): number;
  currency(): { code: string, symbol: string, name: string };
  currencyCode(): string;
  currencySymbol(): string;
  creditCard(): string;
  creditCardFull(): string;
  accountNumber(length?: number): string;
  routingNumber(): string;
  transactionId(): string;
  bitcoinAddress(): string;
  iban(): string;
  word(): string;
  words(count?: number): string;
  sentence(wordCount?: number): string;
  sentences(count?: number): string;
  paragraph(sentenceCount?: number): string;
  paragraphs(count?: number): string;
  slug(wordCount?: number): string;
  lines(count?: number): string;
  text(length: number): string;
  uuid(): string;
  objectId(): string;
  fileName(ext?: string): string;
  fileExt(): string;
  mimeType(): string;
  semver(): string;
  filePath(): string;
  directoryPath(): string;
  commonFileType(): string;
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

declare const mockdrop: Mockdrop;
export default mockdrop;
