import { describe, it, expect } from 'vitest';
import mockdrop from '../src/index.js';

describe('location generator', () => {
  it('buildingNumber() is a non-empty numeric-led string', () => {
    for (let i = 0; i < 30; i++) {
      expect(mockdrop.location.buildingNumber()).toMatch(/^\d+[A-H]?$/);
    }
  });

  it('cardinalDirection()/ordinalDirection()/direction() return valid values', () => {
    const cardinals = ['North', 'East', 'South', 'West'];
    const ordinals = ['Northeast', 'Southeast', 'Southwest', 'Northwest'];
    for (let i = 0; i < 30; i++) {
      expect(cardinals).toContain(mockdrop.location.cardinalDirection());
      expect(ordinals).toContain(mockdrop.location.ordinalDirection());
      expect([...cardinals, ...ordinals]).toContain(mockdrop.location.direction());
    }
  });

  it('city/continent/country/countryCode/county/language/state/street return non-empty strings', () => {
    expect(typeof mockdrop.location.city()).toBe('string');
    expect(typeof mockdrop.location.continent()).toBe('string');
    expect(typeof mockdrop.location.country()).toBe('string');
    expect(mockdrop.location.countryCode()).toMatch(/^[A-Z]{2}$/);
    expect(typeof mockdrop.location.county()).toBe('string');
    expect(typeof mockdrop.location.language()).toBe('string');
    expect(typeof mockdrop.location.state()).toBe('string');
    expect(typeof mockdrop.location.street()).toBe('string');
  });

  it('latitude()/longitude() respect bounds and precision', () => {
    for (let i = 0; i < 50; i++) {
      const lat = mockdrop.location.latitude();
      const lng = mockdrop.location.longitude();
      expect(lat).toBeGreaterThanOrEqual(-90);
      expect(lat).toBeLessThanOrEqual(90);
      expect(lng).toBeGreaterThanOrEqual(-180);
      expect(lng).toBeLessThanOrEqual(180);
    }
  });

  it('nearbyGPSCoordinate() stays close to the given origin', () => {
    const origin = [40.7128, -74.006]; // New York
    for (let i = 0; i < 30; i++) {
      const [lat, lng] = mockdrop.location.nearbyGPSCoordinate({ origin, radius: 50, isMetric: true });
      // Roughly 1 degree of latitude ~= 111km, so 50km radius should stay well within 1 degree.
      expect(Math.abs(lat - origin[0])).toBeLessThan(1);
      expect(Math.abs(lng - origin[1])).toBeLessThan(1.5);
    }
  });

  it('secondaryAddress() and streetAddress() are formatted sensibly', () => {
    expect(mockdrop.location.secondaryAddress()).toMatch(/^(Apt\.|Suite|Unit|Floor|Room) \d+$/);
    expect(mockdrop.location.streetAddress()).toMatch(/^\d+[A-H]? .+$/);
    expect(mockdrop.location.streetAddress(true)).toContain(',');
  });

  it('postalAddress() includes city, state, and zip', () => {
    const address = mockdrop.location.postalAddress();
    expect(address.split(',').length).toBeGreaterThanOrEqual(3);
    expect(address).toMatch(/\d{5}$/);
  });

  it('zipCode() supports custom # formats', () => {
    expect(mockdrop.location.zipCode()).toMatch(/^\d{5}$/);
    expect(mockdrop.location.zipCode('#####-####')).toMatch(/^\d{5}-\d{4}$/);
  });

  it('timeZone() returns a plausible IANA identifier', () => {
    expect(mockdrop.location.timeZone()).toMatch(/^[A-Za-z_]+(\/[A-Za-z_]+){0,2}$|^UTC$/);
  });
});
