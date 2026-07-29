/**
 * @file Ready-made record shapes for the objects most apps display.
 *
 * `create()` is the general tool; these are the shortcut for the common case,
 * where you want ten plausible rows on screen without first describing what a
 * "user" or an "order" looks like.
 *
 * Every preset builds a row as a unit, so fields that ought to agree do:
 * an order's total is the sum of its own parts, an event ends after it
 * starts, and a person's email belongs to their name.
 */

import {
  productAdjectives,
  productMaterials,
  productNouns,
  productCategories,
  orderStatuses,
  leadStatuses,
  priorities,
  paymentMethods,
  eventTitles,
  venues,
} from '../data/commerce.js';

const POST_TAGS = [
  'engineering', 'design', 'product', 'culture', 'tutorial', 'announcement',
  'performance', 'security', 'accessibility', 'testing', 'release', 'opinion',
];

const TRANSACTION_STATUSES = ['pending', 'completed', 'failed', 'reversed'];

const HOUR_MS = 60 * 60 * 1000;

/**
 * Capitalises the first letter and drops a trailing period, turning a lorem
 * sentence into something that reads as a title.
 *
 * @param {string} text
 * @returns {string}
 */
function toTitle(text) {
  const trimmed = text.replace(/\.$/, '');
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Rounds to two decimal places, so money never comes back as 12.340000000001.
 *
 * @param {number} value
 * @returns {number}
 */
function money(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Wraps a row factory into the public `(count, overrides)` entity signature.
 *
 * Overrides run through `create()`, so they accept everything a schema does —
 * generator references, arrow functions, `ref()` relations, static values —
 * and are applied on top of the preset's own fields.
 *
 * @param {Mockdrop} md - The instance the preset draws its data from.
 * @param {(index: number) => Object} rowFactory
 * @returns {(count?: number, overrides?: Object) => Array<Object>}
 */
function preset(md, rowFactory) {
  return (count = 1, overrides = {}) => {
    if (!Number.isInteger(count) || count < 0) {
      throw new RangeError('Entity count must be an integer >= 0.');
    }

    const extras = md.create(overrides, count);
    return Array.from({ length: count }, (_, i) => ({ ...rowFactory(i), ...extras[i] }));
  };
}

/**
 * Builds the `entity` namespace against a fully constructed Mockdrop instance.
 *
 * @param {Mockdrop} md
 * @returns {Record<string, (count?: number, overrides?: Object) => Array<Object>>}
 */
export function createEntityGenerator(md) {
  const { person, internet, company, date, finance, lorem, system, location, helpers } = md;

  /** @returns {string} e.g. "Foldable Walnut Organizer" */
  const productName = () =>
    `${helpers.pick(productAdjectives)} ${helpers.pick(productMaterials)} ${helpers.pick(productNouns)}`;

  return {
    /** A person record — identity fields all belong to the same imaginary person. */
    user: preset(md, () => {
      const identity = person.coherent();
      return {
        id: system.uuid(),
        firstName: identity.firstName,
        lastName: identity.lastName,
        fullName: identity.fullName,
        initials: identity.initials,
        email: identity.email,
        username: identity.username,
        jobTitle: person.jobTitle(),
        phone: person.phone(),
        age: person.age(),
        isActive: helpers.bool(0.8),
        createdAt: date.past(2),
      };
    }),

    /** A sales lead — the record this package was originally built for. */
    lead: preset(md, () => {
      const identity = person.coherent();
      const createdAt = date.past(1);
      return {
        id: system.uuid(),
        name: identity.fullName,
        email: identity.email,
        phone: person.phone(),
        company: company.name(),
        jobTitle: person.jobTitle(),
        source: company.platformName(),
        status: helpers.pick(leadStatuses),
        value: finance.amountRaw(1000, 50000),
        currency: finance.currencyCode(),
        description: company.projectDescription(),
        createdAt,
        updatedAt: date.between(createdAt, new Date()),
      };
    }),

    /** A catalogue product. */
    product: preset(md, () => {
      const price = finance.amountRaw(5, 2000);
      const stockCount = helpers.int(0, 500);
      return {
        id: system.uuid(),
        sku: `SKU-${helpers.alphaNumeric(8).toUpperCase()}`,
        name: productName(),
        description: lorem.sentence(),
        category: helpers.pick(productCategories),
        price,
        currency: finance.currencyCode(),
        inStock: stockCount > 0,
        stockCount,
        rating: helpers.float(1, 5, 1),
        reviewCount: helpers.int(0, 4000),
        createdAt: date.past(3),
      };
    }),

    /** A customer order whose money adds up. */
    order: preset(md, () => {
      const identity = person.coherent();
      const itemCount = helpers.int(1, 8);
      const subtotal = money(finance.amountRaw(20, 4000));
      const tax = money(subtotal * 0.18);
      const shipping = helpers.bool(0.3) ? 0 : money(finance.amountRaw(5, 60));
      return {
        id: system.uuid(),
        orderNumber: `ORD-${helpers.int(100000, 999999)}`,
        customerName: identity.fullName,
        customerEmail: identity.email,
        itemCount,
        subtotal,
        tax,
        shipping,
        total: money(subtotal + tax + shipping),
        currency: finance.currencyCode(),
        status: helpers.pick(orderStatuses),
        paymentMethod: helpers.pick(paymentMethods),
        shippingAddress: location.postalAddress(),
        placedAt: date.recent(60),
      };
    }),

    /** A ledger entry. */
    transaction: preset(md, () => {
      const type = finance.transactionType();
      return {
        id: system.uuid(),
        reference: finance.transactionId(),
        type,
        description: finance.transactionDescription(),
        amount: finance.amountRaw(1, 10000),
        currency: finance.currencyCode(),
        status: helpers.pick(TRANSACTION_STATUSES),
        method: helpers.pick(paymentMethods),
        account: finance.accountNumber(),
        date: date.recent(90),
      };
    }),

    /** An article, with a slug that matches its title. */
    blogPost: preset(md, () => {
      const title = toTitle(lorem.sentence(helpers.int(4, 8)));
      const body = lorem.paragraphs(helpers.int(3, 6));
      const identity = person.coherent();
      return {
        id: system.uuid(),
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        excerpt: lorem.sentence(),
        body,
        author: identity.fullName,
        authorEmail: identity.email,
        tags: helpers.pickUnique(POST_TAGS, helpers.int(1, 4)),
        // ~200 words per minute, at least a minute.
        readingTime: Math.max(1, Math.round(body.split(/\s+/).length / 200)),
        published: helpers.bool(0.7),
        publishedAt: date.past(2),
      };
    }),

    /** A comment on something. */
    comment: preset(md, () => {
      const identity = person.coherent();
      return {
        id: system.uuid(),
        author: identity.fullName,
        email: identity.email,
        body: lorem.sentences(helpers.int(1, 3)),
        likes: helpers.int(0, 500),
        edited: helpers.bool(0.15),
        postedAt: date.recent(30),
      };
    }),

    /** A task in a list or board. */
    todo: preset(md, () => {
      const completed = helpers.bool(0.4);
      return {
        id: system.uuid(),
        title: toTitle(lorem.words(helpers.int(3, 6))),
        description: lorem.sentence(),
        completed,
        priority: helpers.pick(priorities),
        assignee: person.fullName(),
        dueDate: date.soon(30),
        completedAt: completed ? date.recent(14) : null,
        createdAt: date.past(1),
      };
    }),

    /** A calendar entry that ends after it starts. */
    event: preset(md, () => {
      const startsAt = date.soon(90);
      const durationHours = helpers.int(1, 6);
      return {
        id: system.uuid(),
        title: helpers.pick(eventTitles),
        description: lorem.sentence(),
        location: helpers.pick(venues),
        startsAt,
        endsAt: new Date(startsAt.getTime() + durationHours * HOUR_MS),
        durationHours,
        organizer: person.fullName(),
        organizerEmail: internet.email(),
        attendeeCount: helpers.int(2, 120),
        isVirtual: helpers.bool(0.4),
      };
    }),
  };
}
