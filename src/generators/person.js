import firstNames from '../data/firstNames.js';
import lastNames from '../data/lastNames.js';
import jobTitles from '../data/jobTitles.js';

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
    }
  };
}
