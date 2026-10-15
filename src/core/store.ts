/** Settings + progress, persisted per browser. Every storage access is guarded (private mode, blocked storage). */
export type Weather = 'rain' | 'clear' | 'sunset';
export type Quality = 'auto' | 'low' | 'high';

export interface Settings {
  weather: Weather;
  music: boolean;
  ambience: boolean;
  quality: Quality;
  sensitivity: number; // 0.5 – 2
}

export const DEFAULT_SETTINGS: Settings = {
  weather: 'rain',
  music: true,
  ambience: true,
  quality: 'auto',
  sensitivity: 1,
};

export const UNLOCK_COUNT = 12; // memories to open before the firefly jar can be released

interface KV {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}

function safeStorage(): KV | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function read<T>(kv: KV | null, key: string, fallback: T): T {
  try {
    const raw = kv?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(kv: KV | null, key: string, value: unknown): void {
  try {
    kv?.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked: the app keeps working without persistence */
  }
}

export function sanitizeSettings(raw: Partial<Settings> | null | undefined): Settings {
  const s = { ...DEFAULT_SETTINGS, ...(raw ?? {}) };
  if (!['rain', 'clear', 'sunset'].includes(s.weather)) s.weather = 'rain';
  if (!['auto', 'low', 'high'].includes(s.quality)) s.quality = 'auto';
  s.sensitivity = Math.min(2, Math.max(0.5, Number(s.sensitivity) || 1));
  s.music = Boolean(s.music);
  s.ambience = Boolean(s.ambience);
  return s;
}

export class Store {
  private kv: KV | null;
  settings: Settings;
  seen: Set<string>;
  finaleDone: boolean;

  constructor(kv: KV | null = safeStorage()) {
    this.kv = kv;
    this.settings = sanitizeSettings(read(kv, 'su-settings', DEFAULT_SETTINGS));
    const saved = read<unknown>(kv, 'su-seen', []);
    this.seen = new Set(Array.isArray(saved) ? saved.filter((x): x is string => typeof x === 'string') : []);
    this.finaleDone = read(kv, 'su-finale', false);
  }

  saveSettings(patch: Partial<Settings>): Settings {
    this.settings = sanitizeSettings({ ...this.settings, ...patch });
    write(this.kv, 'su-settings', this.settings);
    return this.settings;
  }

  /** Returns true when this id was not seen before. */
  markSeen(id: string): boolean {
    if (this.seen.has(id)) return false;
    this.seen.add(id);
    write(this.kv, 'su-seen', [...this.seen]);
    return true;
  }

  get unlocked(): boolean {
    return this.seen.size >= UNLOCK_COUNT;
  }

  /** 0..1, how bright the firefly jar is. */
  get glow(): number {
    return Math.min(1, this.seen.size / UNLOCK_COUNT);
  }

  setFinaleDone(): void {
    this.finaleDone = true;
    write(this.kv, 'su-finale', true);
  }
}
