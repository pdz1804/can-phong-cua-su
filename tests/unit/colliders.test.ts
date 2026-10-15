import { describe, expect, it } from 'vitest';
import { Colliders } from '../../src/world/kit';

describe('colliders', () => {
  it('re-closing the door never leaves two blockers behind', () => {
    const col = new Colliders();
    col.box(0, 0, 1, 0.3, 'door');
    // what "back to the lobby" does: remove then add exactly one
    col.remove('door');
    col.box(0, 0, 1, 0.3, 'door');
    expect(col.group.children.length).toBe(1);
    col.remove('door'); // opening the door
    expect(col.group.children.length).toBe(0);
  });
});
