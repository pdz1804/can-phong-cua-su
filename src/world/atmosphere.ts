/**
 * Lights and living details: lamp, moonlight through the window, rain, lightning, dust in the light,
 * fireflies (jar → heart in the finale), soap bubbles, the big glowing lily, and stars.
 */
import * as THREE from 'three';
import { add, canvasTex, makeCanvas, M, rnd } from './kit';
import { Preset } from './weather';
import { RD, RH, RW, WIN } from './room';

export interface Atmosphere {
  update(dt: number, t: number, ctx: { jarWorld: THREE.Vector3; glow: number; finaleT: number }): void;
  applyPreset(p: Preset): void;
  releaseFireflies(): void;
  releaseBubbles(from: THREE.Vector3): void;
  flash(): void;
  wet: () => number;
  moon: THREE.DirectionalLight;
}

export function buildAtmosphere(scene: THREE.Scene, lampWorld: THREE.Vector3, mobile: boolean): Atmosphere {
  const hemi = new THREE.HemisphereLight(0xffd8c4, 0x4a2e24, 0.35);
  scene.add(hemi);
  const lampSpot = new THREE.SpotLight(0xffc690, 5.5, 7, Math.PI / 2.6, 0.9, 1.5);
  lampSpot.position.copy(lampWorld);
  lampSpot.target.position.set(lampWorld.x - 0.6, 0, lampWorld.z + 1.2);
  lampSpot.castShadow = true;
  lampSpot.shadow.mapSize.set(mobile ? 512 : 2048, mobile ? 512 : 2048);
  lampSpot.shadow.bias = -0.0003;
  lampSpot.shadow.normalBias = 0.02;
  scene.add(lampSpot, lampSpot.target);
  const lampGlow = new THREE.PointLight(0xffc28a, 1.6, 6, 1.6);
  lampGlow.position.copy(lampWorld).add(new THREE.Vector3(0, -0.05, 0.15));
  scene.add(lampGlow);
  const moon = new THREE.DirectionalLight(0x9fb0ff, 0.85);
  moon.position.set(WIN.x + 2.5, WIN.y + 4.5, -RD / 2 - 6);
  moon.target.position.set(WIN.x - 0.6, 0, -0.6);
  moon.castShadow = !mobile;
  moon.shadow.mapSize.set(2048, 2048);
  Object.assign(moon.shadow.camera, { left: -6.5, right: 6.5, top: 6.5, bottom: -6.5, near: 1, far: 24 });
  moon.shadow.bias = -0.0005;
  moon.shadow.normalBias = 0.03;
  scene.add(moon, moon.target);
  const fills = [
    new THREE.PointLight(0xffc98a, 1.3, 7, 1.8), // string lights
    new THREE.PointLight(0xffa58a, 0.6, 10, 1.6), // room
    new THREE.PointLight(0xffc48a, 0.9, 6, 1.8), // front wall / polaroids
    new THREE.PointLight(0xff6f98, 1.4, 4, 1.8), // neon heart
    new THREE.PointLight(0xffd9a8, 0.9, 5, 1.8), // hallway wall lamp
  ];
  fills[0].position.set(-1.2, RH - 0.4, -RD / 2 + 0.6);
  fills[1].position.set(1.5, 2.4, 1.5);
  fills[2].position.set(0, 2.1, RD / 2 - 0.7);
  fills[3].position.set(RW / 2 - 0.4, 2.1, 0.7);
  fills[4].position.set(-4.1, 2.2, RD / 2 + 1.4);
  fills.forEach((l) => scene.add(l));

  // soft additive beams (lamp cone, moonlight shaft)
  const beamMat = (color: number, strength: number) =>
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: { uColor: { value: new THREE.Color(color) }, uStr: { value: strength } },
      vertexShader:
        'varying vec3 vN;varying vec3 vV;varying float vY;void main(){vY=uv.y;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
      fragmentShader:
        'uniform vec3 uColor;uniform float uStr;varying vec3 vN;varying vec3 vV;varying float vY;void main(){float f=pow(abs(dot(vN,vV)),2.2);gl_FragColor=vec4(uColor*f*uStr*smoothstep(0.,1.,vY),1.);}',
    });
  const lampBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.75, 0.78, 48, 1, true),
    beamMat(0xffc690, 0.07),
  );
  lampBeam.position.copy(lampWorld).add(new THREE.Vector3(-0.05, -0.4, 0.08));
  scene.add(lampBeam);
  const moonBeamMat = beamMat(0x8ea8ff, 0.07);
  const moonBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(WIN.w * 0.38, WIN.w * 0.62, 4.2, 4, 1, true),
    moonBeamMat,
  );
  moonBeam.rotation.set(-0.72, Math.PI / 4, 0);
  moonBeam.position.set(WIN.x - 0.35, 1.15, -RD / 2 + 1.35);
  moonBeam.scale.set(1, 1, 0.45);
  scene.add(moonBeam);

  const sprite = canvasTex(
    makeCanvas(64, 64, (g, w) => {
      const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      gr.addColorStop(0, 'rgba(255,240,190,1)');
      gr.addColorStop(0.25, 'rgba(255,214,130,.75)');
      gr.addColorStop(1, 'rgba(255,200,90,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, w, w);
    }),
  );
  // dust motes drifting in the window light
  const DUST = mobile ? 80 : 220;
  const dustGeo = new THREE.BufferGeometry(),
    dustPos = new Float32Array(DUST * 3),
    dustV: THREE.Vector3[] = [];
  for (let i = 0; i < DUST; i++) {
    dustPos.set([WIN.x + rnd(-1.2, 0.9), rnd(0.2, 2.4), -RD / 2 + rnd(0.3, 2.4)], i * 3);
    dustV.push(new THREE.Vector3(rnd(-0.02, 0.02), rnd(-0.01, 0.015), rnd(-0.02, 0.02)));
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  scene.add(
    new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({
        map: sprite,
        size: 0.018,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        color: 0xfff0d8,
      }),
    ),
  );

  // rain outside the window
  const RAIN = mobile ? 320 : 900;
  const rainGeo = new THREE.BufferGeometry(),
    rainPos = new Float32Array(RAIN * 6);
  for (let i = 0; i < RAIN; i++) {
    const x = WIN.x + rnd(-5, 5),
      y = rnd(-1, 6),
      z = rnd(-11, -5.4);
    rainPos.set([x, y, z, x - 0.02, y - 0.22, z], i * 6);
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  const rainMat = new THREE.LineBasicMaterial({ color: 0x9fb7ee, transparent: true, opacity: 0.5 });
  scene.add(new THREE.LineSegments(rainGeo, rainMat));

  // stars + big glowing lily outside (finale, and the clear-night preset shows stars)
  const starGeo = new THREE.BufferGeometry(),
    starPos = new Float32Array(500 * 3);
  for (let i = 0; i < 500; i++) starPos.set([WIN.x + rnd(-13, 13), rnd(2, 11), -14.5], i * 3);
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.06, transparent: true, opacity: 0 });
  scene.add(new THREE.Points(starGeo, starMat));
  const bigLily = new THREE.Group();
  bigLily.position.set(WIN.x, 0.2, -9);
  bigLily.scale.setScalar(0.001);
  scene.add(bigLily);
  {
    const pm = new THREE.MeshStandardMaterial({
      color: 0xfff6f0,
      emissive: 0xffd6e0,
      emissiveIntensity: 0.9,
      roughness: 0.4,
      side: THREE.DoubleSide,
    });
    for (let p = 0; p < 6; p++) {
      const ang = (p / 6) * Math.PI * 2;
      const pt = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), pm);
      pt.scale.set(0.42, 1.6, 0.12);
      pt.position.set(Math.cos(ang) * 0.9, 1.1, Math.sin(ang) * 0.9);
      pt.rotation.order = 'YXZ';
      pt.rotation.y = -ang + Math.PI / 2;
      pt.rotation.x = 0.9;
      bigLily.add(pt);
    }
    add(
      new THREE.SphereGeometry(0.35, 20, 16),
      M(0xffd56a, { emissive: 0xffb340, emissiveIntensity: 2 }),
      [0, 0.6, 0],
      null,
      bigLily,
      false,
      false,
    );
  }

  // fireflies
  const FF = 48;
  const ffGeo = new THREE.BufferGeometry(),
    ffPos = new Float32Array(FF * 3);
  ffGeo.setAttribute('position', new THREE.BufferAttribute(ffPos, 3));
  const ffMat = new THREE.PointsMaterial({
    map: sprite,
    size: 0.09,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    color: 0xffe7a3,
  });
  const ffPts = new THREE.Points(ffGeo, ffMat);
  ffPts.frustumCulled = false;
  scene.add(ffPts);
  const ff = Array.from({ length: FF }, (_, i) => {
    const t = (i / FF) * Math.PI * 2;
    const hx = 16 * Math.pow(Math.sin(t), 3),
      hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return {
      p: new THREE.Vector3(),
      v: new THREE.Vector3(),
      ph: rnd(0, 6),
      free: false,
      heart: new THREE.Vector3(WIN.x + hx * 0.11, 4.9 + hy * 0.11, -8),
    };
  });

  // soap bubbles
  const bubMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0,
    transmission: 1,
    thickness: 0.001,
    transparent: true,
    opacity: 0.35,
    iridescence: 1,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [200, 800],
    envMapIntensity: 2,
    depthWrite: false,
  });
  const bubGeo = new THREE.SphereGeometry(1, 24, 16);
  const bubbles = Array.from({ length: mobile ? 10 : 18 }, () => {
    const m = new THREE.Mesh(bubGeo, bubMat);
    m.visible = false;
    scene.add(m);
    return { m, v: new THREE.Vector3(), life: 0, r: 0, delay: 0 };
  });

  let flash = 0,
    wet = 1,
    rainOn = true,
    baseMoon = 0.85,
    starsOn = false;
  const tmp = new THREE.Vector3();
  return {
    moon,
    wet: () => wet,
    applyPreset(p) {
      rainOn = p.rain;
      starsOn = p.stars;
      baseMoon = p.moon.intensity;
      moon.color.setHex(p.moon.color);
      hemi.color.setHex(p.hemi.sky);
      hemi.groundColor.setHex(p.hemi.ground);
      hemi.intensity = p.hemi.intensity;
      lampSpot.intensity = 5.5 * p.lampScale;
      lampGlow.intensity = 1.6 * p.lampScale;
      moonBeamMat.uniforms.uStr.value = p.rain ? 0.07 : 0.1;
      (moonBeamMat.uniforms.uColor.value as THREE.Color).setHex(p.moon.color);
    },
    releaseFireflies() {
      ff.forEach((f) => {
        f.free = true;
        f.v.set(rnd(-0.3, 0.3), rnd(0.4, 0.9), rnd(-0.6, -0.2));
      });
    },
    releaseBubbles(from) {
      bubbles.forEach((b, i) => {
        b.life = rnd(5, 9);
        b.r = rnd(0.03, 0.08);
        b.m.visible = true;
        b.m.scale.setScalar(0.001);
        b.m.position.copy(from).add(new THREE.Vector3(rnd(-0.05, 0.05), 0.15, rnd(-0.05, 0.05)));
        b.v.set(rnd(-0.25, 0.25), rnd(0.12, 0.35), rnd(-0.25, 0.25));
        b.delay = i * 0.12;
      });
    },
    flash() {
      if (rainOn && wet > 0.5) flash = 1;
    },
    update(dt, T, ctx) {
      const targetWet = rainOn && ctx.finaleT < 0 ? 1 : 0;
      wet += (targetWet - wet) * Math.min(1, dt * 0.4);
      if (wet > 0.01) {
        const rp = rainGeo.attributes.position.array as Float32Array,
          fall = dt * 7.5;
        for (let i = 0; i < RAIN; i++) {
          const o = i * 6;
          rp[o + 1] -= fall;
          rp[o + 4] -= fall;
          if (rp[o + 4] < -1) {
            const y = 6 + rnd(0, 0.5);
            rp[o + 1] = y;
            rp[o + 4] = y - 0.22;
          }
        }
        rainGeo.attributes.position.needsUpdate = true;
      }
      rainMat.opacity = 0.5 * wet;
      flash = Math.max(0, flash - dt * (flash > 0.6 ? 2.5 : 1.2));
      const fl = flash > 0 ? flash * (0.6 + 0.4 * Math.sin(T * 50)) : 0;
      moon.intensity = baseMoon + fl * 9;
      const fin = ctx.finaleT;
      starMat.opacity += ((starsOn || fin >= 0 ? 1 : 0) - starMat.opacity) * Math.min(1, dt * 0.6);
      if (fin >= 0) {
        const b = THREE.MathUtils.clamp((fin - 2) / 4, 0, 1);
        const e = b < 0.5 ? 4 * b * b * b : 1 - Math.pow(-2 * b + 2, 3) / 2;
        bigLily.scale.setScalar(0.001 + e * 0); // the finale set's Sala flower replaces this
        bigLily.rotation.y += dt * 0.08;
      }
      const dp = dustGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < DUST; i++) {
        const v = dustV[i];
        dp[i * 3] += v.x * dt + Math.sin(T * 0.3 + i) * 0.0006;
        dp[i * 3 + 1] += v.y * dt;
        dp[i * 3 + 2] += v.z * dt;
        if (dp[i * 3 + 1] > 2.5) dp[i * 3 + 1] = 0.2;
        if (dp[i * 3 + 1] < 0.2) dp[i * 3 + 1] = 2.5;
      }
      dustGeo.attributes.position.needsUpdate = true;
      const lit = Math.round(ctx.glow * FF);
      ff.forEach((f, i) => {
        if (!f.free) {
          f.ph += dt * (0.8 + (i % 5) * 0.3);
          tmp.set(
            Math.sin(f.ph * 1.3 + i) * 0.05,
            0.07 + ((Math.sin(f.ph * 0.7 + i * 1.7) + 1) / 2) * 0.12,
            Math.cos(f.ph + i) * 0.05,
          );
          f.p.copy(ctx.jarWorld).add(tmp);
          if (i >= lit) f.p.y = -50;
        } else {
          if (fin > 2.5) {
            tmp
              .copy(f.heart)
              .add(new THREE.Vector3(Math.sin(T * 2 + i) * 0.04, Math.cos(T * 1.7 + i) * 0.04, 0));
            f.v.lerp(tmp.sub(f.p).multiplyScalar(1.2), Math.min(1, dt * 2));
          } else if (fin >= 0) {
            f.v.x += rnd(-1, 1) * dt;
            f.v.y += rnd(-0.5, 1) * dt;
            f.v.z += rnd(-1, 0.2) * dt;
          } else {
            f.v.x += rnd(-1, 1) * dt;
            f.v.y += (rnd(-1, 1) - 0.05 * (f.p.y - 1.8)) * dt;
            f.v.z += rnd(-1, 1) * dt;
            f.v.multiplyScalar(0.985);
            f.p.x = THREE.MathUtils.clamp(f.p.x, -4.5, 4.5);
            f.p.z = THREE.MathUtils.clamp(f.p.z, -4.5, 4.5);
            f.p.y = THREE.MathUtils.clamp(f.p.y, 0.4, 2.9);
          }
          if (f.p.y < -10) f.p.copy(ctx.jarWorld).add(new THREE.Vector3(0, 0.15, 0));
          f.p.addScaledVector(f.v, dt);
        }
        ffPos.set([f.p.x, f.p.y, f.p.z], i * 3);
      });
      ffGeo.attributes.position.needsUpdate = true;
      ffMat.size = (fin >= 0 ? 0.16 : ff[0].free ? 0.1 : 0.07) + Math.sin(T * 3) * 0.012;
      bubbles.forEach((b) => {
        if (!b.m.visible) return;
        if (b.delay > 0) {
          b.delay -= dt;
          return;
        }
        b.life -= dt;
        b.v.x += Math.sin(T * 1.3 + b.r * 99) * dt * 0.08;
        b.m.position.addScaledVector(b.v, dt);
        b.v.multiplyScalar(0.995);
        const s =
          b.life > 0.25 ? Math.min(b.r, b.m.scale.x + dt * 0.2) : b.r * Math.max(0, b.life / 0.25) * 1.3;
        b.m.scale.setScalar(Math.max(0.001, s));
        if (b.life <= 0) b.m.visible = false;
      });
    },
  };
}
