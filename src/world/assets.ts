/**
 * Loads the CC0 models and textures listed in public/CREDITS.md, with progress for the loading screen.
 * Models come in very different native scales, so placement fits each one to a real-world size.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

/** Single-file GLB models (none at the moment: every piece now comes from KayKit or is built in code). */
export const MODEL_NAMES = [] as const;
/** KayKit Furniture Bits (CC0): .gltf + .bin sharing one pastel-recoloured palette texture. */
export const KAYKIT_NAMES = [
  'bed_double_A',
  'table_medium_long',
  'chair_A',
  'cabinet_small_decorated',
  'cabinet_medium_decorated',
  'cabinet_medium',
  'cabinet_small',
  'shelf_A_big',
  'armchair',
  'armchair_pillows',
  'rug_oval_A',
  'rug_rectangle_stripes_A',
  'lamp_standing',
  'pictureframe_large_A',
  'pictureframe_medium',
  'pictureframe_standing_A',
  'book_set',
  'cactus_medium_A',
] as const;
export type ModelName = (typeof MODEL_NAMES)[number] | (typeof KAYKIT_NAMES)[number];

export interface Assets {
  models: Record<ModelName, THREE.Group>;
  hdr: THREE.DataTexture;
  floor: { map: THREE.Texture; normal: THREE.Texture; rough: THREE.Texture };
  wall: { map: THREE.Texture; normal: THREE.Texture; rough: THREE.Texture };
  furNormal: THREE.Texture;
}

const base = import.meta.env.BASE_URL;

export async function loadAssets(onProgress: (ratio: number) => void): Promise<Assets> {
  const manager = new THREE.LoadingManager();
  manager.onProgress = (_url, loaded, total) => onProgress(loaded / total);
  const gltf = new GLTFLoader(manager);
  const tl = new THREE.TextureLoader(manager);
  const tex = (name: string, srgb: boolean, repeat: number) => {
    const t = tl.load(`${base}textures/${name}`);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat, repeat);
    t.anisotropy = 8;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  const [hdr, ...groups] = await Promise.all([
    new RGBELoader(manager).loadAsync(`${base}textures/room.hdr`),
    ...MODEL_NAMES.map((n) => gltf.loadAsync(`${base}models/${n}.glb`).then((g) => g.scene)),
    ...KAYKIT_NAMES.map((n) => gltf.loadAsync(`${base}models/kaykit/${n}.gltf`).then((g) => g.scene)),
  ]);
  hdr.mapping = THREE.EquirectangularReflectionMapping;
  const names = [...MODEL_NAMES, ...KAYKIT_NAMES];
  const models = Object.fromEntries(names.map((n, i) => [n, groups[i]])) as Assets['models'];
  return {
    models,
    hdr,
    floor: {
      map: tex('floor_diff.jpg', true, 3),
      normal: tex('floor_nor_gl.jpg', false, 3),
      rough: tex('floor_rough.jpg', false, 3),
    },
    wall: {
      map: tex('wall_diff.jpg', true, 2),
      normal: tex('wall_nor_gl.jpg', false, 2),
      rough: tex('wall_rough.jpg', false, 2),
    },
    furNormal: tex('fur_nor_gl.jpg', false, 2),
  };
}

export interface PlaceOpts {
  pos: [number, number, number];
  rotY?: number;
  /** Fit the largest matching dimension (metres). Exactly one of these is used, in this order. */
  height?: number;
  width?: number;
  depth?: number;
  tint?: THREE.ColorRepresentation;
  parent: THREE.Object3D;
}

/** Clones a model, scales it to a real size, sits it on its base at pos, and returns the wrapper. */
export function place(src: THREE.Group, o: PlaceOpts): THREE.Group {
  const model = src.clone(true);
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const k = o.height ? o.height / size.y : o.width ? o.width / size.x : o.depth ? o.depth / size.z : 1;
  model.scale.multiplyScalar(k);
  const b2 = new THREE.Box3().setFromObject(model);
  const c = b2.getCenter(new THREE.Vector3());
  model.position.sub(new THREE.Vector3(c.x, b2.min.y, c.z));
  const wrap = new THREE.Group();
  wrap.add(model);
  wrap.position.set(...o.pos);
  wrap.rotation.y = o.rotY ?? 0;
  model.traverse((ob) => {
    const m = ob as THREE.Mesh;
    if (m.isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      m.material = mats.map((mt) => {
        const c2 = (mt as THREE.MeshStandardMaterial).clone();
        if ('envMapIntensity' in c2) c2.envMapIntensity = 0.7;
        if ('roughness' in c2) c2.roughness = Math.max(c2.roughness, 0.72); // soft matte, never plasticky
        if (c2.map) c2.map.anisotropy = 8;
        if (o.tint && 'color' in c2) c2.color.lerp(new THREE.Color(o.tint), 0.55);
        return c2;
      }) as unknown as THREE.Material;
      if (Array.isArray(m.material) && m.material.length === 1) m.material = m.material[0];
    }
  });
  o.parent.add(wrap);
  return wrap;
}
