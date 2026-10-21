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
  // revalidate every visit: a phone that cached an older (shorter) list would miss new models
  listed ??= fetch(`${base}models/designer/manifest.json`, { cache: 'no-cache' })
    .then((r) => (r.ok ? (r.json() as Promise<unknown>) : []))
    .then((v) => new Set(Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []))
    .catch(() => new Set<string>());
  return listed;
}

const loader = new GLTFLoader();

/** What each room-piece swap measured and applied, for the QA hook. */
export const swapLog: { file: string; was: number[]; scale: number[] }[] = [];

/**
 * Free-standing pieces nothing rests on: they keep their own proportions inside the old box.
 * Everything else is stretched to the old box, so beds, desks and shelves keep the surfaces
 * keepsakes stand on and doors and frames fill their openings.
 */
const KEEP_SHAPE = new Set([
  'room-armchair',
  'room-desk-chair',
  'room-beanbag',
  'room-floor-cushion',
  'room-floor-cactus',
  'room-leafy-plant',
  'room-standing-lamp',
  'room-desk-lamp',
  'scene-umbrella-stand',
  'scene-paper-lantern',
  'scene-wall-sconce',
  'scene-sala-flower',
  'scene-couple',
]);

const ratio = (want: number, have: number) => (have > 1e-6 && want > 1e-6 ? want / have : 1);

/** Bounding box of `parts` in `group`'s own space. */
function localBox(group: THREE.Object3D, parts: THREE.Object3D[]): THREE.Box3 {
  const box = new THREE.Box3();
  for (const c of parts) box.union(new THREE.Box3().setFromObject(c, true));
  group.updateWorldMatrix(true, false);
  return box.applyMatrix4(group.matrixWorld.clone().invert());
}

/** Move `holder` (a direct child, not yet added) so its box lines up with `was` as `fit` says. */
function placeIn(holder: THREE.Object3D, was: THREE.Box3, fit: Fit) {
  holder.position.set(0, 0, 0);
  holder.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(holder, true);
  const c = was.getCenter(new THREE.Vector3()),
    m = box.getCenter(new THREE.Vector3());
  holder.position.set(c.x - m.x, c.y - m.y, c.z - m.z);
  if (fit === 'floor') holder.position.y = was.min.y - box.min.y;
  if (fit === 'hang') holder.position.y = was.max.y - box.max.y;
  if (fit === 'wall') holder.position.z = was.min.z - box.min.z;
}

/** Designer models that stand in for a piece of the building shell: the finale fades them with the walls. */
export const shellModels: THREE.Object3D[] = [];

let swaps = 0;
/** How many designer models have replaced code-built pieces so far: lets pickers rebuild their mesh lists. */
export const designerSwaps = () => swaps;

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
  opts: { rotY?: number; scale?: number; shell?: boolean } = {},
): Promise<boolean> {
  if (!(await manifest()).has(file)) return false;
  try {
    const model = (await loader.loadAsync(`${base}models/designer/${file}.glb`)).scene;
    model.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) o.castShadow = o.receiveShadow = true;
    });
    const old = group.children.filter((c) => !(c as THREE.Light).isLight && !c.userData.keep);
    const was = localBox(group, old);
    model.rotation.y = opts.rotY ?? 0;
    // generated models come at an arbitrary size: stretch the turned model to the old piece's box,
    // so tops stay where keepsakes rest and footprints keep clear of the walls
    const holder = new THREE.Group();
    holder.add(model);
    holder.updateMatrixWorld(true);
    const ws = was.getSize(new THREE.Vector3());
    // a flat slot (a rug) gets the model's thinnest side turned up, however the generator stood it
    const flat = ws.y < 0.15 * Math.min(ws.x, ws.z);
    let bs = new THREE.Box3().setFromObject(holder, true).getSize(new THREE.Vector3());
    if (flat && bs.y > Math.min(bs.x, bs.z)) {
      if (bs.x < bs.z) model.rotation.z = Math.PI / 2;
      else model.rotation.x = Math.PI / 2;
      holder.updateMatrixWorld(true);
      bs = new THREE.Box3().setFromObject(holder, true).getSize(new THREE.Vector3());
    }
    if (opts.scale) holder.scale.setScalar(opts.scale);
    else if (KEEP_SHAPE.has(file)) {
      // keeps its own proportions and fits inside the old piece's box, never bigger than it was
      holder.scale.setScalar(Math.min(ratio(ws.x, bs.x), ratio(ws.y, bs.y), ratio(ws.z, bs.z)));
    } else holder.scale.set(ratio(ws.x, bs.x), ratio(ws.y, bs.y), ratio(ws.z, bs.z));
    placeIn(holder, was, fit);
    swapLog.push({
      file,
      was: ws.toArray().map((v) => +v.toFixed(2)),
      scale: holder.scale.toArray().map((v) => +v.toFixed(2)),
    });
    for (const o of old) group.remove(o);
    group.add(holder);
    if (opts.shell) shellModels.push(holder);
    swaps++;
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
    // generated models come at an arbitrary size: match the code-built keepsake's largest side,
    // keeping the model's own proportions, and rest it where the old one rested
    const was = localBox(group, group.children);
    const holder = new THREE.Group();
    holder.add(model);
    holder.updateMatrixWorld(true);
    const bs = new THREE.Box3().setFromObject(holder, true).getSize(new THREE.Vector3());
    const ws = was.getSize(new THREE.Vector3());
    holder.scale.setScalar(ratio(Math.max(ws.x, ws.y, ws.z), Math.max(bs.x, bs.y, bs.z)));
    placeIn(holder, was, 'floor');
    // designer models already rest in their natural pose: keep the group's turn, drop any tilt
    // the code-built version needed (the fried-chicken plush was laid on its side)
    group.rotation.x = group.rotation.z = 0;
    group.clear();
    group.add(holder);
    swaps++;
    return true;
  } catch {
    return false; // keep the code-built keepsake
  }
}
