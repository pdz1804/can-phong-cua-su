import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { KAYKIT_NAMES, MODEL_NAMES } from '../../src/world/assets';

describe('assets', () => {
  it('every model the app loads exists in public/models (a missing one breaks loading)', () => {
    for (const n of MODEL_NAMES) expect(existsSync(`public/models/${n}.glb`), n).toBe(true);
    for (const n of KAYKIT_NAMES) expect(existsSync(`public/models/kaykit/${n}.gltf`), n).toBe(true);
    expect(existsSync('public/models/kaykit/furniturebits_texture.png')).toBe(true);
  });
  it('every texture the app loads exists in public/textures', () => {
    const src = readFileSync('src/world/assets.ts', 'utf8');
    const files = [...src.matchAll(/textures\/\$\{name\}|tex\('([\w.]+)'/g)].map((m) => m[1]).filter(Boolean);
    expect(files.length).toBeGreaterThan(5);
    for (const f of [...files, 'room.hdr']) expect(existsSync(`public/textures/${f}`), f).toBe(true);
  });
});
