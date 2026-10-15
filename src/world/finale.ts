/**
 * The finale set: the room's walls and ceiling dissolve, leaving the room afloat under an open
 * night sky above a still river (Sala, 25.07). A giant flower blooms — the one they took photos on —
 * petals drift down, and two little figures stand beside it holding hands: her in the green dress
 * she wore that day, him in cream.
 */
import * as THREE from 'three';
import { add, canvasTex, M, makeCanvas, rnd } from './kit';
import { WIN } from './room';

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export interface Finale {
  /** Seconds since the finale began, or -1 when it is not running. */
  update(dt: number, finaleT: number): void;
  /** Bring the room back exactly as it was ("Ở lại trong phòng"). */
  restore(): void;
}

export function buildFinale(scene: THREE.Scene, shell: THREE.Mesh[]): Finale {
  const set = new THREE.Group();
  set.visible = false;
  scene.add(set);
  const FX = WIN.x,
    FZ = -9;

  // open night sky all around (a dome), with its own stars
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(42, 48, 24),
    new THREE.MeshBasicMaterial({
      map: canvasTex(
        makeCanvas(32, 512, (g, w, h) => {
          const gr = g.createLinearGradient(0, 0, 0, h);
          gr.addColorStop(0, '#05060f');
          gr.addColorStop(0.42, '#141a3d');
          gr.addColorStop(0.5, '#4a3460');
          gr.addColorStop(0.53, '#1b2140');
          gr.addColorStop(1, '#0b0d1c');
          g.fillStyle = gr;
          g.fillRect(0, 0, w, h);
        }),
      ),
      side: THREE.BackSide,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  );
  set.add(dome);
  const starPos = new Float32Array(900 * 3);
  for (let i = 0; i < 900; i++) {
    const u = rnd(0, Math.PI * 2),
      v = rnd(0.05, 1.45),
      r = 38;
    starPos.set([Math.cos(u) * Math.cos(v) * r, Math.sin(v) * r, Math.sin(u) * Math.cos(v) * r], i * 3);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xfff6e6,
    size: 0.12,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  set.add(new THREE.Points(starGeo, starMat));

  // a still river that mirrors the sky
  const river = add(
    new THREE.CircleGeometry(30, 64),
    new THREE.MeshStandardMaterial({
      color: 0x1a2142,
      metalness: 0.85,
      roughness: 0.12,
      envMapIntensity: 1.2,
      transparent: true,
      opacity: 0,
    }),
    [0, -0.04, 0],
    [-Math.PI / 2, 0, 0],
    set,
    false,
    true,
  );

  // the giant flower of Sala: pink petals around a glowing heart, on a tall stem
  const flower = new THREE.Group();
  flower.position.set(FX, 0, FZ);
  flower.scale.setScalar(0.001);
  set.add(flower);
  add(new THREE.CylinderGeometry(0.06, 0.09, 2.2, 12), M(0x5e8a52), [0, 1.1, 0], null, flower);
  const head = new THREE.Group();
  head.position.y = 2.25;
  head.rotation.x = 0.35;
  flower.add(head);
  for (let ring = 0; ring < 2; ring++)
    for (let p = 0; p < 8; p++) {
      const a = (p / 8) * Math.PI * 2 + ring * 0.4;
      const petal = new THREE.Mesh(
        new THREE.SphereGeometry(1, 28, 16),
        new THREE.MeshStandardMaterial({
          color: ring ? 0xffd6e0 : 0xf7a8bb,
          emissive: ring ? 0xffc2d1 : 0xe8738f,
          emissiveIntensity: 0.55,
          roughness: 0.5,
          side: THREE.DoubleSide,
        }),
      );
      petal.scale.set(0.42 - ring * 0.1, 1.15 - ring * 0.3, 0.1);
      petal.rotation.order = 'YXZ';
      petal.rotation.y = -a + Math.PI / 2;
      petal.rotation.x = 1.15 - ring * 0.35;
      petal.position.set(Math.cos(a) * (0.75 - ring * 0.25), 0, Math.sin(a) * (0.75 - ring * 0.25));
      head.add(petal);
    }
  add(
    new THREE.SphereGeometry(0.32, 24, 16),
    M(0xffd56a, { emissive: 0xffb340, emissiveIntensity: 1.8 }),
    [0, 0.08, 0],
    null,
    head,
    false,
    false,
  );
  const flowerLight = new THREE.PointLight(0xffb6c8, 0, 9, 1.5);
  flowerLight.position.set(FX, 2.6, FZ + 1.2);
  scene.add(flowerLight); // in the scene from the start (intensity 0): a light appearing later recompiles every material

  // the two of them, beside the flower, holding hands
  const couple = new THREE.Group();
  couple.position.set(FX - 0.2, 0, FZ + 1.6);
  set.add(couple);
  const figure = (x: number, h: number, outfit: number, hair: number, dress: boolean) => {
    const f = new THREE.Group();
    f.position.x = x;
    couple.add(f);
    if (dress)
      add(
        new THREE.ConeGeometry(0.2 * h, 0.55 * h, 24),
        M(outfit, { roughness: 0.7 }),
        [0, 0.42 * h, 0],
        null,
        f,
      );
    else {
      add(
        new THREE.CapsuleGeometry(0.12 * h, 0.32 * h, 8, 16),
        M(outfit, { roughness: 0.7 }),
        [0, 0.6 * h, 0],
        null,
        f,
      );
      for (const s of [-1, 1])
        add(
          new THREE.CapsuleGeometry(0.05 * h, 0.35 * h, 6, 10),
          M(0x3b4a63),
          [s * 0.06 * h, 0.22 * h, 0],
          null,
          f,
        );
    }
    add(
      new THREE.SphereGeometry(0.14 * h, 24, 16),
      M(0xf3d2bd, { roughness: 0.6 }),
      [0, 0.98 * h, 0],
      null,
      f,
    );
    add(
      new THREE.SphereGeometry(0.148 * h, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.62),
      M(hair, { roughness: 0.5 }),
      [0, 1.0 * h, -0.01],
      null,
      f,
    );
    return f;
  };
  figure(-0.17, 1.05, 0xf4ead8, 0x2b1d18, false); // Phú
  figure(0.17, 0.95, 0x7fb09b, 0x3a2620, true); // Su, green dress
  add(new THREE.SphereGeometry(0.035, 12, 8), M(0xf3d2bd), [0, 0.55, 0.04], null, couple); // their hands

  // petals drifting down
  const PET = 220;
  const petPos = new Float32Array(PET * 3),
    petV: number[] = [];
  for (let i = 0; i < PET; i++) {
    petPos.set([FX + rnd(-7, 7), rnd(0, 8), FZ + rnd(-6, 8)], i * 3);
    petV.push(rnd(0.15, 0.4));
  }
  const petGeo = new THREE.BufferGeometry();
  petGeo.setAttribute('position', new THREE.BufferAttribute(petPos, 3));
  const petMat = new THREE.PointsMaterial({
    color: 0xffc2d1,
    size: 0.07,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  set.add(new THREE.Points(petGeo, petMat));

  // the room shell fades on its own copies of the materials, so restoring is exact
  const originals = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
  const fadeMats = new Map<THREE.Mesh, THREE.Material[]>();
  const hidden: THREE.Mesh[] = [];
  const begin = () => {
    for (const m of shell) {
      originals.set(m, m.material);
      if ((m.material as THREE.Material).type === 'ShaderMaterial') {
        hidden.push(m); // rainy-glass shader writes opaque alpha: hide it instead of fading a broken clone
        continue;
      }
      const mats = (Array.isArray(m.material) ? m.material : [m.material]).map((mt) => {
        const c = mt.clone();
        c.transparent = true;
        c.depthWrite = false; // a fading wall must not hide the sky behind it
        return c;
      });
      fadeMats.set(m, mats);
      m.material = Array.isArray(m.material) ? mats : mats[0];
    }
    set.visible = true;
  };

  let started = false;
  return {
    update(dt, t) {
      if (t < 0) return;
      if (!started) {
        started = true;
        begin();
      }
      const fade = ease(THREE.MathUtils.clamp(t / 3.5, 0, 1));
      for (const m of hidden) m.visible = fade < 0.35;
      for (const [m, mats] of fadeMats) {
        for (const mt of mats) mt.opacity = 1 - fade;
        m.visible = fade < 0.999;
      }
      (dome.material as THREE.MeshBasicMaterial).opacity = fade;
      starMat.opacity = fade;
      (river.material as THREE.MeshStandardMaterial).opacity = fade;
      const bloom = ease(THREE.MathUtils.clamp((t - 2.5) / 4, 0, 1));
      flower.scale.setScalar(0.001 + bloom * 1.25);
      head.rotation.y += dt * 0.12;
      flowerLight.intensity = bloom * 3;
      petMat.opacity = bloom * 0.9;
      for (let i = 0; i < PET; i++) {
        petPos[i * 3 + 1] -= petV[i] * dt;
        petPos[i * 3] += Math.sin(t * 0.8 + i) * dt * 0.08;
        if (petPos[i * 3 + 1] < 0) petPos[i * 3 + 1] = 8;
      }
      petGeo.attributes.position.needsUpdate = true;
    },
    restore() {
      for (const [m, mat] of originals) {
        m.material = mat;
        m.visible = true;
      }
      for (const mats of fadeMats.values()) for (const mt of mats) mt.dispose();
      originals.clear();
      fadeMats.clear();
      hidden.length = 0;
      flowerLight.intensity = 0;
      petMat.opacity = 0;
      head.rotation.y = 0;
      set.visible = false;
      started = false;
      flower.scale.setScalar(0.001);
    },
  };
}
