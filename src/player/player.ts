/**
 * First-person player: capsule collision against an Octree of simple collider boxes
 * (pattern from three.js examples/games_fps), pointer-lock mouse look + WASD on desktop,
 * left-thumb joystick + right-side drag-look on touch screens.
 */
import * as THREE from 'three';
import { Octree } from 'three/addons/math/Octree.js';
import { Capsule } from 'three/addons/math/Capsule.js';
import { clampPitch, joystickToInput, keysToInput, MoveInput, velocityFor } from './movement';

export const EYE = 1.6;
const RADIUS = 0.28;

export class Player {
  yaw = 0;
  pitch = 0;
  sensitivity = 1;
  enabled = false;
  readonly capsule = new Capsule(new THREE.Vector3(0, RADIUS, 0), new THREE.Vector3(0, EYE - 0.1, 0), RADIUS);
  private octree = new Octree();
  private keys = new Set<string>();
  private joy: MoveInput = { forward: 0, strafe: 0, slow: false };
  private bob = 0;
  stepDistance = 0;
  onStep?: () => void;

  constructor(
    private camera: THREE.PerspectiveCamera,
    private canvas: HTMLCanvasElement,
  ) {
    addEventListener('keydown', (e) => {
      if (!(e.target instanceof HTMLInputElement)) this.keys.add(e.code);
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());
    document.addEventListener('mousemove', (e) => {
      if (!this.enabled || document.pointerLockElement !== this.canvas) return;
      this.look(e.movementX, e.movementY, 0.0022);
    });
  }

  get isTouch() {
    return matchMedia('(pointer: coarse)').matches;
  }

  setColliders(group: THREE.Object3D) {
    this.octree = new Octree();
    this.octree.fromGraphNode(group);
  }

  teleport(x: number, z: number, yaw: number, pitch = 0) {
    this.capsule.start.set(x, RADIUS, z);
    this.capsule.end.set(x, EYE - 0.1, z);
    this.yaw = yaw;
    this.pitch = pitch;
    this.syncCamera();
  }

  look(dx: number, dy: number, k: number) {
    this.yaw += dx * k * this.sensitivity;
    this.pitch = clampPitch(this.pitch - dy * k * this.sensitivity);
  }

  setJoystick(input: MoveInput) {
    this.joy = input;
  }

  joystickFrom(dx: number, dy: number, r: number) {
    this.joy = joystickToInput(dx, dy, r);
  }

  releaseKeys() {
    this.keys.clear();
    this.joy = { forward: 0, strafe: 0, slow: false };
  }

  update(dt: number) {
    if (this.enabled) {
      const k = keysToInput(this.keys);
      const input = Math.abs(this.joy.forward) + Math.abs(this.joy.strafe) > 0 ? this.joy : k;
      const v = velocityFor(input, this.yaw);
      const move = new THREE.Vector3(v.x * dt, 0, v.z * dt);
      this.capsule.translate(move);
      for (let i = 0; i < 3; i++) {
        const hit = this.octree.capsuleIntersect(this.capsule);
        if (!hit) break;
        hit.normal.y = 0;
        if (hit.normal.lengthSq() < 1e-6) break;
        this.capsule.translate(hit.normal.normalize().multiplyScalar(hit.depth));
      }
      const speed = Math.hypot(v.x, v.z);
      if (speed > 0.1) {
        this.bob += dt * speed * 3.2;
        this.stepDistance += speed * dt;
        if (this.stepDistance > 0.75) {
          this.stepDistance = 0;
          this.onStep?.();
        }
      } else this.bob *= 0.9;
    }
    this.syncCamera();
  }

  private syncCamera() {
    const e = this.capsule.end;
    this.camera.position.set(e.x, e.y + 0.1 + Math.sin(this.bob) * 0.018, e.z);
    const cp = Math.cos(this.pitch);
    this.camera.lookAt(
      e.x + Math.sin(this.yaw) * cp,
      e.y + 0.1 + Math.sin(this.pitch),
      e.z - Math.cos(this.yaw) * cp,
    );
  }

  get position() {
    return this.capsule.end;
  }
}
