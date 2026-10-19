import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DESIGNER_FILES } from '../../src/world/designer-models';

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
    // room pieces are swapped in by name where they are built (swapInDesignerPiece('scene-…', …))
    const pieces = ['hallway', 'room', 'furniture', 'finale']
      .map((m) => readFileSync(`src/world/${m}.ts`, 'utf8'))
      .join('\n');
    for (const f of listed) {
      if (f.startsWith('scene-')) expect(pieces, f).toContain(`swapInDesignerPiece('${f}'`);
      else expect(Object.values(DESIGNER_FILES), f).toContain(f);
      expect(existsSync(`public/models/designer/${f}.glb`), f).toBe(true);
    }
  });
});
