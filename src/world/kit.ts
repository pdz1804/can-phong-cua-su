/** Small shared helpers for building the world: materials, meshes, textures, colliders. */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const rnd = (a: number, b: number) => a + Math.random() * (b - a);

export function M(color: THREE.ColorRepresentation, o: THREE.MeshStandardMaterialParameters = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0, envMapIntensity: 0.6, ...o });
}

export function RB(w: number, h: number, d: number, r = 0.02, s = 3) {
  return new RoundedBoxGeometry(w, h, d, s, r);
}

type V3 = [number, number, number];
export function add(
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  pos: V3,
  rot: V3 | null,
  parent: THREE.Object3D,
  cast = true,
  recv = true,
): THREE.Mesh {
  const me = new THREE.Mesh(geo, mat);
  me.position.set(...pos);
  if (rot) me.rotation.set(...rot);
  me.castShadow = cast;
  me.receiveShadow = recv;
  parent.add(me);
  return me;
}

export function makeCanvas(
  w: number,
  h: number,
  draw: (g: CanvasRenderingContext2D, w: number, h: number) => void,
) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!, w, h);
  return c;
}

export function canvasTex(c: HTMLCanvasElement, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Invisible boxes the player collides with. Furniture registers a footprint, not its render mesh. */
export class Colliders {
  readonly group = new THREE.Group();
  private byKey = new Map<string, THREE.Mesh>();
  private mat = new THREE.MeshBasicMaterial({ visible: false });

  box(cx: number, cz: number, w: number, d: number, key?: string, h = 2.4, rotY = 0) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), this.mat);
    m.position.set(cx, h / 2, cz);
    m.rotation.y = rotY;
    m.updateMatrixWorld();
    this.group.add(m);
    if (key) this.byKey.set(key, m);
    return m;
  }

  remove(key: string) {
    const m = this.byKey.get(key);
    if (m) {
      this.group.remove(m);
      this.byKey.delete(key);
    }
  }
}

/** Something the player can look at and press E / tap on. */
export interface Interactable {
  id: string;
  label: string;
  object: THREE.Object3D;
  kind: 'keepsake' | 'note' | 'door' | 'jar' | 'notebook';
  onUse?: () => void;
}
