/**
 * Furniture and decor from the CC0 packs (Kenney Furniture Kit, Quaternius via Poly Pizza),
 * placed at real sizes, plus their collision footprints. Bespoke keepsakes live in keepsakes.ts.
 */
import * as THREE from 'three';
import { Assets, place } from './assets';
import { add, canvasTex, Colliders, M, makeCanvas, RB, rnd } from './kit';
import { HALL, RD, RH, RW, WIN } from './room';

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

  // ---- back wall: desk under the window, chair
  anchors.desk = P('desk', { pos: [WIN.x, 0, -RD / 2 + 0.42], width: 1.6, rotY: 0 });
  col.box(WIN.x, -RD / 2 + 0.42, 1.65, 0.8);
  anchors.chair = P('chairDesk', {
    pos: [WIN.x - 0.2, 0, -RD / 2 + 1.15],
    height: 0.95,
    rotY: Math.PI + 0.3,
  });
  col.box(WIN.x - 0.2, -RD / 2 + 1.15, 0.5, 0.5);

  // ---- right wall: bed, nightstand, wardrobe
  anchors.bed = P('bedDouble', { pos: [RW / 2 - 1.05, 0, 0.7], width: 2.05, rotY: -Math.PI / 2 });
  col.box(RW / 2 - 1.05, 0.7, 2.05, 1.7);
  anchors.nightstand = P('cabinetBedDrawerTable', {
    pos: [RW / 2 - 0.3, 0, -0.75],
    height: 0.55,
    rotY: -Math.PI / 2,
  });
  col.box(RW / 2 - 0.3, -0.75, 0.5, 0.5);
  P('closet', { pos: [RW / 2 - 0.35, 0, 3.5], height: 2.05, rotY: -Math.PI / 2, tint: 0xf6ece0 });
  col.box(RW / 2 - 0.35, 3.5, 0.7, 1.4);

  // ---- front wall: dresser + mirror, polaroid string
  anchors.dresser = P('sideTableDrawers', { pos: [1.6, 0, RD / 2 - 0.3], width: 1.3, rotY: Math.PI });
  col.box(1.6, RD / 2 - 0.3, 1.35, 0.6);
  P('mirror', { pos: [1.6, 1.0, RD / 2 - 0.04], height: 1.0, rotY: Math.PI });

  // ---- left wall: bookcase, lounge chair + floor lamp, coat rack, shelf
  anchors.bookcase = P('bookcaseOpen', { pos: [-RW / 2 + 0.25, 0, 3.4], height: 1.9, rotY: Math.PI / 2 });
  col.box(-RW / 2 + 0.25, 3.4, 0.5, 1.1);
  for (let i = 0; i < 6; i++)
    P('books', {
      pos: [-RW / 2 + 0.25, 0.12 + (i % 3) * 0.6 + 0.02, 3.1 + Math.floor(i / 3) * 0.5],
      width: 0.28,
      rotY: Math.PI / 2 + rnd(-0.2, 0.2),
    });
  anchors.lounge = P('loungeDesignChair', { pos: [-3.7, 0, -2.7], height: 0.85, rotY: Math.PI / 4 });
  col.box(-3.7, -2.7, 0.9, 0.9, undefined, 2.4, Math.PI / 4);
  P('lampRoundFloor', { pos: [-4.5, 0, -3.6], height: 1.6 });
  col.box(-4.5, -3.6, 0.35, 0.35);
  anchors.coatRack = P('coatRack', { pos: [-RW / 2 + 0.05, 1.55, 1.9], width: 0.8, rotY: Math.PI / 2 });
  const shelf = new THREE.Group();
  shelf.position.set(-RW / 2 + 0.15, 1.55, -0.9);
  root.add(shelf);
  add(RB(0.28, 0.035, 1.6, 0.01), M(0xc9a27c, { roughness: 0.55 }), [0, 0, 0], null, shelf);
  anchors.shelf = shelf;
  // low cabinet for the fish tank
  const cab = new THREE.Group();
  cab.position.set(-RW / 2 + 0.3, 0, 0.6);
  root.add(cab);
  add(RB(0.5, 0.72, 1.2, 0.02), M(0xf6efe6, { roughness: 0.5 }), [0, 0.36, 0], null, cab);
  for (const z of [-0.15, 0.15])
    add(
      new THREE.SphereGeometry(0.018, 10, 8),
      M(0xd8d0c8, { metalness: 0.9, roughness: 0.25 }),
      [0.26, 0.5, z],
      null,
      cab,
    );
  col.box(-RW / 2 + 0.3, 0.6, 0.55, 1.25);
  anchors.cabinet = cab;

  // ---- centre: rug, round table, cushions, beanbag, ceiling fan
  P('rugRound', { pos: [0.2, 0.004, 0.6], width: 2.8 });
  anchors.table = P('tableRound', { pos: [0.2, 0, 0.6], height: 0.45 });
  col.box(0.2, 0.6, 0.85, 0.85);
  P('pillow', { pos: [-0.75, 0, 0.75], width: 0.55, rotY: 0.4, tint: 0xf1c4cc });
  P('pillowBlue', { pos: [1.15, 0, 0.9], width: 0.55, rotY: -0.5 });
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
  const fan = P('ceilingFan', { pos: [0.2, RH - 0.42, 0.6], height: 0.42 });
  fan.traverse((o) => (o.castShadow = false));

  // ---- plants
  P('pottedPlant', { pos: [-RW / 2 + 0.5, 0, -RD / 2 + 0.5], height: 1.25 });
  col.box(-RW / 2 + 0.5, -RD / 2 + 0.5, 0.5, 0.5);
  P('houseplant', { pos: [RW / 2 - 0.45, 0, -RD / 2 + 0.45], height: 1.1 });
  col.box(RW / 2 - 0.45, -RD / 2 + 0.45, 0.5, 0.5);
  P('plantSmall2', { pos: [0.5, 0.45, 0.85], height: 0.22 });

  // ---- hallway: doormat, wall lamp, plant, a little bench
  P('rugDoormat', { pos: [-2.6, 0.004, RD / 2 + 0.55], width: 1.0 });
  P('lampWall', { pos: [HALL.x0 + 0.02, 1.9, RD / 2 + 1.4], width: 0.35, rotY: Math.PI / 2 });
  P('houseplant', { pos: [HALL.x1 - 0.4, 0, HALL.z1 - 0.45], height: 1.0 });
  col.box(HALL.x1 - 0.4, HALL.z1 - 0.45, 0.5, 0.5);

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
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffd59a, emissiveIntensity: 4 }),
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
    tones.forEach((c, k) => {
      const p = cv.getPoint((k + 0.5) / tones.length);
      const pg = new THREE.Group();
      pg.position.copy(p);
      pg.position.y -= 0.14;
      pg.rotation.set(0, Math.PI, rnd(-0.15, 0.15));
      root.add(pg);
      const photo = canvasTex(
        makeCanvas(128, 150, (g, w, h) => {
          g.fillStyle = '#fffdf8';
          g.fillRect(0, 0, w, h);
          const gr = g.createLinearGradient(0, 0, 0, 110);
          gr.addColorStop(0, c);
          gr.addColorStop(1, '#ffffff');
          g.fillStyle = gr;
          g.fillRect(10, 10, w - 20, 105);
          g.fillStyle = '#b8455b';
          g.font = '700 22px Charm, cursive';
          g.textAlign = 'center';
          g.fillText('♡', w / 2, 70);
        }),
      );
      add(
        new THREE.PlaneGeometry(0.17, 0.2),
        M(0xffffff, { map: photo, roughness: 0.6 }),
        [0, 0, 0],
        null,
        pg,
        true,
        true,
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
    (k ? [0xc7d8f2, 0xf6d9de, 0xfff1c7] : [0xf6d9de, 0xfff1c7, 0xc7d8f2]).forEach((t, i) =>
      add(
        new THREE.PlaneGeometry(0.17, 0.19),
        M(t, { roughness: 0.5 }),
        [0, 0.22 - i * 0.22, 0.016],
        null,
        f,
        false,
      ),
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
