import firstNames from '../data/firstNames.js';
import lastNames from '../data/lastNames.js';
import jobTitles from '../data/jobTitles.js';
import { emailDomains } from '../data/domains.js';

/**
 * Strips anything that isn't legal in the local part of an email address or a
 * username — accented characters included, so "Müller" becomes "mller".
 * @param {string} value
 * @returns {string}
 */
function slugifyIdentity(value) {
  return value.toLowerCase().replace(/[^a-z0-9._]/g, '');
}

export function createPersonGenerator(prng) {
  return {
    firstName() {
      return prng.pick(firstNames);
    },
    lastName() {
      return prng.pick(lastNames);
    },
    fullName() {
      return `${this.firstName()} ${this.lastName()}`;
    },
    age(min = 18, max = 80) {
      return prng.int(min, max);
    },
    gender() {
      return prng.pick(['Male', 'Female', 'Non-binary']);
    },
    avatar() {
      const randomId = prng.int(1, 1000);
      return `https://i.pravatar.cc/150?u=${randomId}`;
    },
    bio() {
      const jobTitle = prng.pick(jobTitles);
      const suffixes = [
        "with a passion for building scalable systems.",
        "who loves designing beautiful user interfaces.",
        "dedicated to improving operational efficiency.",
        "focused on creating impactful products.",
        "specializing in data-driven decision making.",
        "with a proven track record of successful project delivery.",
        "always looking for the next big challenge.",
        "committed to team growth and mentorship."
      ];
      const suffix = prng.pick(suffixes);
      return `${jobTitle} ${suffix}`;
    },
    phone(format = 'US') {
      switch (format.toUpperCase()) {
        case 'US':
          return `+1 (${prng.string(3, '0123456789')}) ${prng.string(3, '0123456789')}-${prng.string(4, '0123456789')}`;
        case 'UK':
          return `+44 ${prng.string(4, '0123456789')} ${prng.string(6, '0123456789')}`;
        case 'IN':
          return `+91 ${prng.string(5, '0123456789')} ${prng.string(5, '0123456789')}`;
        case 'INTERNATIONAL':
        default:
          return `+${prng.int(1, 99)} ${prng.string(10, '0123456789')}`;
      }
    },
    jobTitle() {
      return prng.pick(jobTitles);
    },
    prefix() {
      return prng.pick(['Mr.', 'Ms.', 'Dr.', 'Mrs.']);
    },

    /**
     * A person whose fields agree with one another — the email and username
     * are built from the same name rather than drawn independently.
     *
     * Calling `person.fullName()` and `internet.email()` in the same schema
     * gives you unrelated values ("Jayesh Goswami" alongside
     * "brandon_hamilton@…"), which reads as obviously fake in a demo. Use this
     * when the identity fields need to belong to the same imaginary person.
     *
     * @param {{ firstName?: string, lastName?: string, domain?: string }} [options]
     *        Pin any part of the identity; anything omitted is generated.
     * @returns {{ firstName: string, lastName: string, fullName: string,
     *             initials: string, email: string, username: string }}
     *
     * @example
     * mockdrop.create({ user: mockdrop.person.coherent }, 1);
     * // → [{ user: { firstName: 'Jayesh', lastName: 'Goswami',
     * //              fullName: 'Jayesh Goswami', initials: 'JG',
     * //              email: 'jayesh.goswami@gmail.com',
     * //              username: 'jayesh_goswami42' } }]
     */
    coherent(options = {}) {
      const firstName = options.firstName || prng.pick(firstNames);

      // A handful of names (Jordan, Morgan, …) appear in both lists, and
      // "Jordan Jordan" undoes the realism this method exists to provide.
      let lastName = options.lastName || prng.pick(lastNames);
      for (let attempt = 0; !options.lastName && lastName === firstName && attempt < 5; attempt++) {
        lastName = prng.pick(lastNames);
      }

      const domain = options.domain || prng.pick(emailDomains);

      const first = slugifyIdentity(firstName);
      const last = slugifyIdentity(lastName);

      const localPart = prng.pick([
        `${first}.${last}`,
        `${first}${last}`,
        `${first}_${last}`,
        `${first}.${last}${prng.int(1, 99)}`,
      ]);

      const separator = prng.pick(['', '_', '.']);
      const usernameSuffix = prng.bool(0.7) ? prng.int(1, 999) : '';

      return {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        initials: `${firstName[0]}${lastName[0]}`.toUpperCase(),
        email: `${localPart}@${domain}`,
        username: `${first}${separator}${last}${usernameSuffix}`,
      };
    }
  };
}
