/**
 * Inspect in hand: a keepsake floats up in front of the camera, sized to fit, turning slowly; the
 * player can drag to rotate it while its letter is open. Closing flies it back to its spot.
 * Works on a clone so the room never loses the original's place, shadows or colliders.
 */
import * as THREE from 'three';

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class Inspector {
  private pivot: THREE.Group | null = null;
  private source: THREE.Object3D | null = null;
  private from = { pos: new THREE.Vector3(), scale: 1 };
  private to = { pos: new THREE.Vector3(), scale: 1 };
  private t = 0;
  private dir = 1;
  private spin = new THREE.Vector2();
  private settled?: () => void;
  private light = new THREE.PointLight(0xfff0e0, 1.6, 2.5, 2);

  constructor(
    private scene: THREE.Scene,
    private camera: THREE.PerspectiveCamera,
  ) {
    // the light always exists (intensity 0 when idle): adding/removing lights recompiles every material
    this.light.intensity = 0;
    scene.add(this.light);
  }

  get active() {
    return this.pivot !== null;
  }

  /** Lift `obj` toward the camera. `side` shifts it right on wide screens so the letter fits beside it. */
  start(obj: THREE.Object3D, side: number, reduceMotion: boolean) {
    this.end(true);
    const clone = obj.clone(true);
    this.scene.add(clone);
    clone.position.copy(obj.getWorldPosition(new THREE.Vector3()));
    clone.quaternion.copy(obj.getWorldQuaternion(new THREE.Quaternion()));
    clone.scale.copy(obj.getWorldScale(new THREE.Vector3()));
    clone.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(clone);
    const centre = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const pivot = new THREE.Group();
    pivot.position.copy(centre);
    this.scene.add(pivot);
    pivot.attach(clone); // keeps the world transform, so the clone now spins around its own centre
    clone.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = false;
        o.renderOrder = 2;
      }
    });
    obj.visible = false;
    this.source = obj;
    this.pivot = pivot;
    const fwd = this.camera.getWorldDirection(new THREE.Vector3());
    const right = new THREE.Vector3().crossVectors(fwd, this.camera.up).normalize();
    this.from = { pos: centre.clone(), scale: 1 };
    this.to = {
      pos: this.camera.position
        .clone()
        .addScaledVector(fwd, 0.62)
        .addScaledVector(right, side)
        .addScaledVector(this.camera.up, side ? 0 : 0.12),
      scale: THREE.MathUtils.clamp(0.3 / Math.max(size.x, size.y, size.z, 0.01), 0.4, 8),
    };
    this.light.position
      .copy(this.to.pos)
      .addScaledVector(fwd, -0.35)
      .add(new THREE.Vector3(0.2, 0.3, 0));
    this.light.intensity = 1.6;
    this.t = reduceMotion ? 1 : 0;
    this.dir = 1;
    this.spin.set(0, 0);
  }

  /** Rotate with a drag (pixels). */
  drag(dx: number, dy: number) {
    this.spin.x += dy * 0.01;
    this.spin.y += dx * 0.01;
  }

  /** Fly back; resolves once the original is visible again. `instant` skips the animation. */
  end(instant = false): Promise<void> {
    if (!this.pivot) return Promise.resolve();
    if (instant) {
      this.finish();
      return Promise.resolve();
    }
    this.dir = -1;
    return new Promise((r) => (this.settled = r));
  }

  private finish() {
    if (this.pivot) this.scene.remove(this.pivot);
    this.light.intensity = 0;
    if (this.source) this.source.visible = true;
    this.pivot = null;
    this.source = null;
    const s = this.settled;
    this.settled = undefined;
    s?.();
  }

  update(dt: number) {
    if (!this.pivot) return;
    this.t = THREE.MathUtils.clamp(this.t + (dt / 0.75) * this.dir, 0, 1);
    const k = ease(this.t);
    this.pivot.position.lerpVectors(this.from.pos, this.to.pos, k);
    this.pivot.scale.setScalar(THREE.MathUtils.lerp(this.from.scale, this.to.scale, k));
    if (this.dir > 0) this.spin.y += dt * 0.35; // a slow idle turn while she reads
    this.pivot.rotation.set(this.spin.x * k, this.spin.y * k, 0);
    if (this.dir < 0 && this.t <= 0) this.finish();
  }
}
