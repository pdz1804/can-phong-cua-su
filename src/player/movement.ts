/** Pure movement maths, shared by keyboard and joystick input. */
export interface MoveInput {
  forward: number; // -1..1
  strafe: number; // -1..1 (right positive)
  slow: boolean;
}

export const WALK_SPEED = 2.2; // m/s, a relaxed indoor pace
export const SLOW_FACTOR = 0.45;

/** World-space horizontal velocity for a yaw (radians, 0 = looking toward -z). */
export function velocityFor(input: MoveInput, yaw: number): { x: number; z: number } {
  let f = input.forward;
  let s = input.strafe;
  const len = Math.hypot(f, s);
  if (len > 1) {
    f /= len;
    s /= len;
  }
  const speed = WALK_SPEED * (input.slow ? SLOW_FACTOR : 1);
  const fx = Math.sin(yaw),
    fz = -Math.cos(yaw);
  const rx = Math.cos(yaw),
    rz = Math.sin(yaw);
  return { x: (fx * f + rx * s) * speed, z: (fz * f + rz * s) * speed };
}

export function keysToInput(keys: Set<string>): MoveInput {
  const has = (...k: string[]) => k.some((x) => keys.has(x));
  return {
    forward: (has('KeyW', 'ArrowUp') ? 1 : 0) - (has('KeyS', 'ArrowDown') ? 1 : 0),
    strafe: (has('KeyD', 'ArrowRight') ? 1 : 0) - (has('KeyA', 'ArrowLeft') ? 1 : 0),
    slow: has('ShiftLeft', 'ShiftRight'),
  };
}

/** Joystick knob offset (px) → input, with a small dead zone. */
export function joystickToInput(dx: number, dy: number, radius: number): MoveInput {
  const l = Math.hypot(dx, dy);
  if (l < radius * 0.12) return { forward: 0, strafe: 0, slow: false };
  const k = Math.min(1, l / radius);
  return { forward: (-dy / l) * k, strafe: (dx / l) * k, slow: k < 0.5 };
}

export const PITCH_LIMIT = 1.25;
export function clampPitch(p: number): number {
  return Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, p));
}
