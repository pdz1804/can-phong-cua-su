/**
 * Touch controls: a joystick that appears under the left thumb, drag-to-look on the right,
 * and a short tap anywhere to use what the crosshair points at.
 */
import { Player } from './player';

export function bindTouch(
  el: HTMLElement,
  player: Player,
  onTap: (x: number, y: number) => void,
  isActive: () => boolean,
) {
  const base = document.getElementById('joy')!,
    knob = document.getElementById('joyKnob')!;
  const R = 56;
  let moveId: number | null = null,
    lookId: number | null = null;
  let ox = 0,
    oy = 0,
    lx = 0,
    ly = 0,
    sx = 0,
    sy = 0,
    travelled = 0,
    t0 = 0;

  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch' || !isActive()) return;
    if (e.clientX < innerWidth * 0.42 && moveId === null) {
      moveId = e.pointerId;
      ox = e.clientX;
      oy = e.clientY;
      base.style.left = ox + 'px';
      base.style.top = oy + 'px';
      base.hidden = false;
      knob.style.transform = 'translate(-50%,-50%)';
    } else if (lookId === null) {
      lookId = e.pointerId;
      lx = sx = e.clientX;
      ly = sy = e.clientY;
      travelled = 0;
      t0 = performance.now();
    }
  });
  el.addEventListener('pointermove', (e) => {
    if (e.pointerId === moveId) {
      let dx = e.clientX - ox,
        dy = e.clientY - oy;
      const l = Math.hypot(dx, dy);
      if (l > R) {
        dx = (dx / l) * R;
        dy = (dy / l) * R;
      }
      knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      player.joystickFrom(dx, dy, R);
    } else if (e.pointerId === lookId) {
      const dx = e.clientX - lx,
        dy = e.clientY - ly;
      lx = e.clientX;
      ly = e.clientY;
      travelled += Math.abs(dx) + Math.abs(dy);
      player.look(dx, dy, 0.0055);
    }
  });
  const end = (e: PointerEvent) => {
    if (e.pointerId === moveId) {
      moveId = null;
      base.hidden = true;
      player.joystickFrom(0, 0, R);
    }
    if (e.pointerId === lookId) {
      lookId = null;
      if (travelled < 10 && performance.now() - t0 < 350) onTap(sx, sy);
    }
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
}
