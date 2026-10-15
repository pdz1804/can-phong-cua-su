/**
 * Furniture and decor from the CC0 packs (Kenney Furniture Kit, Quaternius via Poly Pizza),
 * placed at real sizes, plus their collision footprints. Bespoke keepsakes live in keepsakes.ts.
 */
import * as THREE from 'three';
import { Assets, ModelName, place } from './assets';
import { add, Colliders, M, RB, rnd } from './kit';
import { HALL, RD, RH, RW, WIN } from './room';
import { photoTexture, Scene } from './photos';

const POLAROID_SCENES: Scene[] = ['photobooth', 'umbrella', 'bouquet', 'sala', 'cafe', 'lily', 'lanterns'];

export interface Furniture {
  anchors: Record<string, THREE.Object3D>;
  fan: THREE.Object3D;
  bulbs: THREE.Mesh[];
  stars: THREE.Object3D[];
  lampWorld: THREE.Vector3;
}

export function buildFurniture(root: THREE.Group, a: Assets, col: Colliders): Furniture {
  const m = a.models;
  const anchors: Record<string, THREE.Object3D> = {};
  const P = (name: keyof Assets['models'], o: Omit<Parameters<typeof place>[1], 'parent'>) =>
    place(m[name], { ...o, parent: root });

  // ---- back wall: writing desk under the window, chair
  anchors.desk = P('table_medium_long', { pos: [WIN.x, 0, -RD / 2 + 0.42], width: 1.6 });
  col.box(WIN.x, -RD / 2 + 0.42, 1.65, 0.8);
  anchors.chair = P('chair_A', { pos: [WIN.x - 0.2, 0, -RD / 2 + 1.15], height: 0.92, rotY: Math.PI + 0.3 });
  col.box(WIN.x - 0.2, -RD / 2 + 1.15, 0.5, 0.5);

  // ---- right wall: bed (headboard against the wall), nightstand, wardrobe
  anchors.bed = P('bed_double_A', { pos: [RW / 2 - 1.1, 0, 0.7], depth: 2.1, rotY: -Math.PI / 2 });
  col.box(RW / 2 - 1.1, 0.7, 2.1, 1.7);
  P('rug_rectangle_stripes_A', { pos: [RW / 2 - 2.5, 0.004, 0.7], width: 1.6, rotY: Math.PI / 2 });
  anchors.nightstand = P('cabinet_small_decorated', {
    pos: [RW / 2 - 0.3, 0, -0.75],
    height: 0.58,
    rotY: -Math.PI / 2,
  });
  col.box(RW / 2 - 0.3, -0.75, 0.5, 0.5);
  P('cabinet_medium', { pos: [RW / 2 - 0.3, 0, 3.5], width: 1.2, rotY: -Math.PI / 2 });
  col.box(RW / 2 - 0.3, 3.5, 0.6, 1.25);

  // ---- front wall: dresser + round mirror
  anchors.dresser = P('cabinet_medium_decorated', { pos: [1.6, 0, RD / 2 - 0.3], width: 1.3, rotY: Math.PI });
  col.box(1.6, RD / 2 - 0.3, 1.35, 0.6);
  {
    const mg = new THREE.Group();
    mg.position.set(1.6, 1.62, RD / 2 - 0.03);
    mg.rotation.y = Math.PI;
    root.add(mg);
    const rim = add(
      new THREE.TorusGeometry(0.4, 0.035, 16, 72),
      M(0xf2c3cc, { roughness: 0.45 }),
      [0, 0, 0],
      null,
      mg,
    );
    rim.scale.y = 1.25;
    const glass = add(
      new THREE.CircleGeometry(0.4, 64),
      new THREE.MeshStandardMaterial({
        color: 0xdfe6f0,
        metalness: 1,
        roughness: 0.05,
        envMapIntensity: 1.3,
      }),
      [0, 0, -0.004],
      null,
      mg,
      false,
    );
    glass.scale.y = 1.25;
  }

  // ---- left wall: bookshelf, reading corner (armchair + floor lamp), coat pegs, wall shelf
  anchors.bookcase = P('shelf_B_large_decorated', {
    pos: [-RW / 2 + 0.25, 0, 3.4],
    width: 1.1,
    rotY: Math.PI / 2,
  });
  col.box(-RW / 2 + 0.25, 3.4, 0.5, 1.1);
  anchors.lounge = P('armchair', { pos: [-3.7, 0, -2.7], height: 0.9, rotY: Math.PI / 4 });
  P('armchair_pillows', { pos: [-3.7, 0, -2.7], height: 0.9, rotY: Math.PI / 4 });
  col.box(-3.7, -2.7, 0.95, 0.95, undefined, 2.4, Math.PI / 4);
  P('lamp_standing', { pos: [-4.5, 0, -3.6], height: 1.65 });
  col.box(-4.5, -3.6, 0.35, 0.35);
  // wooden peg rail for the raincoats
  {
    const rail = new THREE.Group();
    rail.position.set(-RW / 2 + 0.02, 1.62, 1.9);
    rail.rotation.y = Math.PI / 2;
    root.add(rail);
    add(RB(0.9, 0.09, 0.025, 0.01), M(0xe6c9a3, { roughness: 0.6 }), [0, 0, 0], null, rail);
    for (const x of [-0.3, -0.1, 0.1, 0.3])
      add(
        new THREE.CapsuleGeometry(0.014, 0.05, 4, 10),
        M(0xc9a27c, { roughness: 0.5 }),
        [x, 0, 0.04],
        [Math.PI / 2, 0, 0],
        rail,
      );
    anchors.coatRack = rail;
  }
  const shelf = new THREE.Group();
  shelf.position.set(-RW / 2 + 0.15, 1.55, -0.9);
  root.add(shelf);
  add(RB(0.28, 0.035, 1.6, 0.01), M(0xe6c9a3, { roughness: 0.6 }), [0, 0, 0], null, shelf);
  anchors.shelf = shelf;
  // low cabinet for the fish tank
  const cab = new THREE.Group();
  cab.position.set(-RW / 2 + 0.3, 0, 0.6);
  root.add(cab);
  add(RB(0.5, 0.72, 1.2, 0.03), M(0xfbf3ec, { roughness: 0.55 }), [0, 0.36, 0], null, cab);
  for (const z of [-0.3, 0.3]) {
    add(RB(0.012, 0.58, 0.5, 0.004), M(0xf3e6da, { roughness: 0.55 }), [0.255, 0.38, z], null, cab);
    add(
      new THREE.SphereGeometry(0.02, 12, 8),
      M(0xe6c9a3, { roughness: 0.4 }),
      [0.27, 0.5, z * 0.4],
      null,
      cab,
    );
  }
  col.box(-RW / 2 + 0.3, 0.6, 0.55, 1.25);
  anchors.cabinet = cab;

  // ---- centre: rug, low coffee table, floor cushions, beanbag, paper pendant lamp
  P('rug_oval_A', { pos: [0.2, 0.004, 0.6], width: 3.0 });
  // round wooden coffee table, soft-edged (KayKit's low table reads as a dome from standing height)
  {
    const t = new THREE.Group();
    t.position.set(0.2, 0, 0.6);
    root.add(t);
    const wood = M(0xe9c79f, { roughness: 0.55 });
    add(new THREE.CylinderGeometry(0.5, 0.5, 0.045, 64), wood, [0, 0.4, 0], null, t);
    add(new THREE.TorusGeometry(0.5, 0.022, 12, 64), wood, [0, 0.4, 0], [Math.PI / 2, 0, 0], t);
    for (let k = 0; k < 3; k++) {
      const a2 = (k / 3) * Math.PI * 2;
      add(
        new THREE.CylinderGeometry(0.028, 0.02, 0.4, 16),
        M(0xd9b48a, { roughness: 0.55 }),
        [Math.cos(a2) * 0.33, 0.2, Math.sin(a2) * 0.33],
        [Math.sin(a2) * 0.12, 0, -Math.cos(a2) * 0.12],
        t,
      );
    }
    anchors.table = t;
  }
  col.box(0.2, 0.6, 0.9, 0.7);
  // two plump floor cushions, pink and baby blue
  for (const [x, z, c] of [
    [-0.75, 0.75, 0xf2b8c4],
    [1.15, 0.9, 0xb9d3ee],
  ] as const) {
    const cu = add(
      RB(0.6, 0.16, 0.6, 0.075, 5),
      M(c, { roughness: 0.95, normalMap: a.furNormal }),
      [x, 0.08, z],
      [0, 0.4, 0],
      root,
    );
    cu.scale.y = 0.9;
    add(new THREE.SphereGeometry(0.018, 10, 8), M(0xfffaf2), [x, 0.165, z], null, root, false);
  }
  {
    const g = new THREE.SphereGeometry(0.45, 40, 30);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let y = p.getY(i);
      if (y < -0.15) y = -0.15 + (y + 0.15) * 0.2;
      p.setY(i, y * 0.75 + Math.sin(p.getX(i) * 8) * 0.01);
    }
    g.computeVertexNormals();
    add(g, M(0xf3b3c0, { roughness: 0.95, normalMap: a.furNormal }), [-1.9, 0.2, 2.0], null, root);
    col.box(-1.9, 2.0, 0.8, 0.8);
  }
  // paper lantern pendant: a soft glowing globe on a cord (sways gently, see main.ts)
  const fan = new THREE.Group();
  fan.position.set(0.2, RH, 0.6);
  root.add(fan);
  add(new THREE.CylinderGeometry(0.004, 0.004, 0.7, 6), M(0xf3e6da), [0, -0.35, 0], null, fan, false, false);
  {
    const shade = add(
      new THREE.SphereGeometry(0.24, 40, 24),
      new THREE.MeshStandardMaterial({
        color: 0xfffaf2,
        emissive: 0xffe2b8,
        emissiveIntensity: 0.7,
        roughness: 0.9,
      }),
      [0, -0.92, 0],
      null,
      fan,
      false,
      false,
    );
    for (let k = 1; k < 7; k++)
      add(
        new THREE.TorusGeometry(0.24 * Math.sin((k / 7) * Math.PI), 0.0025, 4, 48),
        M(0xf0e2d0),
        [0, -0.92 + 0.24 * Math.cos((k / 7) * Math.PI), 0],
        [Math.PI / 2, 0, 0],
        fan,
        false,
        false,
      );
    const pl = new THREE.PointLight(0xffe2b8, 1.4, 6, 1.7);
    pl.position.copy(shade.position);
    fan.add(pl);
  }

  // ---- plants: a big leafy pot + a KayKit cactus, books on the bookshelf
  leafyPlant(root, -RW / 2 + 0.5, -RD / 2 + 0.5, 1.25);
  col.box(-RW / 2 + 0.5, -RD / 2 + 0.5, 0.5, 0.5);
  P('cactus_medium_A', { pos: [RW / 2 - 0.45, 0, -RD / 2 + 0.45], height: 0.9 });
  col.box(RW / 2 - 0.45, -RD / 2 + 0.45, 0.45, 0.45);

  // ---- framed pictures (photo slots) on the right and front walls
  const frames: [ModelName, number, number, number, number, number, string, Scene][] = [
    ['pictureframe_large_A', RW / 2 - 0.02, 1.85, 2.25, -Math.PI / 2, 0.7, 'frame-right', 'sunset'],
    ['pictureframe_medium', -0.4, 1.75, RD / 2 - 0.02, Math.PI, 0.45, 'frame-front', 'cafe'],
  ];
  for (const [name, x, y, z, ry, w, slot, scene] of frames) {
    const fr = P(name, { pos: [x, y, z], width: w, rotY: ry });
    const fb = new THREE.Box3().setFromObject(fr);
    const size = fb.getSize(new THREE.Vector3());
    const pic = new THREE.Mesh(
      new THREE.PlaneGeometry(Math.max(size.x, size.z) * 0.72, size.y * 0.72),
      M(0xffffff, { map: photoTexture(slot, scene), roughness: 0.5 }),
    );
    const c = fb.getCenter(new THREE.Vector3());
    const toRoom = new THREE.Vector3(-c.x, 0, -c.z).normalize();
    // face the room: the frame hangs on a wall, so step out from the wall by half its depth
    const axis =
      Math.abs(toRoom.x) > Math.abs(toRoom.z)
        ? new THREE.Vector3(Math.sign(toRoom.x), 0, 0)
        : new THREE.Vector3(0, 0, Math.sign(toRoom.z));
    pic.position.copy(c).addScaledVector(axis, Math.min(size.x, size.z) / 2 + 0.006);
    pic.lookAt(pic.position.clone().add(axis));
    root.add(pic);
  }

  // ---- hallway: doormat, wall sconce, plant
  add(
    RB(1.0, 0.012, 0.6, 0.006),
    M(0xd9b28a, { roughness: 1, normalMap: a.furNormal }),
    [-2.6, 0.006, RD / 2 + 0.6],
    null,
    root,
    false,
    true,
  );
  {
    const sc = new THREE.Group();
    sc.position.set(HALL.x0 + 0.02, 1.95, RD / 2 + 1.4);
    sc.rotation.y = Math.PI / 2;
    root.add(sc);
    add(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 24), M(0xe6c9a3), [0, 0, 0.01], [Math.PI / 2, 0, 0], sc);
    add(
      new THREE.SphereGeometry(0.11, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.6),
      new THREE.MeshStandardMaterial({
        color: 0xfffaf2,
        emissive: 0xffe2b8,
        emissiveIntensity: 1.1,
        side: THREE.DoubleSide,
      }),
      [0, 0, 0.12],
      [Math.PI, 0, 0],
      sc,
      false,
      false,
    );
  }
  leafyPlant(root, HALL.x1 - 0.4, HALL.z1 - 0.45, 1.0);
  col.box(HALL.x1 - 0.4, HALL.z1 - 0.45, 0.5, 0.5);

  // ---- hallway dressing: console with lilies + a standing photo, umbrella stand, shoes, ceiling light
  {
    const consoleZ = HALL.z1 - 1.0;
    const con = P('cabinet_small', { pos: [HALL.x1 - 0.28, 0, consoleZ], width: 0.9, rotY: -Math.PI / 2 });
    col.box(HALL.x1 - 0.28, consoleZ, 0.5, 0.95);
    const top = new THREE.Box3().setFromObject(con).max.y;
    const sf = P('pictureframe_standing_A', {
      pos: [HALL.x1 - 0.3, top, consoleZ + 0.22],
      height: 0.26,
      rotY: -Math.PI / 2,
    });
    const fb = new THREE.Box3().setFromObject(sf);
    const pic = new THREE.Mesh(
      new THREE.PlaneGeometry(0.14, 0.18),
      M(0xffffff, { map: photoTexture('hall-frame', 'umbrella', 224, 288), roughness: 0.5 }),
    );
    pic.position.copy(fb.getCenter(new THREE.Vector3())).add(new THREE.Vector3(-0.03, 0.01, 0));
    pic.rotation.y = -Math.PI / 2;
    root.add(pic);
    // vase of white lilies
    const vase = new THREE.Group();
    vase.position.set(HALL.x1 - 0.3, top, consoleZ - 0.2);
    root.add(vase);
    add(
      new THREE.CylinderGeometry(0.06, 0.05, 0.24, 24),
      M(0xf2b8c4, { roughness: 0.35 }),
      [0, 0.12, 0],
      null,
      vase,
    );
    for (let k = 0; k < 3; k++) {
      const st = new THREE.Group();
      st.position.set(0, 0.22, 0);
      st.rotation.set(rnd(-0.35, 0.35), k * 2.1, rnd(-0.35, 0.35));
      vase.add(st);
      add(new THREE.CylinderGeometry(0.004, 0.004, 0.24, 6), M(0x5e8a52), [0, 0.12, 0], null, st);
      for (let p = 0; p < 6; p++) {
        const a2 = (p / 6) * Math.PI * 2;
        const pt = add(
          new THREE.SphereGeometry(0.035, 12, 8),
          M(0xfffcf6, { roughness: 0.45 }),
          [Math.cos(a2) * 0.025, 0.25, Math.sin(a2) * 0.025],
          null,
          st,
        );
        pt.scale.set(0.35, 1, 0.12);
        pt.rotation.set(Math.sin(a2) * 0.9, 0, -Math.cos(a2) * 0.9);
      }
    }
    // umbrella stand: a red and a blue umbrella, like the raincoats on 13.09
    const us = new THREE.Group();
    us.position.set(HALL.x0 + 0.3, 0, RD / 2 + 0.6);
    root.add(us);
    add(
      new THREE.CylinderGeometry(0.13, 0.11, 0.45, 28, 1, true),
      M(0xe6c9a3, { roughness: 0.6, side: THREE.DoubleSide }),
      [0, 0.225, 0],
      null,
      us,
    );
    col.box(HALL.x0 + 0.3, RD / 2 + 0.6, 0.3, 0.3);
    const umbrellas: [number, number][] = [
      [0xe24a4a, 0.12],
      [0x4a7fd6, -0.15],
    ];
    for (const [c, tilt] of umbrellas) {
      const u = new THREE.Group();
      u.position.set(tilt * 0.4, 0.05, 0);
      u.rotation.z = tilt;
      us.add(u);
      add(new THREE.CylinderGeometry(0.006, 0.006, 0.8, 8), M(0x5a4030), [0, 0.4, 0], null, u);
      add(new THREE.ConeGeometry(0.07, 0.5, 8), M(c, { roughness: 0.5 }), [0, 0.45, 0], null, u);
      add(new THREE.TorusGeometry(0.03, 0.008, 8, 16, Math.PI), M(0x5a4030), [0.03, 0.82, 0], null, u);
    }
    // a pair of little shoes waiting on the doormat
    const shoes: [number, number][] = [
      [-2.75, 0.15],
      [-2.55, -0.1],
    ];
    for (const [x, ry] of shoes) {
      const sh = add(
        RB(0.09, 0.06, 0.22, 0.03),
        M(0xf6ece2, { roughness: 0.6 }),
        [x, 0.04, RD / 2 + 0.75],
        [0, ry, 0],
        root,
      );
      add(RB(0.07, 0.012, 0.05, 0.005), M(0xf2b8c4), [0, 0.03, 0.06], null, sh);
    }
    // flush ceiling light
    const cl = add(
      new THREE.SphereGeometry(0.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xfffaf2, emissive: 0xffe6c4, emissiveIntensity: 1.2 }),
      [(HALL.x0 + HALL.x1) / 2, HALL.h, (HALL.z0 + HALL.z1) / 2],
      [Math.PI, 0, 0],
      root,
      false,
      false,
    );
    cl.scale.y = 0.45;
  }

  // ---- procedural soft furnishings that read better than a model: curtains, desk lamp, shelf of photos
  const curtainMat = new THREE.MeshStandardMaterial({
    color: 0xedbcc6,
    roughness: 0.95,
    side: THREE.DoubleSide,
    normalMap: a.furNormal,
    normalScale: new THREE.Vector2(0.25, 0.25),
    envMapIntensity: 0.25,
  });
  for (const x of [WIN.x - WIN.w / 2 - 0.38, WIN.x + WIN.w / 2 + 0.38]) {
    const g = new THREE.PlaneGeometry(0.7, RH - 0.25, 40, 30);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++)
      p.setZ(
        i,
        Math.sin(p.getX(i) * 22) * 0.045 * (1 - p.getY(i) / 6) +
          Math.sin(p.getY(i) * 2 + p.getX(i) * 3) * 0.01,
      );
    g.computeVertexNormals();
    add(g, curtainMat, [x, (RH - 0.25) / 2, -RD / 2 + 0.14], null, root);
  }
  // desk lamp (the key light sits in its bulb)
  const lamp = new THREE.Group();
  lamp.position.set(WIN.x + 0.6, 0.78, -RD / 2 + 0.3);
  root.add(lamp);
  const metal = M(0xd8d0c8, { metalness: 0.9, roughness: 0.25, envMapIntensity: 1 });
  add(new THREE.CylinderGeometry(0.09, 0.11, 0.03, 32), metal, [0, 0.015, 0], null, lamp);
  add(new THREE.CylinderGeometry(0.01, 0.01, 0.42, 12), metal, [0, 0.23, 0], null, lamp);
  add(
    new THREE.CylinderGeometry(0.09, 0.18, 0.17, 40, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xfff1dc,
      emissive: 0xffb35c,
      emissiveIntensity: 0.5,
      side: THREE.DoubleSide,
      roughness: 0.85,
    }),
    [0, 0.47, 0],
    null,
    lamp,
    false,
    false,
  );
  add(
    new THREE.SphereGeometry(0.035, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffd59a, emissiveIntensity: 2 }),
    [0, 0.43, 0],
    null,
    lamp,
    false,
    false,
  );
  const lampWorld = new THREE.Vector3(WIN.x + 0.6, 0.78 + 0.43, -RD / 2 + 0.3);

  // string lights along the back wall + a polaroid string on the front wall
  const bulbs: THREE.Mesh[] = [];
  const bulbMat = () =>
    new THREE.MeshStandardMaterial({ color: 0xffe2a8, emissive: 0xffc66b, emissiveIntensity: 3 });
  {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      pts.push(
        new THREE.Vector3(
          -RW / 2 + 0.1 + t * (RW - 0.2),
          RH - 0.18 - Math.abs(Math.sin(t * Math.PI * 3)) * 0.16,
          -RD / 2 + 0.04,
        ),
      );
    }
    const cv = new THREE.CatmullRomCurve3(pts);
    add(new THREE.TubeGeometry(cv, 160, 0.004, 6), M(0x3a2e28), [0, 0, 0], null, root, false, false);
    for (let i = 1; i < 30; i++) {
      const b = add(
        new THREE.SphereGeometry(0.026, 12, 10),
        bulbMat(),
        cv.getPoint(i / 30).toArray() as [number, number, number],
        null,
        root,
        false,
        false,
      );
      b.position.y -= 0.035;
      b.userData.ph = rnd(0, 6);
      bulbs.push(b);
    }
  }
  {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      pts.push(new THREE.Vector3(-1.4 + t * 2.4, 2.3 - Math.sin(t * Math.PI) * 0.3, RD / 2 - 0.04));
    }
    const cv = new THREE.CatmullRomCurve3(pts);
    add(new THREE.TubeGeometry(cv, 80, 0.003, 6), M(0x8a6a50), [0, 0, 0], null, root, false, false);
    const tones = ['#f6d9de', '#c7d8f2', '#fff1c7', '#e3f4dc', '#efe0ff', '#f6d9de', '#c7d8f2'];
    tones.forEach((_c, k) => {
      const p = cv.getPoint((k + 0.5) / tones.length);
      const pg = new THREE.Group();
      pg.position.copy(p);
      pg.position.y -= 0.14;
      pg.rotation.set(0, Math.PI, rnd(-0.15, 0.15));
      root.add(pg);
      // polaroid: white card with the photo slot inset near the top
      add(
        new THREE.PlaneGeometry(0.17, 0.2),
        M(0xfffdf8, { roughness: 0.6 }),
        [0, 0, 0],
        null,
        pg,
        true,
        true,
      );
      add(
        new THREE.PlaneGeometry(0.15, 0.15),
        M(0xffffff, {
          map: photoTexture(`polaroid-${k + 1}`, POLAROID_SCENES[k % POLAROID_SCENES.length]),
          roughness: 0.55,
        }),
        [0, 0.017, 0.001],
        null,
        pg,
        false,
        false,
      );
      add(RB(0.012, 0.04, 0.01, 0.003), M(0xd9a46b), [0, 0.1, 0.003], null, pg, false);
    });
    for (let i = 1; i < 14; i++) {
      const b = add(
        new THREE.SphereGeometry(0.018, 10, 8),
        bulbMat(),
        cv.getPoint(i / 14).toArray() as [number, number, number],
        null,
        root,
        false,
        false,
      );
      b.userData.ph = rnd(0, 6);
      bulbs.push(b);
    }
  }
  // two framed photobooth strips on the left wall (two: her lucky number)
  [
    [1.85, -2.0, 0.04],
    [1.95, -1.55, -0.05],
  ].forEach(([y, z, r], k) => {
    const f = new THREE.Group();
    f.position.set(-RW / 2 + 0.02, y, z);
    f.rotation.set(0, Math.PI / 2, r);
    root.add(f);
    add(RB(0.26, 0.78, 0.025, 0.008), M(0x6b4a34, { roughness: 0.45 }), [0, 0, 0], null, f);
    add(new THREE.PlaneGeometry(0.21, 0.72), M(0xfffaf2), [0, 0, 0.014], null, f, false);
    for (let i = 0; i < 3; i++)
      add(
        new THREE.PlaneGeometry(0.17, 0.19),
        M(0xffffff, {
          map: photoTexture(`strip-${k ? 'b' : 'a'}-${i + 1}`, 'photobooth', 256, 288),
          roughness: 0.5,
        }),
        [0, 0.22 - i * 0.22, 0.016],
        null,
        f,
        false,
      );
  });
  // pink neon heart above the bed + paper stars hanging over it
  {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 80; i++) {
      const t = (i / 80) * Math.PI * 2;
      pts.push(
        new THREE.Vector3(
          16 * Math.pow(Math.sin(t), 3) * 0.028,
          (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 0.028,
          0,
        ),
      );
    }
    add(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 200, 0.014, 10, true),
      new THREE.MeshStandardMaterial({ color: 0xffc2d1, emissive: 0xff5c8a, emissiveIntensity: 3.2 }),
      [RW / 2 - 0.04, 2.1, 0.7],
      [0, -Math.PI / 2, 0],
      root,
      false,
      false,
    );
  }
  const stars: THREE.Object3D[] = [];
  {
    const shp = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * Math.PI * 2 - Math.PI / 2,
        r = i % 2 ? 0.045 : 0.1;
      if (i) shp.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
      else shp.moveTo(Math.cos(ang) * r, Math.sin(ang) * r);
    }
    const sg = new THREE.ExtrudeGeometry(shp, {
      depth: 0.025,
      bevelEnabled: true,
      bevelSize: 0.008,
      bevelThickness: 0.008,
      bevelSegments: 2,
    });
    sg.center();
    (
      [
        [RW / 2 - 1.6, 0.0, 2.35, 0xfff1c7],
        [RW / 2 - 0.9, 0.5, 2.55, 0xffd6e0],
        [RW / 2 - 1.3, 1.2, 2.45, 0xdcebff],
        [RW / 2 - 0.6, 1.5, 2.25, 0xfff1c7],
        [RW / 2 - 1.9, 1.0, 2.6, 0xffd6e0],
      ] as const
    ).forEach(([x, z, y, c]) => {
      const h = new THREE.Group();
      h.position.set(x, RH, z);
      root.add(h);
      add(
        new THREE.CylinderGeometry(0.0015, 0.0015, RH - y, 4),
        M(0xffffff),
        [0, -(RH - y) / 2, 0],
        null,
        h,
        false,
        false,
      );
      add(
        sg,
        new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.6, roughness: 0.7 }),
        [0, -(RH - y), 0],
        null,
        h,
        false,
        false,
      );
      h.userData.ph = rnd(0, 6);
      stars.push(h);
    });
  }
  return { anchors, fan, bulbs, stars, lampWorld };
}

/** A big leafy house plant in a cream ceramic pot (matches the soft style better than any free model). */
function leafyPlant(root: THREE.Group, x: number, z: number, h: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  root.add(g);
  const pot = M(0xf6ece2, { roughness: 0.45 });
  add(new THREE.CylinderGeometry(0.21, 0.16, 0.36, 32), pot, [0, 0.18, 0], null, g);
  add(new THREE.TorusGeometry(0.205, 0.018, 10, 40), pot, [0, 0.36, 0], [Math.PI / 2, 0, 0], g);
  add(new THREE.CylinderGeometry(0.19, 0.19, 0.02, 24), M(0x5a4030, { roughness: 1 }), [0, 0.34, 0], null, g);
  const leaves = [
    M(0x6f9e6a, { roughness: 0.6, side: THREE.DoubleSide }),
    M(0x89b47f, { roughness: 0.6, side: THREE.DoubleSide }),
  ];
  for (let i = 0; i < 22; i++) {
    const len = rnd(0.35, 0.6) * (h / 1.2);
    const stem = new THREE.Group();
    stem.position.set(0, 0.34, 0);
    stem.rotation.set(rnd(0.25, 0.75), (i / 22) * Math.PI * 2 + rnd(-0.2, 0.2), 0);
    g.add(stem);
    add(new THREE.CylinderGeometry(0.004, 0.006, len, 5), M(0x5e8a52), [0, len / 2, 0], null, stem);
    add(new THREE.SphereGeometry(0.1, 14, 10), leaves[i % 2], [0, len, 0.02], [0.5, 0, 0], stem).scale.set(
      0.55,
      1.15,
      0.05,
    );
  }
}
