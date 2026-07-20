export function createDateGenerator(prng) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return {
    past(years = 1) {
      const now = new Date();
      const pastTime = now.getTime() - (prng.next() * years * 365 * 24 * 60 * 60 * 1000);
      return new Date(pastTime);
    },
    future(years = 1) {
      const now = new Date();
      const futureTime = now.getTime() + (prng.next() * years * 365 * 24 * 60 * 60 * 1000);
      return new Date(futureTime);
    },
    recent(days = 7) {
      const now = new Date();
      const pastTime = now.getTime() - (prng.next() * days * 24 * 60 * 60 * 1000);
      return new Date(pastTime);
    },
    soon(days = 7) {
      const now = new Date();
      const futureTime = now.getTime() + (prng.next() * days * 24 * 60 * 60 * 1000);
      return new Date(futureTime);
    },
    between(from, to) {
      const fromTime = from.getTime();
      const toTime = to.getTime();
      const diff = toTime - fromTime;
      return new Date(fromTime + (prng.next() * diff));
    },
    month() {
      return prng.pick(months);
    },
    weekday() {
      return prng.pick(weekdays);
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
