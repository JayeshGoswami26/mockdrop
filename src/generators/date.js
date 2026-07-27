import timezones from '../data/timezones.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const YEAR_MS = 365 * DAY_MS;

export function createDateGenerator(prng) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return {
    past(years = 1) {
      const now = new Date();
      const pastTime = now.getTime() - (prng.next() * years * YEAR_MS);
      return new Date(pastTime);
    },
    future(years = 1) {
      const now = new Date();
      const futureTime = now.getTime() + (prng.next() * years * YEAR_MS);
      return new Date(futureTime);
    },
    recent(days = 7) {
      const now = new Date();
      const pastTime = now.getTime() - (prng.next() * days * DAY_MS);
      return new Date(pastTime);
    },
    soon(days = 7) {
      const now = new Date();
      const futureTime = now.getTime() + (prng.next() * days * DAY_MS);
      return new Date(futureTime);
    },
    pastDate(years = 1) {
      return this.past(years);
    },
    futureDate(years = 1) {
      return this.future(years);
    },
    /** A date anywhere from one year ago to one year from now. */
    anytime() {
      const now = Date.now();
      return this.between(new Date(now - YEAR_MS), new Date(now + YEAR_MS));
    },
    between(from, to) {
      const fromTime = from.getTime();
      const toTime = to.getTime();
      const diff = toTime - fromTime;
      return new Date(fromTime + (prng.next() * diff));
    },
    /**
     * `count` dates between `from` and `to`, sorted chronologically.
     * @param {Date} from
     * @param {Date} to
     * @param {number} [count=3]
     * @returns {Date[]}
     */
    betweens(from, to, count = 3) {
      const dates = [];
      for (let i = 0; i < count; i++) {
        dates.push(this.between(from, to));
      }
      return dates.sort((a, b) => a.getTime() - b.getTime());
    },
    /**
     * A plausible birthdate, either by target age or by birth year.
     *
     * @param {{ min?: number, max?: number, mode?: 'age' | 'year', refDate?: Date | string | number }} [options]
     * @returns {Date}
     */
    birthdate(options = {}) {
      const { min = 18, max = 80, mode = 'age', refDate = new Date() } = options;
      const ref = refDate instanceof Date ? refDate : new Date(refDate);
      const month = prng.int(0, 11);
      const day = prng.int(1, 28); // stays valid across all months, incl. February

      if (mode === 'year') {
        return new Date(prng.int(min, max), month, day);
      }

      const age = prng.int(min, max);
      return new Date(ref.getFullYear() - age, month, day);
    },
    /**
     * @param {{ abbreviated?: boolean }} [options]
     */
    month(options = {}) {
      const { abbreviated = false } = options;
      const name = prng.pick(months);
      return abbreviated ? name.slice(0, 3) : name;
    },
    /**
     * @param {{ abbreviated?: boolean }} [options]
     */
    weekday(options = {}) {
      const { abbreviated = false } = options;
      const name = prng.pick(weekdays);
      return abbreviated ? name.slice(0, 3) : name;
    },
    /** An IANA time zone identifier, e.g. "America/New_York". */
    timeZone() {
      return prng.pick(timezones);
    },
    timestamp() {
      return this.past().getTime();
    },
    iso() {
      return this.past().toISOString();
    },
    time() {
      const date = this.past();
      return date.toISOString().split('T')[1].split('.')[0]; // HH:MM:SS
    },
    year(min = 1970, max = 2050) {
      return prng.int(min, max);
    }
  };
}
