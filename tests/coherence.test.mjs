import { describe, it, expect } from 'vitest';
import mockdrop from '../src/index.js';

/** Mirrors the sanitiser in person.js: "Müller" → "mller". */
const slug = (value) => value.toLowerCase().replace(/[^a-z0-9._]/g, '');

describe('person.coherent()', () => {
  it('derives the email and username from its own name', () => {
    for (let i = 0; i < 100; i++) {
      const p = mockdrop.person.coherent();
      const [localPart, domain] = p.email.split('@');

      expect(localPart.startsWith(slug(p.firstName))).toBe(true);
      expect(localPart).toContain(slug(p.lastName));
      expect(domain).toBeTruthy();

      expect(p.username.startsWith(slug(p.firstName))).toBe(true);
      expect(p.username).toContain(slug(p.lastName));
    }
  });

  it('keeps fullName and initials consistent with the name parts', () => {
    for (let i = 0; i < 50; i++) {
      const p = mockdrop.person.coherent();
      expect(p.fullName).toBe(`${p.firstName} ${p.lastName}`);
      expect(p.initials).toBe(`${p.firstName[0]}${p.lastName[0]}`.toUpperCase());
      expect(p.initials).toHaveLength(2);
    }
  });

  it('honors a pinned first name, last name, and domain', () => {
    const p = mockdrop.person.coherent({
      firstName: 'Jayesh',
      lastName: 'Goswami',
      domain: 'mailinator.com',
    });

    expect(p.firstName).toBe('Jayesh');
    expect(p.lastName).toBe('Goswami');
    expect(p.fullName).toBe('Jayesh Goswami');
    expect(p.initials).toBe('JG');
    expect(p.email).toMatch(/^jayesh[._]?goswami\d*@mailinator\.com$/);
    expect(p.username).toMatch(/^jayesh[._]?goswami\d*$/);
  });

  it('produces only sanitised characters in the email and username', () => {
    for (let i = 0; i < 100; i++) {
      const p = mockdrop.person.coherent();
      expect(p.email).toMatch(/^[a-z0-9._]+@[a-z0-9.-]+\.[a-z]+$/);
      expect(p.username).toMatch(/^[a-z0-9._]+$/);
    }
  });

  it('avoids giving someone the same first and last name', () => {
    // Some names sit in both lists; "Jordan Jordan" reads as broken data.
    for (let i = 0; i < 200; i++) {
      const p = mockdrop.person.coherent();
      expect(p.firstName).not.toBe(p.lastName);
    }
  });

  it('works as a bare generator reference in a schema', () => {
    const rows = mockdrop.create({ user: mockdrop.person.coherent }, 10);

    expect(rows).toHaveLength(10);
    // A fresh identity per row, not one object copied ten times.
    expect(new Set(rows.map((r) => r.user.email)).size).toBeGreaterThan(1);
    for (const row of rows) {
      expect(row.user.email.split('@')[0].startsWith(slug(row.user.firstName))).toBe(true);
    }
  });
});

describe('internet.username()', () => {
  it('derives from a supplied name', () => {
    for (let i = 0; i < 20; i++) {
      const username = mockdrop.internet.username({ firstName: 'Jayesh', lastName: 'Goswami' });
      expect(username).toMatch(/^jayesh[._]?goswami\d*$/);
    }
  });

  it('still works with no arguments', () => {
    expect(mockdrop.internet.username()).toMatch(/^[a-z0-9._]+$/);
  });
});
