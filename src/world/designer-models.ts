/**
 * Drop-in slot for the designer's hand-made keepsake models.
 *
 * Each keepsake is first built in code (keepsakes.ts). When its .glb is listed in
 * public/models/designer/manifest.json, the model loads in the background and replaces the
 * code-built version inside the same group, so the keepsake id, its letter and its placement
 * stay the same. A missing manifest, an unlisted file or a failed load keep the code version.
 *
 * Model contract (see the 3D asset brief): glTF 2.0 binary, metres, Y up, front facing +Z,
 * origin at the bottom-centre (back-centre for wall items), no lights or cameras.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/** Keepsake id → designer file name (without .glb), as listed in the asset brief. */
export const DESIGNER_FILES: Record<string, string> = {
  stitch: 'keepsake-stitch',
  pajamaBear: 'keepsake-pajama-bear',
  kitty: 'keepsake-hello-kitty',
  bubu: 'keepsake-bubu-dudu',
  roses: 'keepsake-ecuador-roses',
  lanterns: 'keepsake-two-lanterns',
  camera: 'keepsake-film-camera',
  gongcha: 'keepsake-taro-milk-tea',
  lily: 'keepsake-white-lily',
  album: 'keepsake-photobooth-album',
  heartBox: 'keepsake-heart-mirror-box',
  phin: 'keepsake-phin-keychain',
  chalk: 'keepsake-chalk',
  cactus: 'keepsake-cactus',
  tenOClock: 'keepsake-ten-oclock-flower',
  jacket: 'keepsake-jacket',
  hydrangea: 'keepsake-blue-hydrangea',
  bear: 'keepsake-sale-bear',
  chickenPlush: 'keepsake-fried-chicken-plush',
  mic: 'keepsake-mc-mic',
  perfume: 'keepsake-perfume',
  giftBox: 'keepsake-blue-gift-box',
  raincoats: 'keepsake-raincoats',
  certificate: 'keepsake-mc-certificate',
  shellCar: 'keepsake-shell-car',
  maskToy: 'keepsake-mask-toy',
  controller: 'keepsake-game-controller',
  bubbles: 'keepsake-bubble-wand',
  guava: 'keepsake-guava',
  banhTrang: 'keepsake-rice-paper-jar',
  kfc: 'keepsake-chicken-bucket',
  yarn: 'keepsake-yarn-basket',
  pizza: 'keepsake-pizza-box',
  radio: 'keepsake-radio',
  flowerShop: 'keepsake-flower-shop',
  notebook: 'keepsake-notebook',
};

const base = import.meta.env.BASE_URL;
let listed: Promise<Set<string>> | null = null;

/** The designer files that have been accepted into the app (an empty set when there is no manifest). */
function manifest(): Promise<Set<string>> {
  listed ??= fetch(`${base}models/designer/manifest.json`)
    .then((r) => (r.ok ? (r.json() as Promise<unknown>) : []))
    .then((v) => new Set(Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []))
    .catch(() => new Set<string>());
  return listed;
}

const loader = new GLTFLoader();

/**
 * How a room piece is lined up with the code-built one it replaces (in the group's own space):
 * floor = same bottom and centre; wall = same back face and centre; hang = same top and centre.
 */
export type Fit = 'floor' | 'wall' | 'hang';

/**
 * Replace the code-built meshes of a room piece with the designer's model, if it is listed.
 * Lights and anything marked `userData.keep` (glow decals) stay. The model is sized by the brief
 * and lined up with the old piece's bounding box, so a pivot that is slightly off cannot float it.
 */
export async function swapInDesignerPiece(
  file: string,
  group: THREE.Group,
  fit: Fit,
  opts: { rotY?: number; scale?: number } = {},
): Promise<boolean> {
  if (!(await manifest()).has(file)) return false;
  try {
    const model = (await loader.loadAsync(`${base}models/designer/${file}.glb`)).scene;
    model.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) o.castShadow = o.receiveShadow = true;
    });
    const old = group.children.filter((c) => !(c as THREE.Light).isLight && !c.userData.keep);
    const was = new THREE.Box3();
    for (const c of old) was.union(new THREE.Box3().setFromObject(c, true));
    // both boxes in the group's own space
    group.updateWorldMatrix(true, false);
    const inv = group.matrixWorld.clone().invert();
    was.applyMatrix4(inv);
    model.rotation.y = opts.rotY ?? 0;
    model.scale.setScalar(opts.scale ?? 1);
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model, true);
    const c = was.getCenter(new THREE.Vector3()),
      m = box.getCenter(new THREE.Vector3());
    model.position.set(c.x - m.x, c.y - m.y, c.z - m.z);
    if (fit === 'floor') model.position.y = was.min.y - box.min.y;
    if (fit === 'hang') model.position.y = was.max.y - box.max.y;
    if (fit === 'wall') model.position.z = was.min.z - box.min.z;
    for (const o of old) group.remove(o);
    group.add(model);
    return true;
  } catch {
    return false; // keep the code-built piece
  }
}

/** Replace the code-built keepsake in `group` with the designer's model, if one is listed. */
export async function swapInDesignerModel(id: string, group: THREE.Group): Promise<boolean> {
  const file = DESIGNER_FILES[id];
  if (!file || !(await manifest()).has(file)) return false;
  try {
    const gltf = await loader.loadAsync(`${base}models/designer/${file}.glb`);
    const model = gltf.scene;
    model.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) o.castShadow = o.receiveShadow = true;
    });
    // the group is scaled for the code-built version's proportions; the model is already true size
    const s = group.scale.x || 1;
    model.scale.setScalar(1 / s);
    // designer models already rest in their natural pose: keep the group's turn, drop any tilt
    // the code-built version needed (the fried-chicken plush was laid on its side)
    group.rotation.x = group.rotation.z = 0;
    group.clear();
    group.add(model);
    return true;
  } catch {
    return false; // keep the code-built keepsake
  }
}
