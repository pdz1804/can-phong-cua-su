/**
 * The keepsakes: small bespoke objects, each tied to a real day and a letter in content/keepsakes.ts.
 * They are modelled in code (rounded, soft, slightly stylised) because no CC0 model exists for
 * things like "a blue heart mirror box Su made by hand".
 */
import * as THREE from 'three';
import { Assets } from './assets';
import { add, canvasTex, Interactable, M, makeCanvas, RB, rnd } from './kit';
import { Furniture } from './furniture';
import { RD, RW, WIN } from './room';
import { swapInDesignerModel, swapInDesignerPiece } from './designer-models';

type Builder = (g: THREE.Group, a: Assets) => void;

/** Top surface of a placed object (world space). */
function topOf(o: THREE.Object3D) {
  const b = new THREE.Box3().setFromObject(o);
  return { y: b.max.y, c: b.getCenter(new THREE.Vector3()) };
}

/** Soft fabric: physical sheen gives the velvety rim light real plush toys have. */
function fabric(color: number, fur?: THREE.Texture) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.95,
    sheen: 1,
    sheenRoughness: 0.55,
    sheenColor: new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.55),
    normalMap: fur,
    normalScale: new THREE.Vector2(0.9, 0.9),
    envMapIntensity: 0.5,
  });
}

/**
 * A seated plush (teddy-style): pear body, squashed head, inner ears, glossy eyes with a catch-light,
 * stitched nose and smile, blush, arms resting forward, legs out front with paw pads.
 */
function plush(
  parent: THREE.Object3D,
  pos: [number, number, number],
  s: number,
  body: number,
  belly: number,
  ear: number,
  fur?: THREE.Texture,
) {
  const g = new THREE.Group();
  g.position.set(...pos);
  g.scale.setScalar(s);
  parent.add(g);
  const fm = fabric(body, fur),
    bm = fabric(belly, fur),
    em = fabric(ear, fur);
  const dark = M(0x2a1d1a, { roughness: 0.15, envMapIntensity: 1.2 });
  // pear-shaped seated body
  const prof: THREE.Vector2[] = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    prof.push(new THREE.Vector2(0.01 + Math.sin(t * Math.PI) * (0.2 - t * 0.07), t * 0.4));
  }
  add(new THREE.LatheGeometry(prof, 40), fm, [0, 0.02, 0], null, g).scale.set(1, 1, 0.88);
  add(new THREE.SphereGeometry(0.12, 28, 18), bm, [0, 0.18, 0.1], null, g).scale.set(1, 1.15, 0.45);
  // head
  add(new THREE.SphereGeometry(0.165, 40, 28), fm, [0, 0.52, 0.02], null, g).scale.set(1.08, 0.95, 0.98);
  add(new THREE.SphereGeometry(0.068, 24, 16), bm, [0, 0.48, 0.15], null, g).scale.set(1.15, 0.82, 0.75);
  add(new THREE.SphereGeometry(0.02, 14, 10), dark, [0, 0.505, 0.205], null, g).scale.set(1.3, 0.85, 0.8);
  add(new THREE.TorusGeometry(0.016, 0.0035, 6, 16, Math.PI), dark, [0, 0.468, 0.199], [0, 0, Math.PI], g);
  for (const k of [-1, 1]) {
    // ears with an inner patch
    add(new THREE.SphereGeometry(0.058, 20, 14), em, [k * 0.12, 0.655, 0], null, g).scale.set(1, 1, 0.55);
    add(new THREE.SphereGeometry(0.034, 16, 10), bm, [k * 0.12, 0.652, 0.028], null, g).scale.set(1, 1, 0.3);
    // glossy eyes with a tiny catch-light
    add(new THREE.SphereGeometry(0.019, 16, 12), dark, [k * 0.062, 0.545, 0.158], null, g);
    add(
      new THREE.SphereGeometry(0.005, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
      [k * 0.062 + 0.006, 0.552, 0.175],
      null,
      g,
      false,
      false,
    );
    // blush
    add(
      new THREE.CircleGeometry(0.022, 20),
      M(0xf2a3b3, { roughness: 1, transparent: true, opacity: 0.75 }),
      [k * 0.105, 0.49, 0.155],
      [0, k * 0.55, 0],
      g,
      false,
    );
    // arms resting forward, legs out front with paw pads
    add(new THREE.CapsuleGeometry(0.045, 0.12, 8, 16), fm, [k * 0.17, 0.25, 0.07], [0.9, 0, k * 0.35], g);
    add(
      new THREE.CapsuleGeometry(0.058, 0.1, 8, 16),
      fm,
      [k * 0.09, 0.055, 0.15],
      [Math.PI / 2, 0, k * 0.15],
      g,
    );
    add(new THREE.CircleGeometry(0.04, 20), bm, [k * 0.09, 0.055, 0.258], null, g, false);
  }
  return g;
}

const metal = () => M(0xd8d0c8, { metalness: 0.9, roughness: 0.25, envMapIntensity: 1 });
const glass = (o = 0.4) =>
  new THREE.MeshPhysicalMaterial({
    color: 0xeef7ff,
    roughness: 0.05,
    transmission: 0.9,
    thickness: 0.02,
    transparent: true,
    opacity: o,
    envMapIntensity: 1,
  });

const BUILD: Record<string, Builder> = {
  bear(g, a) {
    // the sale-hunted teddy from 25.07: honey fur, cream muzzle, a pink ribbon
    const b = plush(g, [0, 0, 0], 1, 0xd8a774, 0xf3dcc0, 0xc8925f, a.furNormal);
    add(
      new THREE.TorusGeometry(0.075, 0.02, 10, 28),
      M(0xe58aa0, { roughness: 0.5 }),
      [0, 0.37, 0.07],
      [Math.PI / 2.3, 0, 0],
      b,
    );
  },
  radio(g) {
    // a small retro radio on a little stool next to the nightstand
    add(
      new THREE.CylinderGeometry(0.16, 0.16, 0.42, 24),
      M(0xe6c9a3, { roughness: 0.6 }),
      [0, 0.21, 0],
      null,
      g,
    );
    add(RB(0.34, 0.2, 0.14, 0.05), M(0xf2b8c4, { roughness: 0.5 }), [0, 0.52, 0], null, g);
    add(new THREE.CircleGeometry(0.06, 32), M(0xf6ece2, { roughness: 0.8 }), [-0.07, 0.52, 0.071], null, g);
    for (let k = 0; k < 5; k++)
      add(
        new THREE.TorusGeometry(0.012 + k * 0.01, 0.002, 4, 24),
        M(0xd9b8a0),
        [-0.07, 0.52, 0.072],
        null,
        g,
        false,
      );
    add(
      new THREE.CylinderGeometry(0.018, 0.018, 0.02, 16),
      M(0xfff6ee),
      [0.09, 0.55, 0.075],
      [Math.PI / 2, 0, 0],
      g,
    );
    add(
      new THREE.CylinderGeometry(0.003, 0.003, 0.26, 6),
      M(0xd8d0c8, { metalness: 0.8 }),
      [0.1, 0.72, -0.03],
      [0, 0, -0.4],
      g,
    );
  },
  lily(g) {
    add(
      new THREE.LatheGeometry(
        [
          [0, 0],
          [0.09, 0],
          [0.1, 0.08],
          [0.07, 0.26],
          [0.06, 0.33],
          [0.075, 0.36],
        ].map((p) => new THREE.Vector2(...p)),
        40,
      ),
      glass(0.55),
      [0, 0, 0],
      null,
      g,
    );
    const stem = M(0x5d8a4f),
      petal = M(0xfffcf6, { roughness: 0.45 }),
      core = M(0xf2c14e);
    for (const [x, y, z] of [
      [0, 0.72, 0],
      [0.14, 0.62, 0.06],
      [-0.13, 0.66, -0.04],
    ] as const) {
      add(
        new THREE.CylinderGeometry(0.007, 0.007, y, 8),
        stem,
        [x / 2, y / 2, z / 2],
        [z * 0.6, 0, -x * 0.6],
        g,
      );
      const f = new THREE.Group();
      f.position.set(x, y, z);
      f.rotation.set(rnd(-0.5, 0.5), rnd(0, 6), rnd(-0.5, 0.5));
      g.add(f);
      for (let p = 0; p < 6; p++) {
        const ang = (p / 6) * Math.PI * 2;
        const pt = new THREE.Mesh(new THREE.SphereGeometry(0.075, 18, 12), petal);
        pt.scale.set(0.34, 1, 0.1);
        pt.position.set(Math.cos(ang) * 0.05, 0.05, Math.sin(ang) * 0.05);
        pt.rotation.order = 'YXZ';
        pt.rotation.y = -ang + Math.PI / 2;
        pt.rotation.x = 1.05;
        f.add(pt);
      }
      add(new THREE.SphereGeometry(0.018, 10, 8), core, [0, 0.03, 0], null, f);
    }
  },
  album(g) {
    add(RB(0.26, 0.035, 0.32, 0.008), M(0xf0a9b8, { roughness: 0.6 }), [0, 0.018, 0], null, g);
    add(new THREE.PlaneGeometry(0.15, 0.18), M(0xfffaf2), [0, 0.0365, -0.02], [-Math.PI / 2, 0, 0], g);
    [0xc7d8f2, 0xf6d9de, 0xfff1c7].forEach((c, k) =>
      add(
        new THREE.PlaneGeometry(0.035, 0.045),
        M(c),
        [-0.04 + k * 0.04, 0.037, -0.02],
        [-Math.PI / 2, 0, 0],
        g,
      ),
    );
  },
  heartBox(g) {
    const s = new THREE.Shape();
    s.moveTo(0, 0.06);
    s.bezierCurveTo(0, 0.12, -0.14, 0.14, -0.14, 0.04);
    s.bezierCurveTo(-0.14, -0.04, -0.04, -0.08, 0, -0.14);
    s.bezierCurveTo(0.04, -0.08, 0.14, -0.04, 0.14, 0.04);
    s.bezierCurveTo(0.14, 0.14, 0, 0.12, 0, 0.06);
    add(
      new THREE.ExtrudeGeometry(s, {
        depth: 0.08,
        bevelEnabled: true,
        bevelSize: 0.012,
        bevelThickness: 0.012,
        bevelSegments: 4,
        curveSegments: 24,
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0x3f78d0,
        metalness: 0.4,
        roughness: 0.2,
        clearcoat: 1,
        sheen: 1,
        sheenColor: new THREE.Color(0x9fc2ff),
        envMapIntensity: 1.2,
      }),
      [0, 0, 0],
      [-Math.PI / 2, 0, 0],
      g,
    );
    for (let k = 0; k < 26; k++)
      add(
        new THREE.SphereGeometry(0.004, 6, 4),
        M(0xffffff, { emissive: 0xcfe2ff, emissiveIntensity: 1.2 }),
        [rnd(-0.1, 0.1), 0.095, rnd(-0.1, 0.06)],
        null,
        g,
        false,
        false,
      );
  },
  phin(g) {
    add(
      new THREE.CylinderGeometry(0.08, 0.07, 0.1, 28),
      M(0xf6efe6, { roughness: 0.3 }),
      [0, 0.05, 0],
      null,
      g,
    );
    add(new THREE.CylinderGeometry(0.11, 0.11, 0.012, 32), metal(), [0, 0.105, 0], null, g);
    add(new THREE.CylinderGeometry(0.06, 0.05, 0.1, 28), metal(), [0, 0.16, 0], null, g);
    add(new THREE.CylinderGeometry(0.065, 0.065, 0.02, 28), metal(), [0, 0.22, 0], null, g);
    add(new THREE.TorusGeometry(0.03, 0.006, 8, 24), metal(), [0.16, 0.01, 0.07], [-Math.PI / 2, 0, 0], g);
    add(RB(0.05, 0.012, 0.07, 0.006), M(0xf2b8c4), [0.2, 0.008, 0.12], [0, 0.4, 0], g);
  },
  cactus(g) {
    add(
      new THREE.CylinderGeometry(0.13, 0.1, 0.2, 28),
      M(0xc9805c, { roughness: 0.85 }),
      [0, 0.1, 0],
      null,
      g,
    );
    add(
      new THREE.CylinderGeometry(0.12, 0.12, 0.02, 28),
      M(0x4a3426, { roughness: 1 }),
      [0, 0.2, 0],
      null,
      g,
    );
    const c = M(0x5f9f63, { roughness: 0.55 });
    add(new THREE.CapsuleGeometry(0.07, 0.16, 8, 20), c, [0, 0.33, 0], null, g);
    add(new THREE.CapsuleGeometry(0.035, 0.06, 6, 14), c, [0.08, 0.33, 0], [0, 0, -0.9], g);
    add(new THREE.CapsuleGeometry(0.03, 0.05, 6, 14), c, [-0.075, 0.38, 0], [0, 0, 0.9], g);
    add(new THREE.SphereGeometry(0.025, 12, 8), M(0xf29ab0), [0, 0.47, 0], null, g);
  },
  hydrangea(g) {
    add(
      new THREE.CylinderGeometry(0.1, 0.08, 0.26, 28),
      M(0xfbf6ef, { roughness: 0.35 }),
      [0, 0.13, 0],
      null,
      g,
    );
    const N = 140,
      bl = new THREE.InstancedMesh(
        new THREE.IcosahedronGeometry(0.03, 1),
        M(0xffffff, { roughness: 0.7 }),
        N,
      );
    const m4 = new THREE.Matrix4(),
      q = new THREE.Quaternion(),
      col = new THREE.Color();
    for (let k = 0; k < N; k++) {
      const u = rnd(0, 6.28),
        v = rnd(0, 1.5),
        r = rnd(0.14, 0.21);
      m4.compose(
        new THREE.Vector3(
          Math.cos(u) * Math.sin(v) * r,
          0.44 + Math.cos(v) * r * 0.8,
          Math.sin(u) * Math.sin(v) * r,
        ),
        q.setFromEuler(new THREE.Euler(rnd(0, 3), rnd(0, 3), 0)),
        new THREE.Vector3(1, 0.35, 1),
      );
      bl.setMatrixAt(k, m4);
      bl.setColorAt(k, col.setHSL(rnd(0.57, 0.66), rnd(0.45, 0.65), rnd(0.6, 0.76)));
    }
    bl.castShadow = true;
    g.add(bl);
  },
  kitty(g) {
    const w = fabric(0xfffdfb);
    add(new THREE.ConeGeometry(0.17, 0.3, 32), M(0xf49ab0, { roughness: 0.8 }), [0, 0.16, 0], null, g);
    add(new THREE.SphereGeometry(0.18, 32, 24), w, [0, 0.44, 0], null, g).scale.set(1.25, 0.9, 0.95);
    for (const k of [-1, 1]) {
      add(new THREE.ConeGeometry(0.06, 0.1, 16), w, [k * 0.15, 0.6, 0], [0, 0, k * -0.4], g);
      add(
        new THREE.SphereGeometry(0.018, 10, 8),
        M(0x1d1a1a, { roughness: 0.2 }),
        [k * 0.08, 0.44, 0.16],
        null,
        g,
      ).scale.y = 1.3;
      add(
        new THREE.SphereGeometry(0.05, 16, 12),
        M(0xe2405c, { roughness: 0.5 }),
        [0.14 + k * 0.05, 0.6, 0.03],
        null,
        g,
      ).scale.set(1, 0.7, 0.5);
      add(new THREE.SphereGeometry(0.045, 12, 8), w, [k * 0.13, 0.24, 0.05], null, g);
    }
    add(new THREE.SphereGeometry(0.016, 10, 8), M(0xf2c14e), [0, 0.41, 0.17], null, g);
  },
  bubu(g, a) {
    plush(g, [-0.07, 0, 0], 0.32, 0xf8f5ef, 0xffffff, 0xf8f5ef, a.furNormal);
    plush(g, [0.07, 0, 0], 0.3, 0x9a6a48, 0xd8b494, 0x7d5236, a.furNormal);
  },
  stitch(g, a) {
    const sm = fabric(0x5e93df, a.furNormal),
      lb = fabric(0xa9cdf5, a.furNormal);
    add(new THREE.SphereGeometry(0.11, 24, 16), sm, [0, 0.09, 0], null, g).scale.set(1, 0.9, 0.9);
    add(new THREE.SphereGeometry(0.06, 16, 12), lb, [0, 0.08, 0.07], null, g).scale.set(1, 1.1, 0.5);
    add(new THREE.SphereGeometry(0.1, 24, 16), sm, [0, 0.25, 0.01], null, g).scale.set(1.2, 0.9, 1);
    for (const k of [-1, 1]) {
      add(new THREE.SphereGeometry(0.07, 16, 12), sm, [k * 0.14, 0.32, -0.01], [0, 0, k * -0.5], g).scale.set(
        0.55,
        1.5,
        0.15,
      );
      add(
        new THREE.SphereGeometry(0.028, 12, 8),
        M(0x101522, { roughness: 0.15, envMapIntensity: 1 }),
        [k * 0.045, 0.27, 0.085],
        null,
        g,
      );
    }
    add(new THREE.SphereGeometry(0.03, 12, 8), M(0x2a3550), [0, 0.235, 0.1], null, g).scale.set(
      1.3,
      0.7,
      0.7,
    );
  },
  pajamaBear(g, a) {
    const b = plush(g, [0, 0, 0], 0.8, 0x9c6b47, 0xcfa47e, 0x84573a, a.furNormal);
    add(
      new THREE.CylinderGeometry(0.19, 0.21, 0.26, 24),
      M(0xbfd6f2, { roughness: 0.95 }),
      [0, 0.18, 0],
      null,
      b,
    ).scale.z = 0.9;
    plush(b, [0, 0.12, 0.16], 0.35, 0xe6c8a6, 0xf1d9bd, 0xd5b28c, a.furNormal);
  },
  chickenPlush(g, a) {
    const crust = fabric(0xd9944a, a.furNormal);
    add(new THREE.SphereGeometry(0.12, 24, 16), crust, [0, 0.12, 0], null, g).scale.set(1, 1.2, 0.9);
    add(new THREE.CylinderGeometry(0.025, 0.03, 0.12, 12), M(0xfbf2e2), [0, -0.03, 0], null, g);
    for (const k of [-1, 1]) {
      add(new THREE.SphereGeometry(0.032, 12, 8), M(0xfbf2e2), [k * 0.025, -0.1, 0], null, g);
      add(
        new THREE.SphereGeometry(0.014, 8, 6),
        M(0x241a18, { roughness: 0.2 }),
        [k * 0.04, 0.15, 0.105],
        null,
        g,
      );
      add(new THREE.SphereGeometry(0.018, 8, 6), M(0xf29ab0), [k * 0.075, 0.12, 0.09], null, g).scale.set(
        1,
        0.6,
        0.4,
      );
    }
  },
  camera(g) {
    add(RB(0.2, 0.12, 0.07, 0.012), M(0x2b2a2c, { roughness: 0.5 }), [0, 0.06, 0], null, g);
    add(RB(0.21, 0.035, 0.072, 0.008), metal(), [0, 0.13, 0], null, g);
    add(
      new THREE.CylinderGeometry(0.04, 0.045, 0.06, 32),
      M(0x1a1a1c, { roughness: 0.3, envMapIntensity: 1 }),
      [0, 0.06, 0.06],
      [Math.PI / 2, 0, 0],
      g,
    );
    add(
      new THREE.CircleGeometry(0.032, 32),
      new THREE.MeshPhysicalMaterial({ color: 0x223355, roughness: 0.05, clearcoat: 1 }),
      [0, 0.06, 0.0905],
      null,
      g,
    );
    add(
      new THREE.TorusGeometry(0.12, 0.006, 6, 32, Math.PI),
      M(0xf2b8c4),
      [0, 0.13, 0],
      [0, Math.PI / 2, 0],
      g,
    );
  },
  mic(g) {
    add(new THREE.CylinderGeometry(0.06, 0.07, 0.02, 24), metal(), [0, 0.01, 0], null, g);
    add(new THREE.CylinderGeometry(0.008, 0.008, 0.22, 10), metal(), [0, 0.12, 0], null, g);
    const mic = new THREE.Group();
    mic.position.set(0, 0.24, 0);
    mic.rotation.x = -0.5;
    g.add(mic);
    add(
      new THREE.CylinderGeometry(0.018, 0.012, 0.13, 20),
      M(0x1f1f22, { roughness: 0.35 }),
      [0, 0, 0],
      null,
      mic,
    );
    add(
      new THREE.SphereGeometry(0.03, 20, 16),
      M(0xcfcfd4, { metalness: 0.9, roughness: 0.45 }),
      [0, 0.08, 0],
      null,
      mic,
    );
    add(new THREE.TorusGeometry(0.03, 0.004, 8, 24), M(0xd9687d), [0, 0.06, 0], [Math.PI / 2, 0, 0], mic);
  },
  roses(g) {
    add(
      new THREE.CylinderGeometry(0.06, 0.05, 0.3, 28),
      M(0xf6efe6, { roughness: 0.25 }),
      [0, 0.15, 0],
      null,
      g,
    );
    (
      [
        [0, 0.62, 0],
        [0.08, 0.55, 0.04],
        [-0.07, 0.57, -0.03],
        [0.03, 0.5, -0.08],
        [-0.04, 0.52, 0.07],
      ] as const
    ).forEach(([x, y, z], k) => {
      add(
        new THREE.CylinderGeometry(0.005, 0.005, y - 0.2, 6),
        M(0x4f7d45),
        [x / 2, 0.2 + (y - 0.2) / 2, z / 2],
        [z * 0.6, 0, -x * 0.6],
        g,
      );
      const r = new THREE.Group();
      r.position.set(x, y, z);
      g.add(r);
      const rm = M(k % 2 ? 0xf4a6b6 : 0xfbf3ee, { roughness: 0.6, side: THREE.DoubleSide });
      for (let p = 0; p < 9; p++)
        add(
          new THREE.SphereGeometry(0.045 - p * 0.0035, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6),
          rm,
          [0, -0.01 + p * 0.003, 0],
          [0, p * 1.1, 0],
          r,
          true,
          false,
        );
    });
  },
  giftBox(g) {
    const bx = M(0x5c8ed8, { roughness: 0.45 }),
      rb = M(0xffffff, { roughness: 0.4 });
    add(RB(0.32, 0.26, 0.32, 0.01), bx, [0, 0.13, 0], null, g);
    add(RB(0.34, 0.04, 0.34, 0.01), bx, [0, 0.27, 0], null, g);
    add(RB(0.05, 0.3, 0.335, 0.004), rb, [0, 0.14, 0], null, g);
    add(RB(0.335, 0.3, 0.05, 0.004), rb, [0, 0.14, 0], null, g);
    for (const k of [-1, 1])
      add(
        new THREE.TorusGeometry(0.055, 0.018, 10, 24),
        rb,
        [k * 0.05, 0.31, 0],
        [0, 0, k * 0.5],
        g,
      ).scale.set(1, 0.7, 1);
  },
  lanterns(g) {
    (
      [
        [-0.1, 0xf2604f],
        [0.11, 0xf5c542],
      ] as const
    ).forEach(([x, c], k) => {
      const l = new THREE.Group();
      l.position.set(x, 0, k ? 0.05 : -0.03);
      g.add(l);
      add(new THREE.CylinderGeometry(0.006, 0.006, 0.25, 8), M(0x6b4a34), [0, 0.2, 0], [0, 0, 0.2], l);
      add(
        new THREE.SphereGeometry(0.07, 20, 14),
        new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.2, roughness: 0.8 }),
        [0, 0.1, 0],
        null,
        l,
        false,
        false,
      ).scale.y = 1.15;
      for (const y of [0.03, 0.17])
        add(
          new THREE.CylinderGeometry(0.035, 0.035, 0.015, 16),
          M(0xd9a441, { metalness: 0.5, roughness: 0.4 }),
          [0, y, 0],
          null,
          l,
        );
      const pl = new THREE.PointLight(c, 0.6, 1.4, 2);
      pl.position.set(0, 0.1, 0);
      l.add(pl);
    });
  },
  gongcha(g) {
    add(new THREE.CylinderGeometry(0.055, 0.045, 0.18, 28), glass(0.45), [0, 0.09, 0], null, g, false);
    add(
      new THREE.CylinderGeometry(0.051, 0.042, 0.15, 28),
      M(0xb9a3d6, { roughness: 0.6 }),
      [0, 0.077, 0],
      null,
      g,
    );
    for (let k = 0; k < 14; k++)
      add(
        new THREE.SphereGeometry(0.009, 8, 6),
        M(0x2a1a14, { roughness: 0.2 }),
        [rnd(-0.03, 0.03), 0.012 + rnd(0, 0.02), rnd(-0.03, 0.03)],
        null,
        g,
        false,
      );
    add(
      new THREE.CylinderGeometry(0.058, 0.058, 0.008, 28),
      M(0xffffff, { roughness: 0.3 }),
      [0, 0.183, 0],
      null,
      g,
    );
    add(new THREE.CylinderGeometry(0.006, 0.006, 0.22, 10), M(0xe2405c), [0.015, 0.24, 0], [0, 0, 0.15], g);
  },
  raincoats(g) {
    // two glossy hooded raincoats hanging from the pegs (local +z faces out of the wall)
    (
      [
        [-0.22, 0xe24a4a],
        [0.22, 0x4a7fd6],
      ] as const
    ).forEach(([x, c]) => {
      const coat = new THREE.Group();
      coat.position.set(x, 0, 0.07);
      g.add(coat);
      const mat = new THREE.MeshPhysicalMaterial({
        color: c,
        roughness: 0.22,
        clearcoat: 0.9,
        clearcoatRoughness: 0.15,
      });
      // A-line body: narrow shoulders flaring to the hem, flattened front to back
      const pts: THREE.Vector2[] = [];
      for (let i = 0; i <= 18; i++) {
        const t = i / 18;
        const r = 0.04 + 0.13 * Math.min(1, t / 0.06) + 0.04 * t + Math.sin(t * 7) * 0.004;
        pts.push(new THREE.Vector2(r, -0.06 - t * 0.8));
      }
      pts.push(new THREE.Vector2(0.001, -0.93));
      pts.reverse(); // lathe profiles run bottom to top, or the faces point inward
      add(new THREE.LatheGeometry(pts, 40), mat, [0, 0, 0], null, coat).scale.z = 0.42;
      // hood hangs folded behind the collar
      add(
        new THREE.SphereGeometry(0.11, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.6),
        mat,
        [0, -0.14, -0.075],
        [0.2, 0, 0],
        coat,
      ).scale.set(1.05, 1.2, 0.3);
      // hanging loop over the peg
      add(new THREE.TorusGeometry(0.025, 0.006, 8, 20), mat, [0, -0.01, -0.02], [0, 0, 0], coat);
      // sleeves hang a little in front of the body, slightly apart
      for (const sx of [-1, 1])
        add(
          new THREE.CapsuleGeometry(0.04, 0.48, 6, 14),
          mat,
          [sx * 0.185, -0.36, 0.045],
          [0.06, 0, sx * 0.1],
          coat,
        ).scale.z = 0.8;
      // placket with snap buttons down the front
      const front = 0.42;
      add(
        RB(0.03, 0.66, 0.01, 0.004),
        M(new THREE.Color(c).multiplyScalar(0.8), { roughness: 0.3 }),
        [0, -0.47, 0.086],
        null,
        coat,
      );
      for (let i = 0; i < 4; i++) {
        const t = 0.15 + i * 0.2;
        const r = 0.04 + 0.13 * Math.min(1, t / 0.06) + 0.04 * t;
        add(
          new THREE.CylinderGeometry(0.011, 0.011, 0.008, 16),
          M(0xf7f2ea, { roughness: 0.3 }),
          [0, -0.06 - t * 0.8, r * front + 0.016],
          [Math.PI / 2, 0, 0],
          coat,
        );
      }
    });
  },
  bubbles(g) {
    add(new THREE.CylinderGeometry(0.03, 0.03, 0.11, 20), glass(0.6), [0, 0.055, 0], null, g, false);
    add(new THREE.CylinderGeometry(0.032, 0.032, 0.02, 20), M(0xf29ab0), [0, 0.12, 0], null, g);
    const w = new THREE.Group();
    w.position.set(0.08, 0.01, 0.02);
    w.rotation.set(0, 0, -1.35);
    g.add(w);
    add(new THREE.CylinderGeometry(0.005, 0.005, 0.16, 8), M(0xf5c542), [0, 0.08, 0], null, w);
    add(new THREE.TorusGeometry(0.025, 0.004, 8, 24), M(0xf5c542), [0, 0.18, 0], null, w);
  },
  yarn(g) {
    add(
      new THREE.CylinderGeometry(0.2, 0.16, 0.2, 32, 1, true),
      M(0xc9a27c, { roughness: 1, side: THREE.DoubleSide }),
      [0, 0.1, 0],
      null,
      g,
    );
    add(new THREE.CircleGeometry(0.16, 32), M(0xa7835f), [0, 0.01, 0], [-Math.PI / 2, 0, 0], g);
    for (const [x, y, z, c] of [
      [0, 0.2, 0, 0xf2a7b5],
      [0.08, 0.17, 0.06, 0xa9c4ea],
      [-0.07, 0.18, -0.05, 0xfff1c7],
    ] as const) {
      add(new THREE.SphereGeometry(0.085, 24, 16), M(c, { roughness: 1 }), [x, y, z], null, g);
      for (let k = 0; k < 5; k++)
        add(
          new THREE.TorusGeometry(0.086, 0.004, 6, 40),
          M(c, { roughness: 1 }),
          [x, y, z],
          [rnd(0, 3), rnd(0, 3), 0],
          g,
        );
    }
  },
  chalk(g) {
    add(RB(0.2, 0.05, 0.12, 0.008), M(0xa9c4ea, { roughness: 0.5 }), [0, 0.025, 0], null, g);
    for (let k = 0; k < 6; k++)
      add(
        new THREE.CylinderGeometry(0.008, 0.008, 0.08, 10),
        M([0xffffff, 0xf6d36b, 0xf4a6b6][k % 3], { roughness: 1 }),
        [-0.07 + k * 0.028, 0.058, 0],
        [0, 0, Math.PI / 2],
        g,
      );
    add(RB(0.14, 0.012, 0.1, 0.004), M(0xf3c9d1, { roughness: 1 }), [0.02, 0.006, 0.12], [0, 0.3, 0], g);
  },
  jacket(g) {
    const geo = new THREE.PlaneGeometry(0.5, 0.75, 20, 24);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        y = p.getY(i);
      p.setZ(i, Math.sin(x * 14) * 0.012 + (y > 0.2 ? -(y - 0.2) * 0.5 : 0) + Math.cos(x * 6) * 0.03);
    }
    geo.computeVertexNormals();
    add(geo, M(0x3b4a63, { roughness: 0.9, side: THREE.DoubleSide }), [0, 0, 0], null, g);
  },
  shellCar(g) {
    add(RB(0.14, 0.05, 0.08, 0.02), M(0xf4c9b5, { roughness: 0.4 }), [0, 0.04, 0], null, g);
    add(
      new THREE.SphereGeometry(0.045, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      M(0xfbe9df, { roughness: 0.3 }),
      [0, 0.065, 0],
      null,
      g,
    ).scale.set(1.2, 0.8, 0.9);
    for (const [x, z] of [
      [-0.045, -0.04],
      [0.045, -0.04],
      [-0.045, 0.04],
      [0.045, 0.04],
    ] as const)
      add(
        new THREE.CylinderGeometry(0.018, 0.018, 0.012, 16),
        M(0x3a2e28),
        [x, 0.018, z],
        [Math.PI / 2, 0, 0],
        g,
      );
  },
  guava(g) {
    add(
      new THREE.SphereGeometry(0.16, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
      M(0xf6efe6, { roughness: 0.3, side: THREE.DoubleSide }),
      [0, 0.08, 0], // bowl rests on the table (half-height bowl: its rim at 0.08)
      null,
      g,
    ).scale.y = 0.5;
    for (const [x, z] of [
      [0, 0],
      [0.07, 0.04],
      [-0.06, 0.05],
      [0.02, -0.07],
    ] as const) {
      add(new THREE.SphereGeometry(0.05, 20, 16), M(0x9cc56a, { roughness: 0.55 }), [x, 0.06, z], null, g);
      add(new THREE.CylinderGeometry(0.003, 0.003, 0.04, 6), M(0x5a4030), [x, 0.12, z], [0.3, 0, 0.2], g);
    }
  },
  banhTrang(g) {
    add(new THREE.CylinderGeometry(0.07, 0.07, 0.16, 24), glass(0.5), [0, 0.08, 0], null, g, false);
    add(
      new THREE.CylinderGeometry(0.066, 0.066, 0.12, 24),
      M(0xe8c27a, { roughness: 0.9 }),
      [0, 0.065, 0],
      null,
      g,
    );
    add(
      new THREE.CylinderGeometry(0.074, 0.074, 0.03, 24),
      M(0xd9687d, { roughness: 0.5 }),
      [0, 0.175, 0],
      null,
      g,
    );
  },
  perfume(g) {
    add(RB(0.07, 0.09, 0.04, 0.012), glass(0.7), [0, 0.045, 0], null, g, false);
    add(
      RB(0.06, 0.07, 0.032, 0.01),
      M(0xf7e3c9, { roughness: 0.2, transparent: true, opacity: 0.85 }),
      [0, 0.04, 0],
      null,
      g,
    );
    add(
      new THREE.CylinderGeometry(0.014, 0.014, 0.03, 16),
      M(0xd8c7a0, { metalness: 0.9, roughness: 0.2 }),
      [0, 0.105, 0],
      null,
      g,
    );
  },
  controller(g) {
    const body = M(0xf2f0ee, { roughness: 0.4 });
    add(RB(0.15, 0.03, 0.08, 0.015), body, [0, 0.02, 0], null, g);
    for (const s of [-1, 1])
      add(new THREE.SphereGeometry(0.04, 16, 12), body, [s * 0.07, 0.02, 0.025], null, g).scale.set(
        1,
        0.45,
        1.2,
      );
    for (const [x, c] of [
      [0.04, 0xe2405c],
      [0.06, 0x4a7fd6],
      [-0.05, 0x333333],
    ] as const)
      add(new THREE.CylinderGeometry(0.008, 0.008, 0.01, 12), M(c), [x, 0.038, 0], null, g);
  },
  tenOClock(g) {
    add(
      new THREE.CylinderGeometry(0.1, 0.08, 0.13, 24),
      M(0xc9805c, { roughness: 0.85 }),
      [0, 0.065, 0],
      null,
      g,
    );
    for (let k = 0; k < 16; k++) {
      const ang = rnd(0, 6.28),
        r = rnd(0, 0.08);
      add(
        new THREE.SphereGeometry(0.018, 10, 8),
        M([0xff5c8a, 0xffb347, 0xf6e05e, 0xff7eb6][k % 4], { roughness: 0.6 }),
        [Math.cos(ang) * r, 0.15 + rnd(0, 0.03), Math.sin(ang) * r],
        null,
        g,
      ).scale.y = 0.5;
    }
  },
  maskToy(g) {
    const face = canvasTex(
      makeCanvas(128, 128, (c, w) => {
        c.fillStyle = '#fff4e6';
        c.beginPath();
        c.arc(w / 2, w / 2, 60, 0, 7);
        c.fill();
        c.fillStyle = '#f4a6b6';
        for (const x of [34, 94]) {
          c.beginPath();
          c.arc(x, 80, 12, 0, 7);
          c.fill();
        }
        c.fillStyle = '#2a1a14';
        for (const x of [44, 84]) {
          c.beginPath();
          c.arc(x, 56, 7, 0, 7);
          c.fill();
        }
        c.strokeStyle = '#d9687d';
        c.lineWidth = 4;
        c.beginPath();
        c.arc(64, 78, 16, 0.2, Math.PI - 0.2);
        c.stroke();
      }),
    );
    add(
      new THREE.CircleGeometry(0.11, 40),
      M(0xffffff, { map: face, roughness: 0.5 }),
      [0, 0.2, 0.012],
      null,
      g,
    );
    add(new THREE.CylinderGeometry(0.11, 0.11, 0.02, 40), M(0xf6d36b), [0, 0.2, 0], [Math.PI / 2, 0, 0], g);
    add(new THREE.CylinderGeometry(0.008, 0.008, 0.1, 8), M(0x6b4a34), [0, 0.05, 0], null, g);
  },
  kfc(g) {
    const stripes = canvasTex(
      makeCanvas(256, 64, (c, w, h) => {
        for (let i = 0; i < 16; i++) {
          c.fillStyle = i % 2 ? '#ffffff' : '#c8102e';
          c.fillRect((i * w) / 16, 0, w / 16, h);
        }
      }),
    );
    add(
      new THREE.CylinderGeometry(0.11, 0.08, 0.17, 32, 1, true),
      M(0xffffff, { map: stripes, side: THREE.DoubleSide }),
      [0, 0.085, 0],
      null,
      g,
    );
    add(new THREE.CircleGeometry(0.08, 32), M(0xffffff), [0, 0.001, 0], [-Math.PI / 2, 0, 0], g);
    for (let k = 0; k < 5; k++)
      add(
        new THREE.SphereGeometry(0.045, 16, 12),
        M(0xd28b3b, { roughness: 0.95 }),
        [rnd(-0.05, 0.05), 0.17, rnd(-0.05, 0.05)],
        null,
        g,
      ).scale.set(1, 1.3, 0.9);
  },
  pizza(g) {
    add(RB(0.36, 0.04, 0.36, 0.006), M(0xc9a27c, { roughness: 0.9 }), [0, 0.02, 0], null, g);
    const lid = canvasTex(
      makeCanvas(128, 128, (c, w) => {
        c.fillStyle = '#d7b48c';
        c.fillRect(0, 0, w, w);
        c.fillStyle = '#b8455b';
        c.font = '700 26px Charm, cursive';
        c.textAlign = 'center';
        c.fillText('pizza', w / 2, 60);
        c.fillText('có dứa', w / 2, 92);
      }),
    );
    add(
      new THREE.PlaneGeometry(0.34, 0.34),
      M(0xffffff, { map: lid, roughness: 0.9 }),
      [0, 0.041, 0],
      [-Math.PI / 2, 0, 0],
      g,
    );
  },
  certificate(g) {
    add(RB(0.42, 0.32, 0.02, 0.006), M(0x6b4a34, { roughness: 0.45 }), [0, 0, 0], null, g);
    const t = canvasTex(
      makeCanvas(256, 192, (c, w, h) => {
        c.fillStyle = '#fffaf2';
        c.fillRect(0, 0, w, h);
        c.strokeStyle = '#d9a441';
        c.lineWidth = 6;
        c.strokeRect(10, 10, w - 20, h - 20);
        c.fillStyle = '#b8455b';
        c.font = '700 34px Charm, cursive';
        c.textAlign = 'center';
        c.fillText('Chứng chỉ MC', w / 2, 80);
        c.fillStyle = '#3a2a2c';
        c.font = '700 40px Charm, cursive';
        c.fillText('Su', w / 2, 135);
      }),
    );
    add(
      new THREE.PlaneGeometry(0.38, 0.28),
      M(0xffffff, { map: t, roughness: 0.6 }),
      [0, 0, 0.011],
      null,
      g,
      false,
    );
  },
  flowerShop(g) {
    const sign = canvasTex(
      makeCanvas(512, 160, (c, w, h) => {
        c.fillStyle = '#fbe3e8';
        c.beginPath();
        c.roundRect(6, 6, w - 12, h - 12, 30);
        c.fill();
        c.strokeStyle = '#d9687d';
        c.lineWidth = 8;
        c.stroke();
        c.fillStyle = '#b8455b';
        c.font = '700 58px Charm, cursive';
        c.textAlign = 'center';
        c.fillText('Tiệm hoa của Su', w / 2, h / 2 + 26);
      }),
    );
    add(RB(0.06, 1.0, 0.06, 0.01), M(0xb88d68), [-0.4, 0.5, 0], null, g);
    add(RB(0.06, 1.0, 0.06, 0.01), M(0xb88d68), [0.4, 0.5, 0], null, g);
    add(RB(0.9, 0.28, 0.03, 0.01), M(0xffffff, { map: sign, roughness: 0.6 }), [0, 0.92, 0], null, g);
    for (let k = 0; k < 3; k++) {
      const x = -0.28 + k * 0.28;
      add(
        new THREE.CylinderGeometry(0.09, 0.07, 0.22, 20),
        M(0xd9cfc3, { metalness: 0.6, roughness: 0.35 }),
        [x, 0.11, 0.05],
        null,
        g,
      );
      for (let f = 0; f < 7; f++)
        add(
          new THREE.SphereGeometry(0.035, 12, 8),
          M([0xfff6f0, 0xf4a6b6, 0x9fb6dc][k], { roughness: 0.6 }),
          [x + rnd(-0.05, 0.05), 0.27 + rnd(0, 0.08), 0.05 + rnd(-0.05, 0.05)],
          null,
          g,
        );
    }
  },
  notebook(g) {
    add(RB(0.2, 0.025, 0.27, 0.006), M(0xd9687d, { roughness: 0.6 }), [0, 0.0125, 0], null, g);
    add(RB(0.19, 0.02, 0.26, 0.004), M(0xfffaf2), [0.004, 0.013, 0], null, g);
    const t = canvasTex(
      makeCanvas(128, 160, (c, w) => {
        c.fillStyle = '#d9687d';
        c.fillRect(0, 0, w, 160);
        c.fillStyle = '#fff4f6';
        c.font = '700 22px Charm, cursive';
        c.textAlign = 'center';
        c.fillText('Sổ tay', w / 2, 70);
        c.fillText('về em', w / 2, 98);
      }),
    );
    add(
      new THREE.PlaneGeometry(0.19, 0.25),
      M(0xffffff, { map: t }),
      [0, 0.0256, 0],
      [-Math.PI / 2, 0, 0],
      g,
    );
  },
};

export interface KeepsakeSet {
  items: Interactable[];
  jar: THREE.Group;
  jarGlow: THREE.PointLight;
  bubbleSource: THREE.Object3D;
  fishTank: THREE.Group;
}

const LABELS: Record<string, string> = {
  lily: 'Hoa ly',
  album: 'Album photobooth',
  heartBox: 'Hộp gương trái tim',
  phin: 'Phin và móc khóa',
  cactus: 'Chậu xương rồng',
  hydrangea: 'Cẩm tú cầu xanh',
  kitty: 'Bé Hello Kitty',
  bubu: 'Bubu và Dudu',
  stitch: 'Bé Stitch',
  pajamaBear: 'Gấu mặc đồ ngủ',
  chickenPlush: 'Gà rán gấu bông',
  camera: 'Máy ảnh cơ',
  mic: 'Micro MC',
  roses: 'Hồng Ecuador',
  giftBox: 'Hộp quà xanh có nơ',
  lanterns: 'Hai lồng đèn',
  gongcha: 'Gongcha khoai môn',
  raincoats: 'Áo mưa đỏ, áo mưa xanh',
  bubbles: 'Đồ thổi bong bóng',
  yarn: 'Cuộn len',
  chalk: 'Phấn cho cô giáo',
  jacket: 'Áo khoác của anh',
  shellCar: 'Xe vỏ sò',
  guava: 'Ổi chùa',
  banhTrang: 'Hũ bánh tráng',
  radio: 'Chiếc radio',
  perfume: 'Nước hoa',
  controller: 'Tay cầm game',
  tenOClock: 'Hoa mười giờ',
  maskToy: 'Mặt nạ',
  kfc: 'Xô gà rán',
  pizza: 'Hộp pizza',
  certificate: 'Chứng chỉ MC',
  flowerShop: 'Tiệm hoa của Su',
  notebook: 'Sổ tay về em',
  bear: 'Con gấu săn sale',
  tank: 'Bể cá bảy màu',
};
export const KEEPSAKE_IDS = Object.keys(LABELS);

export function buildKeepsakes(root: THREE.Group, a: Assets, f: Furniture): KeepsakeSet {
  const items: Interactable[] = [];
  const desk = topOf(f.anchors.desk),
    table = topOf(f.anchors.table),
    night = topOf(f.anchors.nightstand),
    dress = topOf(f.anchors.dresser);
  const bed = topOf(f.anchors.bed),
    shelf = topOf(f.anchors.shelf),
    book = topOf(f.anchors.bookcase),
    cab = topOf(f.anchors.cabinet);
  const sillY = WIN.y - WIN.h / 2 - 0.045,
    sillZ = -RD / 2 + 0.12;
  const at = (id: string, x: number, y: number, z: number, s = 1, ry = 0) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = ry;
    g.scale.setScalar(s);
    root.add(g);
    if (BUILD[id]) BUILD[id](g, a);
    g.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    items.push({ id, label: LABELS[id], object: g, kind: id === 'notebook' ? 'notebook' : 'keepsake' });
    void swapInDesignerModel(id, g); // the designer's model replaces this one once it loads
    return g;
  };
  // desk
  at('lily', desk.c.x - 0.6, desk.y, desk.c.z - 0.1, 0.75);
  at('album', desk.c.x - 0.15, desk.y, desk.c.z + 0.12, 1, 0.28);
  at('heartBox', desk.c.x + 0.18, desk.y, desk.c.z + 0.15, 0.7, -0.35);
  at('phin', desk.c.x + 0.25, desk.y, desk.c.z - 0.2, 0.7);
  at('notebook', desk.c.x - 0.35, desk.y, desk.c.z + 0.2, 1, 0.15);
  at('chalk', desk.c.x + 0.05, desk.y, desk.c.z - 0.1, 1, -0.2);
  // window sill
  at('cactus', WIN.x - 0.55, sillY, sillZ, 0.6);
  at('tenOClock', WIN.x, sillY, sillZ, 0.8);
  // chair back: the jacket
  const ch = topOf(f.anchors.chair);
  at('jacket', ch.c.x, ch.y - 0.32, ch.c.z + 0.18, 1, f.anchors.chair.rotation.y);
  // nightstand
  at('lanterns', night.c.x, night.y, night.c.z - 0.08, 0.9, -Math.PI / 2);
  at('gongcha', night.c.x - 0.05, night.y, night.c.z + 0.14, 0.75);
  at('radio', night.c.x - 0.1, 0, night.c.z - 0.65, 1, -Math.PI / 2);
  // bed
  at('stitch', bed.c.x + 0.65, bed.y - 0.02, bed.c.z - 0.35, 1.35, -Math.PI / 2 - 0.3);
  at('pajamaBear', bed.c.x + 0.55, bed.y - 0.18, bed.c.z + 0.3, 1, -Math.PI / 2 + 0.3); // on the softer, lower duvet
  at('chickenPlush', bed.c.x - 0.3, bed.y - 0.17, bed.c.z, 1.5, 0.6).rotation.z = Math.PI / 2.4;
  // dresser (front wall, facing -z)
  at('roses', dress.c.x, dress.y, dress.c.z, 1);
  at('camera', dress.c.x + 0.42, dress.y, dress.c.z, 1, Math.PI + 0.4);
  at('mic', dress.c.x - 0.42, dress.y, dress.c.z, 1);
  at('perfume', dress.c.x + 0.22, dress.y, dress.c.z + 0.05, 1);
  at('giftBox', dress.c.x + 0.95, 0, dress.c.z - 0.2, 1, 0.3);
  // shelf on the left wall
  at('bear', shelf.c.x + 0.02, shelf.y, shelf.c.z + 0.5, 0.42, Math.PI / 2);
  at('hydrangea', shelf.c.x, shelf.y, shelf.c.z - 0.05, 0.6);
  at('kitty', shelf.c.x + 0.02, shelf.y, shelf.c.z - 0.55, 0.5, Math.PI / 2.2);
  at('bubu', shelf.c.x + 0.02, shelf.y, shelf.c.z + 0.18, 1, Math.PI / 2.1);
  // coat rack: raincoats
  at('raincoats', -RW / 2 + 0.06, 1.62, 1.9, 1, Math.PI / 2);
  at('certificate', -RW / 2 + 0.02, 2.25, -0.2, 1, Math.PI / 2);
  // bookcase shelves
  at('shellCar', book.c.x + 0.05, 0.12 + 0.62 * 1 + 0.02, book.c.z - 0.3, 1, Math.PI / 2);
  at('maskToy', book.c.x + 0.05, 0.12 + 0.62 * 2 + 0.02, book.c.z + 0.25, 1, Math.PI / 2);
  at('controller', book.c.x + 0.05, 0.12 + 0.02, book.c.z + 0.3, 1, Math.PI / 2);
  // coffee table
  at('bubbles', table.c.x + 0.2, table.y, table.c.z - 0.15, 1);
  at('guava', table.c.x - 0.18, table.y, table.c.z + 0.05, 0.8);
  at('banhTrang', table.c.x + 0.05, table.y, table.c.z + 0.25, 0.9);
  at('kfc', table.c.x - 0.05, table.y, table.c.z - 0.25, 0.8);
  // floor
  at('yarn', -1.2, 0, 2.5, 1);
  at('pizza', -2.6, 0, 2.4, 1, 0.4);
  at('flowerShop', -3.4, 0, -RD / 2 + 0.45, 1);

  // fish tank on the low cabinet
  const fishTank = new THREE.Group();
  fishTank.position.set(cab.c.x, cab.y, cab.c.z);
  fishTank.scale.setScalar(0.75);
  root.add(fishTank);
  add(RB(0.55, 0.45, 1.0, 0.015), glass(0.3), [0, 0.225, 0], null, fishTank, false, false);
  add(
    new THREE.BoxGeometry(0.51, 0.36, 0.96),
    new THREE.MeshStandardMaterial({ color: 0x4aa3cf, transparent: true, opacity: 0.18, depthWrite: false }),
    [0, 0.2, 0],
    null,
    fishTank,
    false,
    false,
  );
  add(new THREE.BoxGeometry(0.51, 0.05, 0.96), M(0xe6d3b3, { roughness: 1 }), [0, 0.035, 0], null, fishTank);
  for (let k = 0; k < 9; k++) {
    const h = rnd(0.12, 0.28);
    add(
      new THREE.ConeGeometry(0.012, h, 5),
      M(0x4f8f4f),
      [rnd(-0.2, 0.2), 0.06 + h / 2, rnd(-0.42, 0.42)],
      [rnd(-0.25, 0.25), 0, rnd(-0.25, 0.25)],
      fishTank,
    );
  }
  const tl = new THREE.PointLight(0x8fd4ff, 0.25, 1.0, 2);
  tl.position.set(0, 0.4, 0);
  fishTank.add(tl);
  // guppies (bảy màu) and mollies, the fish she picked on 27.09: a soft body and a fanned tail each.
  // Built here rather than loaded: a rigged fish model ignores its parent's scale and renders huge.
  const FISH = [0xff7a59, 0x6fd3ff, 0xffd34d, 0xff6fae, 0x9b7bff, 0x6fe3a5, 0x3a3340];
  for (let k = 0; k < FISH.length; k++) {
    const c = FISH[k];
    const fish = new THREE.Group();
    fishTank.add(fish);
    add(
      new THREE.SphereGeometry(0.02, 14, 10),
      M(c, { emissive: c, emissiveIntensity: 0.25, roughness: 0.3 }),
      [0, 0, 0],
      null,
      fish,
      false,
    ).scale.set(1.7, 0.95, 0.8);
    const tail = add(
      new THREE.ConeGeometry(0.024, 0.04, 12),
      M(c, { transparent: true, opacity: 0.85, roughness: 0.4 }),
      [-0.045, 0, 0],
      [0, 0, Math.PI / 2],
      fish,
      false,
    );
    tail.scale.z = 0.25;
    add(
      new THREE.SphereGeometry(0.004, 6, 4),
      M(0x111111, { roughness: 0.2 }),
      [0.024, 0.005, 0.012],
      null,
      fish,
      false,
    );
    fish.userData = {
      keep: true, // swimming fish stay when the designer's tank replaces the code-built glass
      r: rnd(0.08, 0.18),
      s: rnd(0.4, 0.9) * (k % 2 ? 1 : -1),
      ph: rnd(0, 6),
      y: rnd(0.1, 0.3),
      cz: rnd(-0.2, 0.2),
      fish: true,
    };
  }
  items.push({ id: 'tank', label: LABELS.tank, object: fishTank, kind: 'keepsake' });
  // not via swapInDesignerModel (it clears the group): the fish and the tank light must stay.
  // The group is scaled 0.75 for the code-built tank; the model is already true size. Long side along z.
  void swapInDesignerPiece('keepsake-fish-tank', fishTank, 'floor', { rotY: Math.PI / 2 });

  // firefly jar on the sill
  const jar = new THREE.Group();
  jar.position.set(WIN.x + 0.6, sillY, sillZ);
  jar.scale.setScalar(0.6);
  root.add(jar);
  add(
    new THREE.LatheGeometry(
      [
        [0, 0],
        [0.13, 0],
        [0.15, 0.04],
        [0.15, 0.3],
        [0.11, 0.36],
        [0.1, 0.4],
      ].map((p) => new THREE.Vector2(...p)),
      40,
    ),
    glass(0.45),
    [0, 0, 0],
    null,
    jar,
    false,
    false,
  );
  add(
    new THREE.CylinderGeometry(0.1, 0.1, 0.06, 28),
    M(0xb8875a, { roughness: 0.9 }),
    [0, 0.43, 0],
    null,
    jar,
  );
  const jarGlow = new THREE.PointLight(0xffd27a, 0, 1.6, 2);
  jarGlow.position.set(0, 0.2, 0);
  jar.add(jarGlow);
  items.push({ id: 'jar', label: 'Hũ đom đóm', object: jar, kind: 'jar' });
  // only the glass and lid are replaced: the jar group and its glow light keep their identity
  void swapInDesignerPiece('keepsake-firefly-jar', jar, 'floor');

  const bubbleSource = items.find((i) => i.id === 'bubbles')!.object;
  return { items, jar, jarGlow, bubbleSource, fishTank };
}
