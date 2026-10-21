import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DESIGNER_FILES } from '../../src/world/designer-models';

// room pieces are swapped in by name where they are built (swapInDesignerPiece('room-…', …))
const pieces = readdirSync('src/world')
  .filter((f) => f.endsWith('.ts'))
  .map((f) => readFileSync(`src/world/${f}`, 'utf8'))
  .join('\n');
const PIECE_PREFIX = /^(scene|room|hall|decor|held|finale)-|^keepsake-(fish-tank|firefly-jar)$/;
const SLOTS = [
  'held-door',
  'room-window-frame',
  'held-bedding',
  'room-bed-frame',
  'held-coffee-table',
  'room-writing-desk',
  'room-dresser-cabinet',
  'room-armchair',
  'room-low-cabinet',
  'room-curtain-panel',
  'decor-cork-board',
  'room-oval-rug',
  'room-striped-rug',
  'hall-runner-rug',
  'room-leafy-plant',
  'room-pothos-planter',
  'room-floor-cactus',
  'room-floor-cushion',
  'room-beanbag',
  'room-standing-lamp',
  'room-desk-lamp',
  'room-desk-chair',
  'room-nightstand',
  'room-wall-shelf',
  'room-wall-frame-large',
  'room-round-mirror',
  'hall-scalloped-mirror',
  'hall-fairy-garland',
  'hall-little-shoes',
  'decor-neon-heart',
  'finale-glowing-lily',
  'keepsake-fish-tank',
  'keepsake-firefly-jar',
];

describe('designer models', () => {
  it('every keepsake maps to a distinct kebab-case file name from the brief', () => {
    const names = Object.values(DESIGNER_FILES);
    expect(new Set(names).size).toBe(names.length);
    for (const n of names) expect(n).toMatch(/^keepsake-[a-z0-9-]+$/);
  });
  it('every keepsake id in the map is a real keepsake', () => {
    const src = readFileSync('src/world/keepsakes.ts', 'utf8');
    for (const id of Object.keys(DESIGNER_FILES)) expect(src, id).toMatch(new RegExp(`\\n  ${id}: '`));
  });
  it('every file the manifest lists is shipped (a listed but missing model never loads)', () => {
    const listed = JSON.parse(readFileSync('public/models/designer/manifest.json', 'utf8')) as string[];
    expect(Array.isArray(listed)).toBe(true);
    for (const f of listed) {
      if (PIECE_PREFIX.test(f)) expect(pieces, f).toContain(`swapInDesignerPiece('${f}'`);
      else expect(Object.values(DESIGNER_FILES), f).toContain(f);
      expect(existsSync(`public/models/designer/${f}.glb`), f).toBe(true);
    }
  });
  it('every room piece slot is wired where the piece is built', () => {
    for (const f of SLOTS) expect(pieces, f).toContain(`swapInDesignerPiece('${f}'`);
  });
});
