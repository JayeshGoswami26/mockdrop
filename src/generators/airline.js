import airlines from '../data/airlines.js';
import airports from '../data/airports.js';
import aircraftModels from '../data/aircraft.js';

const AIRCRAFT_TYPES = ['Narrow-body', 'Wide-body', 'Regional Jet', 'Turboprop', 'Business Jet'];
const SEAT_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const RECORD_LOCATOR_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I/O — visually similar to 1/0
const RECORD_LOCATOR_ALNUM = RECORD_LOCATOR_LETTERS + '0123456789';

export function createAirlineGenerator(prng) {
  return {
    aircraftType() {
      return prng.pick(AIRCRAFT_TYPES);
    },
    /** Airline name, e.g. "Delta Air Lines". */
    airline() {
      return prng.pick(airlines).name;
    },
    /** Airplane model, e.g. "Airbus A320neo". */
    airplane() {
      return prng.pick(aircraftModels);
    },
    /** @returns {{ name: string, iataCode: string, city: string }} */
    airport() {
      return prng.pick(airports);
    },
    /**
     * @param {{ addLeadingZeros?: boolean, length?: number }} [options]
     */
    flightNumber(options = {}) {
      const { addLeadingZeros = false, length } = options;
      const digitLength = length || prng.int(1, 4);
      const max = Math.pow(10, digitLength) - 1;
      let number = String(prng.int(digitLength > 1 ? 1 : 0, max));
      if (addLeadingZeros) number = number.padStart(digitLength, '0');
      return `${prng.pick(airlines).iataCode}${number}`;
    },
    /**
     * Passenger Name Record locator — 6-char alphanumeric booking code.
     * @param {{ allowNumerics?: boolean }} [options]
     */
    recordLocator(options = {}) {
      const { allowNumerics = true } = options;
      const charset = allowNumerics ? RECORD_LOCATOR_ALNUM : RECORD_LOCATOR_LETTERS;
      return prng.string(6, charset).toUpperCase();
    },
    seat() {
      return `${prng.int(1, 45)}${prng.pick(SEAT_LETTERS)}`;
    },
  };
}
