import countries from '../data/countries.js';
import continents from '../data/continents.js';
import languages from '../data/languages.js';
import states from '../data/states.js';
import counties from '../data/counties.js';
import timezones from '../data/timezones.js';
import streets from '../data/streets.js';
import cities from '../data/cities.js';

const CARDINAL_DIRECTIONS = ['North', 'East', 'South', 'West'];
const ORDINAL_DIRECTIONS = ['Northeast', 'Southeast', 'Southwest', 'Northwest'];

/** Kilometers/miles per degree of latitude, used to size GPS jitter. */
const KM_PER_DEGREE = 111.045;
const MILES_PER_DEGREE = 69.0;

export function createLocationGenerator(prng) {
  return {
    buildingNumber() {
      const number = prng.int(1, 9999);
      const suffix = prng.bool(0.1) ? prng.char('ABCDEFGH').toUpperCase() : '';
      return `${number}${suffix}`;
    },
    cardinalDirection() {
      return prng.pick(CARDINAL_DIRECTIONS);
    },
    ordinalDirection() {
      return prng.pick(ORDINAL_DIRECTIONS);
    },
    direction() {
      return prng.bool() ? this.cardinalDirection() : this.ordinalDirection();
    },
    city() {
      return prng.pick(cities);
    },
    continent() {
      return prng.pick(continents);
    },
    country() {
      return prng.pick(countries).name;
    },
    countryCode() {
      return prng.pick(countries).code;
    },
    county() {
      return prng.pick(counties);
    },
    language() {
      return prng.pick(languages);
    },
    state() {
      return prng.pick(states);
    },
    street() {
      return prng.pick(streets);
    },
    /**
     * @param {number} [min=-90]
     * @param {number} [max=90]
     * @param {number} [precision=4] Decimal places to round to.
     */
    latitude(min = -90, max = 90, precision = 4) {
      return prng.float(min, max, precision);
    },
    /**
     * @param {number} [min=-180]
     * @param {number} [max=180]
     * @param {number} [precision=4] Decimal places to round to.
     */
    longitude(min = -180, max = 180, precision = 4) {
      return prng.float(min, max, precision);
    },
    /**
     * Generates a `[lat, lng]` pair within `radius` of `origin` (or a random
     * origin when omitted), suitable for mocking "near me" style features.
     *
     * @param {{ origin?: [number, number], radius?: number, isMetric?: boolean }} [options]
     * @returns {[number, number]}
     */
    nearbyGPSCoordinate(options = {}) {
      const { origin, radius = 10, isMetric = true } = options;
      const [originLat, originLng] = origin || [this.latitude(), this.longitude()];
      const degreesPerUnit = isMetric ? KM_PER_DEGREE : MILES_PER_DEGREE;
      const radiusInDegrees = radius / degreesPerUnit;

      // Uniform point within a circle: sqrt(random) for the radius avoids
      // clustering samples near the center.
      const angle = prng.next() * 2 * Math.PI;
      const distance = Math.sqrt(prng.next()) * radiusInDegrees;

      const deltaLat = distance * Math.sin(angle);
      const deltaLng = (distance * Math.cos(angle)) / Math.cos((originLat * Math.PI) / 180);

      let lat = originLat + deltaLat;
      lat = Math.max(-90, Math.min(90, lat));

      let lng = ((originLng + deltaLng + 180) % 360 + 360) % 360 - 180;

      const factor = Math.pow(10, 4);
      return [Math.round(lat * factor) / factor, Math.round(lng * factor) / factor];
    },
    secondaryAddress() {
      const type = prng.pick(['Apt.', 'Suite', 'Unit', 'Floor', 'Room']);
      return `${type} ${prng.int(1, 999)}`;
    },
    /**
     * @param {boolean} [useFullAddress=false] Include a secondary address line.
     */
    streetAddress(useFullAddress = false) {
      const base = `${this.buildingNumber()} ${this.street()}`;
      return useFullAddress ? `${base}, ${this.secondaryAddress()}` : base;
    },
    postalAddress() {
      return `${this.streetAddress()}, ${this.city()}, ${this.state()} ${this.zipCode()}`;
    },
    /**
     * @param {string} [format='#####'] `#` characters are replaced with random digits.
     */
    zipCode(format = '#####') {
      return format.replace(/#/g, () => prng.int(0, 9));
    },
    timeZone() {
      return prng.pick(timezones);
    },
  };
}
