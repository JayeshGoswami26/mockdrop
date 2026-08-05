import { describe, it, expect, afterEach } from 'vitest';
import mockdrop, { Mockdrop } from '../src/index.js';

const FIXED = new Date('2026-06-25T12:00:00.000Z');

/** Every generator that reads the clock, as `(md) => value` probes. */
const RELATIVE = {
  past: (md) => md.date.past(),
  future: (md) => md.date.future(),
  recent: (md) => md.date.recent(),
  soon: (md) => md.date.soon(),
  anytime: (md) => md.date.anytime(),
  birthdate: (md) => md.date.birthdate(),
  pastDate: (md) => md.date.pastDate(3),
  futureDate: (md) => md.date.futureDate(3),
  timestamp: (md) => md.date.timestamp(),
  iso: (md) => md.date.iso(),
  time: (md) => md.date.time(),
};

/** A fresh "run" of a mock module: new instance, same seed, same pinned clock. */
function run(fn, { seed = 1, now = FIXED } = {}) {
  const md = new Mockdrop(seed);
  md.setNow(now);
  return fn(md);
}

afterEach(() => {
  // The singleton is shared across test files — never leave it pinned.
  mockdrop.setNow(null);
});

describe('setNow() / getNow()', () => {
  it('follows the live system clock by default', () => {
    const md = new Mockdrop(1);
    expect(md.clock.isFixed()).toBe(false);
    expect(Math.abs(md.getNow().getTime() - Date.now())).toBeLessThan(1000);
  });

  it('pins the clock to the given instant', () => {
    const md = new Mockdrop(1);
    md.setNow(FIXED);
    expect(md.getNow().toISOString()).toBe(FIXED.toISOString());
    expect(md.getNow().toISOString()).toBe(FIXED.toISOString()); // still, later
  });

  it('accepts a Date, a parsable string, or epoch milliseconds', () => {
    const md = new Mockdrop(1);
    for (const value of [FIXED, '2026-06-25T12:00:00.000Z', FIXED.getTime()]) {
      md.setNow(value);
      expect(md.getNow().getTime()).toBe(FIXED.getTime());
    }
  });

  it('returns a fresh Date each call, so mutating it cannot corrupt the clock', () => {
    const md = new Mockdrop(1);
    md.setNow(FIXED);

    const first = md.getNow();
    first.setFullYear(1999);

    expect(md.getNow().getTime()).toBe(FIXED.getTime());
    expect(md.getNow()).not.toBe(first);
  });

  it('restores the live clock with null (and with no argument)', () => {
    const md = new Mockdrop(1);

    md.setNow(FIXED);
    expect(md.clock.isFixed()).toBe(true);

    md.setNow(null);
    expect(md.clock.isFixed()).toBe(false);
    expect(Math.abs(md.getNow().getTime() - Date.now())).toBeLessThan(1000);

    md.setNow(FIXED);
    md.setNow();
    expect(md.clock.isFixed()).toBe(false);
  });

  it('rejects a value that is not a date', () => {
    const md = new Mockdrop(1);
    expect(() => md.setNow('not a date')).toThrow(TypeError);
    expect(() => md.setNow(NaN)).toThrow(TypeError);
    expect(() => md.setNow({})).toThrow(TypeError);
  });

  it('is per-instance — pinning one instance leaves another alone', () => {
    const pinned = new Mockdrop(1);
    const live = new Mockdrop(1);

    pinned.setNow(FIXED);

    expect(pinned.clock.isFixed()).toBe(true);
    expect(live.clock.isFixed()).toBe(false);
  });
});

describe('the clock and the seed are independent', () => {
  it('setSeed() does not release the clock', () => {
    const md = new Mockdrop(1);
    md.setNow(FIXED);
    md.setSeed(99);

    expect(md.clock.isFixed()).toBe(true);
    expect(md.getNow().getTime()).toBe(FIXED.getTime());
  });

  it('setNow() does not reset the seed', () => {
    const a = new Mockdrop(42);
    const b = new Mockdrop(42);

    // Advance both identically, then pin only one — the PRNG sequence must
    // continue from where it was rather than restarting.
    a.fullName();
    b.fullName();
    a.setNow(FIXED);

    expect(a.fullName()).toBe(b.fullName());
  });
});

describe('determinism across runs (the SSR hydration case)', () => {
  it.each(Object.keys(RELATIVE))(
    '%s() is byte-identical across two separate runs',
    (name) => {
      const probe = RELATIVE[name];
      const first = run(probe);
      const second = run(probe);

      expect(String(first)).toBe(String(second));
      if (first instanceof Date) {
        expect(first.getTime()).toBe(second.getTime());
      }
    },
  );

  it('reproduces a whole dataset, not just single values', () => {
    const build = (md) => md.create({
      id: (i) => i + 1,
      createdAt: md.pastDate,
      updatedAt: md.date.recent,
      dueAt: md.date.soon,
      dob: md.date.birthdate,
    }, 25);

    expect(JSON.stringify(run(build))).toBe(JSON.stringify(run(build)));
  });

  it('reproduces entity presets, which build dates internally', () => {
    const leads = (md) => md.entity.lead(10);
    expect(JSON.stringify(run(leads))).toBe(JSON.stringify(run(leads)));

    const users = (md) => md.entity.user(10);
    expect(JSON.stringify(run(users))).toBe(JSON.stringify(run(users)));
  });

  it('a different pinned instant produces different data', () => {
    const probe = (md) => md.date.recent().toISOString();
    expect(run(probe, { now: FIXED })).not.toBe(
      run(probe, { now: new Date('2020-01-01') }),
    );
  });

  it('the same instant with a different seed produces different data', () => {
    const probe = (md) => md.date.recent().toISOString();
    expect(run(probe, { seed: 1 })).not.toBe(run(probe, { seed: 2 }));
  });
});

describe('pinned dates sit where they should relative to "now"', () => {
  const md = new Mockdrop(7);
  md.setNow(FIXED);
  const fixedTime = FIXED.getTime();
  const DAY = 24 * 60 * 60 * 1000;

  it('past() and recent() land before the pinned instant', () => {
    for (let i = 0; i < 50; i++) {
      expect(md.date.past().getTime()).toBeLessThanOrEqual(fixedTime);
      expect(md.date.recent(7).getTime()).toBeGreaterThanOrEqual(fixedTime - 7 * DAY);
      expect(md.date.recent(7).getTime()).toBeLessThanOrEqual(fixedTime);
    }
  });

  it('future() and soon() land after the pinned instant', () => {
    for (let i = 0; i < 50; i++) {
      expect(md.date.future().getTime()).toBeGreaterThanOrEqual(fixedTime);
      expect(md.date.soon(7).getTime()).toBeLessThanOrEqual(fixedTime + 7 * DAY);
      expect(md.date.soon(7).getTime()).toBeGreaterThanOrEqual(fixedTime);
    }
  });

  it('anytime() stays within a year either side of the pinned instant', () => {
    const YEAR = 365 * DAY;
    for (let i = 0; i < 50; i++) {
      const at = md.date.anytime().getTime();
      expect(at).toBeGreaterThanOrEqual(fixedTime - YEAR);
      expect(at).toBeLessThanOrEqual(fixedTime + YEAR);
    }
  });

  it('birthdate() ages off the pinned instant, not the wall clock', () => {
    for (let i = 0; i < 25; i++) {
      const dob = md.date.birthdate({ min: 30, max: 30 });
      expect(dob.getFullYear()).toBe(FIXED.getFullYear() - 30);
    }
  });

  it('date.now() reports the pinned instant', () => {
    expect(md.date.now().getTime()).toBe(fixedTime);
  });
});

describe('jwt claims follow the clock', () => {
  const decode = (token) =>
    JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));

  it('iat is the pinned instant, in seconds', () => {
    const md = new Mockdrop(3);
    md.setNow(FIXED);

    const { iat, exp } = decode(md.internet.jwt());
    expect(iat).toBe(Math.floor(FIXED.getTime() / 1000));
    expect(exp).toBeGreaterThan(iat);
  });

  it('is identical across runs', () => {
    const token = (md) => md.internet.jwt();
    expect(run(token)).toBe(run(token));
  });
});

describe('the singleton exposes the clock too', () => {
  it('pins and releases through the default export', () => {
    mockdrop.setNow(FIXED);
    expect(mockdrop.getNow().getTime()).toBe(FIXED.getTime());

    mockdrop.setSeed(5);
    const first = mockdrop.date.recent().toISOString();
    mockdrop.setSeed(5);
    expect(mockdrop.date.recent().toISOString()).toBe(first);

    mockdrop.setNow(null);
    expect(mockdrop.clock.isFixed()).toBe(false);
  });
});
