/**
 * The experience is a small state machine. Keeping transitions pure makes them testable
 * and stops two async camera moves from fighting over the same state.
 */
export type Phase = 'loading' | 'lobby' | 'doorstep' | 'explore' | 'reading' | 'paused' | 'finale';

const ALLOWED: Record<Phase, Phase[]> = {
  loading: ['lobby'],
  lobby: ['doorstep'],
  doorstep: ['explore', 'paused', 'lobby'],
  explore: ['reading', 'paused', 'finale'],
  reading: ['explore'],
  paused: ['explore', 'doorstep', 'lobby'],
  finale: ['explore'],
};

export function canMove(from: Phase, to: Phase): boolean {
  return ALLOWED[from].includes(to);
}

export class Flow {
  phase: Phase = 'loading';
  private listeners: ((p: Phase, prev: Phase) => void)[] = [];

  go(to: Phase): boolean {
    if (!canMove(this.phase, to)) return false;
    const prev = this.phase;
    this.phase = to;
    this.listeners.forEach((l) => l(to, prev));
    return true;
  }

  on(fn: (p: Phase, prev: Phase) => void): void {
    this.listeners.push(fn);
  }

  /** Movement and looking are only live while exploring or standing at the door. */
  get canWalk(): boolean {
    return this.phase === 'explore' || this.phase === 'doorstep';
  }
}
