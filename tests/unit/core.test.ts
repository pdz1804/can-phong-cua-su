import { describe, expect, it } from 'vitest';
import { canMove, Flow } from '../../src/core/flow';
import { DEFAULT_SETTINGS, sanitizeSettings, Store, UNLOCK_COUNT } from '../../src/core/store';
import { clampPitch, joystickToInput, keysToInput, velocityFor, WALK_SPEED } from '../../src/player/movement';

class MemKV {
  data = new Map<string, string>();
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
}

describe('flow', () => {
  it('follows the intended path and rejects shortcuts', () => {
    const f = new Flow();
    expect(f.go('explore')).toBe(false);
    expect(f.go('lobby')).toBe(true);
    expect(f.go('doorstep')).toBe(true);
    expect(f.canWalk).toBe(true);
    expect(f.go('finale')).toBe(false); // must be inside the room first
    expect(f.go('explore')).toBe(true);
    expect(f.go('reading')).toBe(true);
    expect(f.canWalk).toBe(false);
    expect(canMove('reading', 'finale')).toBe(false);
  });
});

describe('store', () => {
  it('persists settings and progress, and unlocks the jar', () => {
    const kv = new MemKV();
    const s = new Store(kv);
    expect(s.settings).toEqual(DEFAULT_SETTINGS);
    s.saveSettings({ weather: 'sunset', sensitivity: 9 });
    expect(new Store(kv).settings.weather).toBe('sunset');
    expect(new Store(kv).settings.sensitivity).toBe(2);
    expect(s.markSeen('a')).toBe(true);
    expect(s.markSeen('a')).toBe(false);
    for (let i = 0; i < UNLOCK_COUNT; i++) s.markSeen('m' + i);
    expect(s.unlocked).toBe(true);
    expect(s.glow).toBe(1);
    expect(new Store(kv).seen.size).toBe(UNLOCK_COUNT + 1);
  });

  it('works when storage is unavailable or corrupt', () => {
    expect(new Store(null).settings.weather).toBe('rain');
    const kv = new MemKV();
    kv.setItem('su-settings', '{not json');
    expect(new Store(kv).settings).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings({ weather: 'snow' as never }).weather).toBe('rain');
    const bad = new MemKV();
    bad.setItem('su-seen', JSON.stringify({ not: 'an array' }));
    expect(new Store(bad).seen.size).toBe(0);
    bad.setItem('su-seen', JSON.stringify(['a', 3, null, 'b']));
    expect([...new Store(bad).seen]).toEqual(['a', 'b']);
  });
});

describe('movement', () => {
  it('walks forward along the view direction', () => {
    const v = velocityFor({ forward: 1, strafe: 0, slow: false }, 0);
    expect(v.x).toBeCloseTo(0);
    expect(v.z).toBeCloseTo(-WALK_SPEED);
  });
  it('diagonals are not faster than straight lines', () => {
    const v = velocityFor({ forward: 1, strafe: 1, slow: false }, 0.3);
    expect(Math.hypot(v.x, v.z)).toBeCloseTo(WALK_SPEED);
  });
  it('maps keys and joystick, with a dead zone', () => {
    expect(keysToInput(new Set(['KeyW', 'KeyD']))).toEqual({ forward: 1, strafe: 1, slow: false });
    expect(joystickToInput(2, 2, 56)).toEqual({ forward: 0, strafe: 0, slow: false });
    expect(joystickToInput(0, -56, 56).forward).toBeCloseTo(1);
    expect(clampPitch(5)).toBeLessThan(1.3);
  });
});
