/**
 * The guided memory path: a gentle stream of fireflies flowing from the player toward the next
 * thing to open, so the room reads as a story in date order rather than a scavenger hunt.
 */
import * as THREE from 'three';
import { canvasTex, makeCanvas } from './kit';

const N = 44;
const _ahead = new THREE.Vector3(),
  _start = new THREE.Vector3(),
  _mid = new THREE.Vector3(),
  _p = new THREE.Vector3();

export class Guide {
  private geo = new THREE.BufferGeometry();
  private pos = new Float32Array(N * 3);
  private mat: THREE.PointsMaterial;
  private phase = 0;
  private alpha = 0;
  private curve = new THREE.QuadraticBezierCurve3();
  readonly points: THREE.Points;

  constructor(scene: THREE.Scene) {
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    const sprite = canvasTex(
      makeCanvas(64, 64, (g, w) => {
        const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
        gr.addColorStop(0, 'rgba(255,245,200,1)');
        gr.addColorStop(0.3, 'rgba(255,220,140,.7)');
        gr.addColorStop(1, 'rgba(255,200,90,0)');
        g.fillStyle = gr;
        g.fillRect(0, 0, w, w);
      }),
    );
    this.mat = new THREE.PointsMaterial({
      map: sprite,
      size: 0.09,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0xffe7a3,
    });
    this.points = new THREE.Points(this.geo, this.mat);
    this.points.frustumCulled = false;
    scene.add(this.points);
  }

  /** target = world position of the next memory, or null to fade the path out. */
  update(dt: number, from: THREE.Vector3, target: THREE.Vector3 | null) {
    this.alpha += ((target ? 0.85 : 0) - this.alpha) * Math.min(1, dt * 2);
    this.mat.opacity = this.alpha;
    if (!target || this.alpha < 0.01) return;
    // start a little ahead and below the eye: fireflies right at the camera bloom into big blobs
    const ahead = _ahead.copy(target).sub(from).setY(0);
    const start = _start.copy(from);
    start.y -= 0.5;
    if (ahead.lengthSq() > 1e-4)
      start.addScaledVector(ahead.normalize(), Math.min(0.9, from.distanceTo(target) * 0.4));
    const mid = _mid.copy(start).lerp(target, 0.5);
    mid.y = Math.max(start.y, target.y) + 0.35;
    this.curve.v0.copy(start);
    this.curve.v1.copy(mid);
    this.curve.v2.copy(target);
    const len = start.distanceTo(target);
    this.phase = (this.phase + (dt * 0.35) / Math.max(len, 0.5)) % 1;
    const p = _p;
    for (let i = 0; i < N; i++) {
      const u = (i / N + this.phase) % 1;
      this.curve.getPoint(u, p);
      const wob = Math.sin(u * 18 + i) * 0.015;
      this.pos.set([p.x + wob, p.y + Math.cos(u * 15 + i) * 0.015, p.z - wob], i * 3);
    }
    this.geo.attributes.position.needsUpdate = true;
    this.mat.size = 0.06 + Math.sin(performance.now() / 300) * 0.008;
  }
}
