import { describe, it, expect } from 'vitest';
import mockdrop from '../src/index.js';

/**
 * `phone`, `color`, and `airline` all introduce a naming collision between a
 * namespace and a method that shares its name (`person.phone`,
 * `internet.color`, `airline.airline`). These tests pin down the resolution
 * rule: namespace names always win the top-level slot, and the shadowed
 * method stays reachable through its own namespace.
 */
describe('namespace vs. top-level alias collisions', () => {
  it('mockdrop.phone is the phone namespace, not person.phone', () => {
    expect(typeof mockdrop.phone).toBe('object');
    expect(typeof mockdrop.phone.number).toBe('function');
    expect(typeof mockdrop.phone.imei).toBe('function');
  });

  it('person.phone() is still reachable via the namespace', () => {
    expect(typeof mockdrop.person.phone).toBe('function');
    expect(mockdrop.person.phone('US')).toMatch(/^\+1 /);
  });

  it('mockdrop.color is the color namespace, not internet.color', () => {
    expect(typeof mockdrop.color).toBe('object');
    expect(typeof mockdrop.color.human).toBe('function');
  });

  it('internet.color() is still reachable via the namespace', () => {
    expect(mockdrop.internet.color()).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('mockdrop.airline is the airline namespace, not a name-string function', () => {
    expect(typeof mockdrop.airline).toBe('object');
    expect(typeof mockdrop.airline.airline).toBe('function');
    expect(typeof mockdrop.airline.airline()).toBe('string');
  });

  it('mockdrop.rgb() resolves to internet.rgb (registered before color)', () => {
    expect(mockdrop.rgb()).toMatch(/^rgb\(/);
    expect(mockdrop.color.rgb()).toMatch(/^rgb\(/);
  });

  it('mockdrop.timeZone() resolves to date.timeZone (registered before location)', () => {
    expect(typeof mockdrop.timeZone()).toBe('string');
    expect(typeof mockdrop.location.timeZone()).toBe('string');
  });
});

describe('new namespaces are wired into the instance', () => {
  it.each(['location', 'airline', 'animal', 'color', 'phone'])('%s namespace exists with callable methods', (ns) => {
    expect(mockdrop[ns]).toBeTruthy();
    const methodNames = Object.keys(mockdrop[ns]);
    expect(methodNames.length).toBeGreaterThan(0);
    for (const name of methodNames) {
      expect(typeof mockdrop[ns][name]).toBe('function');
    }
  });
});
