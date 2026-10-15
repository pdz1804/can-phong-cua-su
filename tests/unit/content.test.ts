import { describe, expect, it } from 'vitest';
import { TIMELINE } from '../../src/content/timeline';
import { KEEPSAKES } from '../../src/content/keepsakes';
import { FINALE_LINES, NOTEBOOK } from '../../src/content/about-su';

const allText = () =>
  [
    ...TIMELINE.flatMap((m) => [m.date, m.title, m.body]),
    ...Object.values(KEEPSAKES).flatMap((k) => [k.date, k.title, k.body]),
    ...NOTEBOOK.flatMap((p) => [p.heading, ...p.lines]),
    ...FINALE_LINES,
  ].join('\n');

describe('content', () => {
  it('timeline ids are unique and dates are in order', () => {
    const ids = TIMELINE.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    const key = (d: string) => {
      const [dd, mm] = d.split('.').map(Number);
      return mm * 100 + dd;
    };
    const keys = TIMELINE.map((m) => key(m.date));
    expect([...keys].sort((a, b) => a - b)).toEqual(keys);
  });

  it('every letter is warm and substantial, not a one-liner', () => {
    for (const m of TIMELINE) expect(m.body.split(' ').length, m.id).toBeGreaterThan(25);
    for (const [id, k] of Object.entries(KEEPSAKES))
      if (id !== 'notebook') expect(k.body.split(' ').length, id).toBeGreaterThan(20);
  });

  it('never contains private data or wording she dislikes', () => {
    const t = allText();
    expect(t).not.toMatch(/(?<![.\d])0[35789]\d{8}(?!\d)/); // phone numbers
    expect(t).not.toMatch(/\b\d{2,4}\/\d{1,4}\/\d{1,4}\b/); // house address
    expect(t).not.toMatch(/size\s*:?\s*3\d/i);
    expect(t).not.toMatch(/:\){3,}/);
    expect(t).not.toMatch(/l[àa]m d[âa]u/i);
    expect(t).not.toMatch(/Dubai/i);
  });

  it('the finale is signed by Phú', () => {
    expect(FINALE_LINES.at(-1)).toContain('Phú');
  });
});

import { KEEPSAKE_IDS } from '../../src/world/keepsakes';
describe('world ↔ content', () => {
  it('every keepsake placed in the room has a letter', () => {
    for (const id of KEEPSAKE_IDS) expect(KEEPSAKES[id], id).toBeDefined();
  });
});
