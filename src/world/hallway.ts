/**
 * The hallway outside Su's door, the first thing she sees: painted wainscot with raised-panel
 * mouldings, a pair of brass sconces either side of the door, a fairy-light garland arching over
 * it, a runner down the hall and a doormat that says "Về nhà thôi".
 * Lighting here is baked into emissive meshes and soft glow decals, so it adds no real-time light.
 */
import * as THREE from 'three';
import { add, canvasTex, Colliders, M, makeCanvas, RB, rnd } from './kit';
import { photoTexture, Scene } from './photos';
import { swapInDesignerPiece } from './designer-models';
import { DOOR, HALL, RD } from './room';

/** The hall face of the front wall (the wall is 0.2 m thick, room side at z = RD / 2). */
const FRONT = RD / 2 + 0.2;
const CASING = 0.11;

const ROSE = 0xe7c3c2,
  ROSE_LIGHT = 0xf1d5d3,
  CREAM = 0xfaf4ec,
  BRASS = { color: 0xd4b06a, metalness: 0.85, roughness: 0.3, envMapIntensity: 1.2 };

export function buildHallway(root: THREE.Group, col: Colliders): THREE.Mesh[] {
  const g = new THREE.Group();
  root.add(g);
  wainscot(g);
  sconces(g);
  garland(g);
  floor(g);
  gallery(g);
  mirror(g);
  bench(g, col);
  const meshes: THREE.Mesh[] = [];
  g.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh);
  });
  return meshes;
}

/** Dusty-rose panelling to chair-rail height on all four hall walls, plus baseboard and crown. */
function wainscot(parent: THREE.Group) {
  // ~170 boxes but only a handful of distinct sizes: share the geometry per size
  const cache = new Map<string, THREE.BufferGeometry>();
  const rb = (w: number, h: number, d: number, r: number) => {
    const k = `${w.toFixed(3)}|${h.toFixed(3)}|${d}|${r}`;
    let geo = cache.get(k);
    if (!geo) cache.set(k, (geo = RB(w, h, d, r)));
    return geo;
  };
  const H = 0.95;
  const panel = M(ROSE, { roughness: 0.6 });
  const moulding = M(ROSE_LIGHT, { roughness: 0.5 });
  const trim = M(CREAM, { roughness: 0.5 });
  const doorL = DOOR.x - DOOR.w / 2 - CASING,
    doorR = DOOR.x + DOOR.w / 2 + CASING;
  const sideLen = HALL.z1 - FRONT,
    sideZ = (HALL.z1 + FRONT) / 2,
    hw = HALL.x1 - HALL.x0;
  // [x, z, length, rotY]: local +z points into the hall
  const runs: [number, number, number, number][] = [
    [(HALL.x0 + HALL.x1) / 2, HALL.z1, hw, Math.PI],
    [HALL.x0, sideZ, sideLen, Math.PI / 2],
    [HALL.x1, sideZ, sideLen, -Math.PI / 2],
    [(HALL.x0 + doorL) / 2, FRONT, doorL - HALL.x0, 0],
    [(doorR + HALL.x1) / 2, FRONT, HALL.x1 - doorR, 0],
  ];
  for (const [x, z, l, r] of runs) {
    const w = new THREE.Group();
    w.position.set(x, 0, z);
    w.rotation.y = r;
    parent.add(w);
    add(rb(l, H, 0.02, 0.004), panel, [0, H / 2, 0.01], null, w, false);
    // raised-panel frames, evenly spaced along the run
    const n = Math.max(1, Math.round(l / 0.62));
    const pw = l / n;
    for (let i = 0; i < n; i++) {
      const cx = -l / 2 + pw * (i + 0.5);
      const fw = pw - 0.14,
        fh = H - 0.36;
      const cy = 0.16 + fh / 2 + 0.04;
      for (const [dx, dy, sw, sh] of [
        [0, fh / 2, fw, 0.025],
        [0, -fh / 2, fw, 0.025],
        [-fw / 2, 0, 0.025, fh],
        [fw / 2, 0, 0.025, fh],
      ] as const)
        add(rb(sw, sh, 0.016, 0.005), moulding, [cx + dx, cy + dy, 0.026], null, w, false);
    }
    add(rb(l, 0.05, 0.05, 0.012), trim, [0, H, 0.025], null, w, false); // chair rail
    add(rb(l, 0.15, 0.03, 0.008), trim, [0, 0.075, 0.03], null, w, false); // baseboard
    add(rb(l, 0.09, 0.07, 0.015), trim, [0, HALL.h - 0.045, 0.035], null, w, false); // crown
  }
}

/** A soft round glow drawn on the wall: the light pool a lamp would throw, without a light. */
function glowDecal(w: number, h: number, color: string, strength: number) {
  const tex = canvasTex(
    makeCanvas(128, 128, (c, cw, ch) => {
      const gr = c.createRadialGradient(cw / 2, ch / 2, 0, cw / 2, ch / 2, cw / 2);
      gr.addColorStop(0, color);
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = gr;
      c.fillRect(0, 0, cw, ch);
    }),
  );
  return new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: strength,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
}

/** Two brass wall sconces with pleated fabric shades either side of the door. */
function sconces(parent: THREE.Group) {
  const brass = M(BRASS.color, BRASS);
  const shadeMat = new THREE.MeshStandardMaterial({
    color: 0xfff3e6,
    emissive: 0xffd9a8,
    emissiveIntensity: 0.9,
    roughness: 0.9,
    side: THREE.DoubleSide,
  });
  // pleats: a cone whose rim ripples
  const shadeGeo = new THREE.CylinderGeometry(0.075, 0.12, 0.16, 48, 1, true);
  const p = shadeGeo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const a = Math.atan2(p.getZ(i), p.getX(i));
    const k = 1 + Math.cos(a * 24) * 0.035;
    p.setX(i, p.getX(i) * k);
    p.setZ(i, p.getZ(i) * k);
  }
  shadeGeo.computeVertexNormals();
  for (const sx of [-1, 1]) {
    const s = new THREE.Group();
    s.position.set(DOOR.x + sx * (DOOR.w / 2 + 0.42), 1.78, FRONT);
    parent.add(s);
    add(new THREE.CylinderGeometry(0.045, 0.045, 0.015, 32), brass, [0, 0, 0.008], [Math.PI / 2, 0, 0], s);
    add(
      new THREE.CylinderGeometry(0.008, 0.008, 0.14, 12),
      brass,
      [0, 0.04, 0.07],
      [Math.PI / 2 - 0.5, 0, 0],
      s,
    );
    add(new THREE.CylinderGeometry(0.012, 0.018, 0.04, 16), brass, [0, 0.08, 0.13], null, s);
    add(shadeGeo, shadeMat, [0, 0.14, 0.13], null, s, false, false);
    add(new THREE.TorusGeometry(0.12, 0.005, 6, 48), brass, [0, 0.062, 0.13], [Math.PI / 2, 0, 0], s, false);
    const glow = glowDecal(0.9, 1.1, 'rgba(255,214,160,1)', 0.38);
    glow.position.set(0, 0.12, 0.004);
    glow.userData.keep = true;
    s.add(glow);
    void swapInDesignerPiece('scene-wall-sconce', s, 'wall');
  }
}

/** A fairy-light garland of leaves and warm bulbs arching over the door casing. */
function garland(hall: THREE.Group) {
  // vine, leaves, bulbs and hearts share one group so the designer's garland can replace them;
  // the glow decal is added to the hall itself and stays
  const parent = new THREE.Group();
  hall.add(parent);
  const top = DOOR.h + 0.2;
  const half = DOOR.w / 2 + CASING + 0.06;
  const z = FRONT + 0.11; // in front of the casing head cap
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(DOOR.x - half - 0.04, top - 0.5, z),
    new THREE.Vector3(DOOR.x - half + 0.05, top - 0.05, z),
    new THREE.Vector3(DOOR.x - 0.25, top + 0.12, z),
    new THREE.Vector3(DOOR.x + 0.25, top + 0.12, z),
    new THREE.Vector3(DOOR.x + half - 0.05, top - 0.05, z),
    new THREE.Vector3(DOOR.x + half + 0.04, top - 0.5, z),
  ]);
  add(new THREE.TubeGeometry(curve, 80, 0.01, 6), M(0x5e8a52), [0, 0, 0], null, parent, false);
  const leafGeo = new THREE.SphereGeometry(0.03, 10, 8);
  const leaves = [M(0x6f9e6a, { roughness: 0.6 }), M(0x93bb84, { roughness: 0.6 })];
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xfff1d6,
    emissive: 0xffc773,
    emissiveIntensity: 2.2,
  });
  const bulbGeo = new THREE.SphereGeometry(0.016, 12, 8);
  const heartMat = M(0xf2a3b5, { roughness: 0.7, side: THREE.DoubleSide });
  const heartShape = new THREE.Shape();
  heartShape.moveTo(0, -0.03);
  heartShape.bezierCurveTo(-0.05, 0.0, -0.035, 0.04, 0, 0.018);
  heartShape.bezierCurveTo(0.035, 0.04, 0.05, 0.0, 0, -0.03);
  const heartGeo = new THREE.ShapeGeometry(heartShape, 8);
  const stringGeo = new THREE.CylinderGeometry(0.0015, 0.0015, 0.06, 4);
  const stringMat = M(0xd9b28a);
  const pt = new THREE.Vector3();
  for (let i = 0; i <= 70; i++) {
    curve.getPoint(i / 70, pt);
    const l = add(
      leafGeo,
      leaves[i % 2],
      [pt.x + rnd(-0.03, 0.03), pt.y + rnd(-0.03, 0.03), pt.z + rnd(0, 0.02)],
      [rnd(0, Math.PI), rnd(0, Math.PI), rnd(0, Math.PI)],
      parent,
      false,
    );
    l.scale.set(1, 0.45, 0.2);
  }
  for (let i = 0; i <= 20; i++) {
    curve.getPoint(i / 20, pt);
    add(bulbGeo, bulbMat, [pt.x, pt.y - 0.035, pt.z + 0.02], null, parent, false, false);
  }
  for (const u of [0.12, 0.36, 0.64, 0.88]) {
    curve.getPoint(u, pt);
    add(heartGeo, heartMat, [pt.x, pt.y - 0.09, pt.z + 0.015], null, parent, false);
    add(stringGeo, stringMat, [pt.x, pt.y - 0.045, pt.z + 0.015], null, parent, false);
  }
  const glow = glowDecal(2.2, 0.9, 'rgba(255,205,140,1)', 0.22);
  glow.position.set(DOOR.x, top - 0.02, FRONT + 0.004);
  hall.add(glow);
  void swapInDesignerPiece('hall-fairy-garland', parent, 'wall', { shell: true });
}

/** A patterned runner down the hall and a coir doormat in front of the door. */
function floor(parent: THREE.Group) {
  const runnerLen = HALL.z1 - FRONT - 0.5;
  const runner = canvasTex(
    makeCanvas(256, 768, (c, w, h) => {
      c.fillStyle = '#f4e3da';
      c.fillRect(0, 0, w, h);
      c.fillStyle = '#d98f9b';
      c.fillRect(0, 0, w, 14);
      c.fillRect(0, h - 14, w, 14);
      c.fillRect(0, 0, 14, h);
      c.fillRect(w - 14, 0, 14, h);
      c.strokeStyle = '#e8b4bc';
      c.lineWidth = 4;
      c.strokeRect(26, 26, w - 52, h - 52);
      // a lattice of small diamonds
      c.fillStyle = '#e6a6b1';
      for (let y = 60; y < h - 50; y += 48)
        for (let x = 52 + ((y / 48) % 2) * 24; x < w - 40; x += 48) {
          c.beginPath();
          c.moveTo(x, y - 9);
          c.lineTo(x + 9, y);
          c.lineTo(x, y + 9);
          c.lineTo(x - 9, y);
          c.fill();
        }
    }),
  );
  const runnerRug = new THREE.Group();
  parent.add(runnerRug);
  add(
    RB(0.95, 0.01, runnerLen, 0.004),
    M(0xffffff, { map: runner, roughness: 1 }),
    [DOOR.x, 0.006, FRONT + 0.35 + runnerLen / 2],
    null,
    runnerRug,
    false,
    true,
  );
  void swapInDesignerPiece('hall-runner-rug', runnerRug, 'floor', { shell: true });
  const mat = canvasTex(
    makeCanvas(512, 320, (c, w, h) => {
      c.fillStyle = '#b58a5c';
      c.fillRect(0, 0, w, h);
      // coir bristles
      for (let i = 0; i < 9000; i++) {
        c.fillStyle = `rgba(${90 + Math.random() * 60},${60 + Math.random() * 40},${30 + Math.random() * 20},0.35)`;
        c.fillRect(Math.random() * w, Math.random() * h, 1.5, 4);
      }
      c.strokeStyle = '#7a5434';
      c.lineWidth = 10;
      c.strokeRect(14, 14, w - 28, h - 28);
      c.fillStyle = '#6b4329';
      c.textAlign = 'center';
      c.font = '700 70px Charm, cursive';
      c.fillText('Về nhà thôi', w / 2, h / 2 + 18);
      c.font = '44px serif';
      c.fillText('♡', w / 2, h / 2 + 90);
    }),
  );
  add(
    RB(0.9, 0.02, 0.56, 0.008),
    M(0xffffff, { map: mat, roughness: 1 }),
    [DOOR.x, 0.012, FRONT + 0.34],
    null,
    parent,
    false,
    true,
  );
}

/** Three framed photos above the wainscot on the left wall (photo slots: real photos can replace them). */
function gallery(parent: THREE.Group) {
  const frameMat = M(0xf7efe6, { roughness: 0.45 });
  const items: [string, Scene, number, number, number, number][] = [
    // slot, painted scene, z, y, width, height
    ['hall-gallery-1', 'cafe', 6.0, 1.72, 0.42, 0.52],
    ['hall-gallery-2', 'bouquet', 6.75, 1.82, 0.5, 0.38],
    ['hall-gallery-3', 'lanterns', 7.45, 1.7, 0.36, 0.46],
  ];
  for (const [slot, scene, z, y, w, hgt] of items) {
    const f = new THREE.Group();
    f.position.set(HALL.x0 + 0.02, y, z);
    f.rotation.y = Math.PI / 2;
    parent.add(f);
    add(RB(w + 0.08, hgt + 0.08, 0.035, 0.008), frameMat, [0, 0, 0.018], null, f);
    add(
      RB(w + 0.02, hgt + 0.02, 0.004, 0.002),
      M(0xfffdf9, { roughness: 0.9 }),
      [0, 0, 0.037],
      null,
      f,
      false,
    );
    const art = photoTexture(slot, scene, Math.round(w * 640), Math.round(hgt * 640));
    add(
      new THREE.PlaneGeometry(w - 0.06, hgt - 0.06),
      M(0xffffff, { map: art, roughness: 0.6 }),
      [0, 0, 0.04],
      null,
      f,
      false,
    );
  }
}

/** A slim bench under the front wall, right of the door, with a cushion and a folded scarf. */
function bench(parent: THREE.Group, col: Colliders) {
  const x = -0.7,
    z = FRONT + 0.24;
  const b = new THREE.Group();
  b.position.set(x, 0, z);
  parent.add(b);
  const wood = M(0xe2c29c, { roughness: 0.55 });
  add(RB(1.1, 0.05, 0.38, 0.012), wood, [0, 0.44, 0], null, b);
  add(RB(1.06, 0.03, 0.34, 0.008), wood, [0, 0.12, 0], null, b);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) add(RB(0.045, 0.44, 0.045, 0.01), wood, [sx * 0.5, 0.22, sz * 0.15], null, b);
  add(RB(0.9, 0.08, 0.32, 0.035, 4), M(0xf3c3cc, { roughness: 0.95 }), [0, 0.5, 0], null, b);
  add(RB(0.32, 0.05, 0.24, 0.02), M(0xb9d3ee, { roughness: 0.95 }), [0.3, 0.565, 0.01], [0, 0.2, 0], b);
  add(RB(0.36, 0.11, 0.3, 0.02), M(0xf6ece2, { roughness: 0.8 }), [-0.25, 0.185, 0], [0, -0.1, 0], b); // a basket below
  col.box(x, z, 1.15, 0.42);
  void swapInDesignerPiece('scene-hall-bench', b, 'floor');
}

/** An oval mirror in a scalloped blush frame above the console on the right wall. */
function mirror(parent: THREE.Group) {
  const m = new THREE.Group();
  m.position.set(HALL.x1 - 0.02, 1.62, HALL.z1 - 1.0);
  m.rotation.y = -Math.PI / 2;
  parent.add(m);
  const frame = M(0xf1d5d3, { roughness: 0.4 });
  const bead = new THREE.SphereGeometry(0.035, 10, 8);
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    add(bead, frame, [Math.cos(a) * 0.3, Math.sin(a) * 0.4, 0.02], null, m).scale.set(1, 1, 0.5);
  }
  const rim = add(
    new THREE.TorusGeometry(0.3, 0.022, 10, 64),
    M(0xd4b06a, { metalness: 0.85, roughness: 0.3 }),
    [0, 0, 0.03],
    null,
    m,
  );
  rim.scale.y = 4 / 3;
  const glass = add(
    new THREE.CircleGeometry(0.3, 64),
    new THREE.MeshStandardMaterial({ color: 0xe6ecf2, metalness: 1, roughness: 0.06, envMapIntensity: 1.3 }),
    [0, 0, 0.026],
    null,
    m,
    false,
  );
  glass.scale.y = 4 / 3;
  void swapInDesignerPiece('hall-scalloped-mirror', m, 'wall', { shell: true });
}
