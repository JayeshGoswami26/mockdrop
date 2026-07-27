import { describe, it, expect } from 'vitest';
import mockdrop from '../src/index.js';

describe('airline generator', () => {
  it('aircraftType() returns a known category', () => {
    const types = ['Narrow-body', 'Wide-body', 'Regional Jet', 'Turboprop', 'Business Jet'];
    expect(types).toContain(mockdrop.airline.aircraftType());
  });

  it('airline() returns a non-empty airline name', () => {
    expect(typeof mockdrop.airline.airline()).toBe('string');
    expect(mockdrop.airline.airline().length).toBeGreaterThan(0);
  });

  it('airplane() returns a non-empty model name', () => {
    expect(typeof mockdrop.airline.airplane()).toBe('string');
  });

  it('airport() returns a shaped object', () => {
    const airport = mockdrop.airline.airport();
    expect(airport).toHaveProperty('name');
    expect(airport).toHaveProperty('iataCode');
    expect(airport).toHaveProperty('city');
    expect(airport.iataCode).toMatch(/^[A-Z]{3}$/);
  });

  it('flightNumber() combines an airline code with digits', () => {
    for (let i = 0; i < 30; i++) {
      expect(mockdrop.airline.flightNumber()).toMatch(/^[A-Z0-9]{2,3}\d+$/);
    }
    expect(mockdrop.airline.flightNumber({ addLeadingZeros: true, length: 4 })).toMatch(/^[A-Z0-9]{2,3}\d{4}$/);
  });

  it('recordLocator() is a 6-character alphanumeric code', () => {
    for (let i = 0; i < 30; i++) {
      expect(mockdrop.airline.recordLocator()).toMatch(/^[A-Z0-9]{6}$/);
    }
  });

  it('recordLocator() can exclude numerics', () => {
    for (let i = 0; i < 20; i++) {
      expect(mockdrop.airline.recordLocator({ allowNumerics: false })).toMatch(/^[A-Z]{6}$/);
    }
  });

  it('seat() returns a row + letter combination', () => {
    for (let i = 0; i < 30; i++) {
      const seat = mockdrop.airline.seat();
      expect(seat).toMatch(/^([1-9]|[1-3][0-9]|4[0-5])[A-F]$/);
    }
  });
});
