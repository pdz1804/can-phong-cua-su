/**
 * The building: Su's room (10 × 10 m) plus the hallway outside her door.
 * Room spans x,z ∈ [-5, 5]. The door is in the front wall (z = +5); the hallway is z ∈ [5, 8.6].
 * The window in the back wall (z = -5) is a real opening so moonlight and lightning come through.
 */
import * as THREE from 'three';
import { Assets } from './assets';
import { photoTexture } from './photos';
import { add, canvasTex, Colliders, M, makeCanvas, RB } from './kit';

export const RW = 10,
  RD = 10,
  RH = 3.2;
export const WIN = { x: 2.4, y: 1.95, w: 1.9, h: 1.5 };
export const DOOR = { x: -2.6, w: 1.0, h: 2.15 };
export const HALL = { x0: -4.6, x1: 0.6, z0: RD / 2, z1: RD / 2 + 3.6, h: 3.0 };

export interface Building {
  root: THREE.Group;
  ceiling: THREE.Mesh;
  frontWall: THREE.Mesh;
  hallCeiling: THREE.Mesh;
  door: THREE.Group;
  paneL: THREE.Group;
  paneR: THREE.Group;
  glassUniforms: {
    uBg: { value: THREE.Texture };
    uTime: { value: number };
    uWet: { value: number };
    uFlash: { value: number };
  };
  winGroup: THREE.Group;
  skyMat: THREE.MeshBasicMaterial;
}

function wallWithHoles(
  width: number,
  height: number,
  holes: { x: number; y: number; w: number; h: number }[],
) {
  const sh = new THREE.Shape([
    new THREE.Vector2(-width / 2, 0),
    new THREE.Vector2(width / 2, 0),
    new THREE.Vector2(width / 2, height),
    new THREE.Vector2(-width / 2, height),
  ]);
  for (const o of holes)
    sh.holes.push(
      new THREE.Path([
        new THREE.Vector2(o.x - o.w / 2, o.y - o.h / 2),
        new THREE.Vector2(o.x + o.w / 2, o.y - o.h / 2),
        new THREE.Vector2(o.x + o.w / 2, o.y + o.h / 2),
        new THREE.Vector2(o.x - o.w / 2, o.y + o.h / 2),
      ]),
    );
  const g = new THREE.ExtrudeGeometry(sh, { depth: 0.2, bevelEnabled: false });
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 2.5, uv.getY(i) / 2.5);
  return g;
}

export function buildRoom(scene: THREE.Scene, a: Assets, col: Colliders, skyTex: THREE.Texture): Building {
  const root = new THREE.Group();
  scene.add(root);
  const floorMat = new THREE.MeshStandardMaterial({
    map: a.floor.map,
    normalMap: a.floor.normal,
    roughnessMap: a.floor.rough,
    envMapIntensity: 0.5,
  });
  // Soft floral wallpaper (drawn once, tiled every 2.5 m) over a fine plaster normal map.
  // Shape-built walls use metre/2.5 UVs (repeat 1); box walls span 0..1 over 10 x 3.2 m (repeat 4 x 1.28).
  const paper = wallpaper();
  const wallMat = new THREE.MeshStandardMaterial({
    map: paper,
    normalMap: a.wall.normal,
    normalScale: new THREE.Vector2(0.35, 0.35),
    roughness: 0.92,
    envMapIntensity: 0.3,
  });
  const boxPaper = paper.clone();
  boxPaper.repeat.set(4, 1.28);
  boxPaper.needsUpdate = true;
  const boxWallMat = wallMat.clone();
  boxWallMat.map = boxPaper;
  // hallway: the same wallpaper, a little warmer, tiled for its shorter walls
  const hallPaper = paper.clone();
  hallPaper.repeat.set(2, 1.2);
  hallPaper.needsUpdate = true;
  const hallWallMat = wallMat.clone();
  hallWallMat.map = hallPaper;
  hallWallMat.color.set(0xfff4ea);
  const ceilMat = M(0xf4ebe3, { roughness: 1 });
  const trim = M(0xfaf4ec, { roughness: 0.5 });

  // ---- room shell
  add(new THREE.PlaneGeometry(RW, RD), floorMat, [0, 0, 0], [-Math.PI / 2, 0, 0], root, false, true);
  const ceiling = add(
    new THREE.PlaneGeometry(RW, RD),
    ceilMat,
    [0, RH, 0],
    [Math.PI / 2, 0, 0],
    root,
    false,
    true,
  );
  add(wallWithHoles(RW, RH, [WIN]), wallMat, [0, 0, -RD / 2 - 0.2], null, root, true, true);
  const frontWall = add(
    wallWithHoles(RW, RH, [{ x: -DOOR.x, y: DOOR.h / 2, w: DOOR.w, h: DOOR.h }]),
    wallMat,
    [0, 0, RD / 2 + 0.2],
    [0, Math.PI, 0],
    root,
    true,
    true,
  );
  add(new THREE.BoxGeometry(0.2, RH, RD), boxWallMat, [-RW / 2 - 0.1, RH / 2, 0], null, root, true, true);
  add(new THREE.BoxGeometry(0.2, RH, RD), boxWallMat, [RW / 2 + 0.1, RH / 2, 0], null, root, true, true);
  wainscot(root, trim);
  for (const [x, z, l, r] of [
    [0, -RD / 2 + 0.012, RW, 0],
    [0, RD / 2 - 0.012, RW, 0],
    [-RW / 2 + 0.012, 0, RD, Math.PI / 2],
    [RW / 2 - 0.012, 0, RD, Math.PI / 2],
  ] as const) {
    add(RB(l, 0.12, 0.025, 0.008), trim, [x, 0.06, z], [0, r, 0], root, false);
    add(RB(l, 0.07, 0.05, 0.01), trim, [x, RH - 0.035, z], [0, r, 0], root, false);
  }
  // walls as colliders (front wall split around the door)
  col.box(0, -RD / 2 - 0.1, RW + 0.4, 0.3);
  col.box(-RW / 2 - 0.1, 0, 0.3, RD + 0.4);
  col.box(RW / 2 + 0.1, 0, 0.3, RD + 0.4);
  const dl = DOOR.x - DOOR.w / 2 - -RW / 2,
    dr = RW / 2 - (DOOR.x + DOOR.w / 2);
  col.box(-RW / 2 + dl / 2, RD / 2 + 0.1, dl, 0.3);
  col.box(RW / 2 - dr / 2, RD / 2 + 0.1, dr, 0.3);

  // ---- hallway outside the door
  const hw = HALL.x1 - HALL.x0,
    hd = HALL.z1 - HALL.z0,
    hx = (HALL.x0 + HALL.x1) / 2,
    hz = (HALL.z0 + HALL.z1) / 2;
  const hallFloor = M(0xffffff, { map: a.floor.map.clone(), normalMap: a.floor.normal, roughness: 0.55 });
  (hallFloor.map as THREE.Texture).repeat.set(1.6, 1.2);
  (hallFloor.map as THREE.Texture).needsUpdate = true;
  add(new THREE.PlaneGeometry(hw, hd), hallFloor, [hx, 0.001, hz], [-Math.PI / 2, 0, 0], root, false, true);
  const hallCeiling = add(
    new THREE.PlaneGeometry(hw, hd),
    ceilMat,
    [hx, HALL.h, hz],
    [Math.PI / 2, 0, 0],
    root,
    false,
    true,
  );
  add(
    new THREE.BoxGeometry(hw, HALL.h, 0.2),
    hallWallMat,
    [hx, HALL.h / 2, HALL.z1 + 0.1],
    null,
    root,
    true,
    true,
  );
  add(
    new THREE.BoxGeometry(0.2, HALL.h, hd),
    hallWallMat,
    [HALL.x0 - 0.1, HALL.h / 2, hz],
    null,
    root,
    true,
    true,
  );
  add(
    new THREE.BoxGeometry(0.2, HALL.h, hd),
    hallWallMat,
    [HALL.x1 + 0.1, HALL.h / 2, hz],
    null,
    root,
    true,
    true,
  );
  col.box(hx, HALL.z1 + 0.1, hw + 0.4, 0.3);
  col.box(HALL.x0 - 0.1, hz, 0.3, hd + 0.4);
  col.box(HALL.x1 + 0.1, hz, 0.3, hd + 0.4);
  // a framed print at the end of the hallway
  {
    const f = new THREE.Group();
    f.position.set(hx, 1.6, HALL.z1 - 0.01);
    f.rotation.y = Math.PI;
    root.add(f);
    add(RB(0.9, 0.65, 0.03, 0.01), M(0x6b4a34, { roughness: 0.45 }), [0, 0, 0], null, f);
    const art = photoTexture('hall-print', 'sala', 640, 448);
    add(
      new THREE.PlaneGeometry(0.8, 0.56),
      M(0xffffff, { map: art, roughness: 0.6 }),
      [0, 0, 0.017],
      null,
      f,
      false,
    );
  }

  // ---- the door: frame, panel on a hinge, nameplate "Su", a little wreath
  const door = new THREE.Group();
  door.position.set(DOOR.x - DOOR.w / 2, 0, RD / 2 + 0.1);
  root.add(door);
  const doorMat = M(0xf7efe4, { roughness: 0.45 });
  add(RB(DOOR.w - 0.04, DOOR.h - 0.03, 0.05, 0.01), doorMat, [DOOR.w / 2, DOOR.h / 2, 0], null, door);
  for (const y of [1.55, 0.6]) {
    add(RB(0.7, 0.62, 0.012, 0.004), M(0xeee3d5, { roughness: 0.5 }), [DOOR.w / 2, y, 0.031], null, door);
    add(RB(0.7, 0.62, 0.012, 0.004), M(0xeee3d5, { roughness: 0.5 }), [DOOR.w / 2, y, -0.031], null, door);
  }
  for (const s of [1, -1])
    add(
      new THREE.SphereGeometry(0.035, 16, 12),
      M(0xd8c7a0, { metalness: 0.9, roughness: 0.25, envMapIntensity: 1.2 }),
      [DOOR.w - 0.12, 1.02, s * 0.06],
      null,
      door,
    );
  const plate = canvasTex(
    makeCanvas(256, 128, (g, w, h) => {
      g.fillStyle = '#fbe3e8';
      g.beginPath();
      g.roundRect(4, 4, w - 8, h - 8, 26);
      g.fill();
      g.strokeStyle = '#d9687d';
      g.lineWidth = 5;
      g.stroke();
      g.fillStyle = '#b8455b';
      g.font = '700 78px Charm, cursive';
      g.textAlign = 'center';
      g.fillText('Su', w / 2 - 10, h / 2 + 26);
      g.font = '40px serif';
      g.fillText('♡', w / 2 + 62, h / 2 + 20);
    }),
  );
  add(
    RB(0.36, 0.18, 0.015, 0.02),
    M(0xffffff, { map: plate, roughness: 0.4 }),
    [DOOR.w / 2, 1.95, 0.04],
    null,
    door,
  );
  {
    const wreath = new THREE.Group();
    wreath.position.set(DOOR.w / 2, 1.45, 0.06);
    door.add(wreath);
    add(
      new THREE.TorusGeometry(0.17, 0.035, 12, 40),
      M(0x6f9a5f, { roughness: 0.9 }),
      [0, 0, 0],
      null,
      wreath,
    );
    for (let i = 0; i < 10; i++) {
      const a2 = (i / 10) * Math.PI * 2;
      add(
        new THREE.SphereGeometry(0.03, 12, 8),
        M([0xf4a6b6, 0xfff3e6, 0xf6d36b][i % 3], { roughness: 0.6 }),
        [Math.cos(a2) * 0.17, Math.sin(a2) * 0.17, 0.03],
        null,
        wreath,
      );
    }
  }
  // door frame (both faces)
  for (const zf of [RD / 2 + 0.22, RD / 2 - 0.02]) {
    add(RB(DOOR.w + 0.16, 0.08, 0.06, 0.01), trim, [DOOR.x, DOOR.h + 0.04, zf], null, root);
    for (const sx of [-1, 1])
      add(
        RB(0.08, DOOR.h + 0.08, 0.06, 0.01),
        trim,
        [DOOR.x + sx * (DOOR.w / 2 + 0.04), DOOR.h / 2, zf],
        null,
        root,
      );
  }
  col.box(DOOR.x, RD / 2 + 0.1, DOOR.w, 0.3, 'door').userData.isDoor = true;

  // ---- window: frame, two hinged casements with the rainy-glass shader
  const winGroup = new THREE.Group();
  winGroup.position.set(WIN.x, WIN.y, -RD / 2 - 0.1);
  root.add(winGroup);
  for (const [x, y, w, h] of [
    [0, WIN.h / 2 + 0.04, WIN.w + 0.16, 0.08],
    [0, -WIN.h / 2 - 0.04, WIN.w + 0.16, 0.08],
  ])
    add(RB(w, h, 0.24, 0.015), trim, [x, y, 0], null, winGroup);
  for (const x of [-WIN.w / 2 - 0.04, WIN.w / 2 + 0.04])
    add(RB(0.08, WIN.h + 0.16, 0.24, 0.015), trim, [x, 0, 0], null, winGroup);
  add(RB(WIN.w + 0.5, 0.05, 0.32, 0.015), trim, [0, -WIN.h / 2 - 0.07, 0.2], null, winGroup);
  const glassUniforms = {
    uBg: { value: skyTex },
    uTime: { value: 0 },
    uWet: { value: 1 },
    uFlash: { value: 0 },
  };
  const glassMat = new THREE.ShaderMaterial({
    uniforms: glassUniforms,
    vertexShader:
      'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `varying vec2 vUv;uniform sampler2D uBg;uniform float uTime,uWet,uFlash;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    vec3 drop(vec2 uv,float sc,float t){vec2 st=uv*vec2(sc,sc*.75);vec2 id=floor(st);vec2 f=fract(st)-.5;float n=h(id);
      vec2 c=vec2(h(id+3.1)-.5,h(id+7.7)-.5)*.55;float slide=step(.82,n);c.y+=slide*(.5-fract(t*.18+n*3.));
      float r=.07+.13*h(id+1.3);vec2 d=(f-c)*vec2(1.,.85);float m=smoothstep(r,r*.55,length(d));
      float life=fract(t*.05+n*5.);m*=smoothstep(0.,.08,life)*smoothstep(1.,.85,life);return vec3(d*m,m);}
    void main(){vec2 uv=vec2(.3,.22)+vUv*vec2(.42,.55);vec3 a=drop(vUv,9.,uTime),b=drop(vUv+.37,17.,uTime*1.3);
      vec2 off=(a.xy*.35+b.xy*.25)*uWet;float m=max(a.z,b.z)*uWet;vec3 sharp=texture2D(uBg,uv-off).rgb;vec3 blur=vec3(0.);
      for(int i=0;i<8;i++){float an=float(i)*.785;blur+=texture2D(uBg,uv+vec2(cos(an),sin(an))*.012).rgb;}blur/=8.;
      vec3 col=mix(mix(sharp,blur,.85*uWet)+vec3(.03,.03,.05)*uWet,sharp*1.08,m);col+=vec3(.75,.8,1.)*uFlash;gl_FragColor=vec4(col,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
  });
  const casement = (hingeX: number, dir: number) => {
    const hinge = new THREE.Group();
    hinge.position.set(hingeX, 0, 0.02);
    winGroup.add(hinge);
    const pw = WIN.w / 2,
      px = (dir * pw) / 2;
    for (const y of [WIN.h / 2 - 0.03, -WIN.h / 2 + 0.03])
      add(RB(pw, 0.06, 0.06, 0.01), trim, [px, y, 0], null, hinge);
    for (const x of [dir * 0.03, dir * (pw - 0.03)])
      add(RB(0.06, WIN.h, 0.06, 0.01), trim, [x, 0, 0], null, hinge);
    add(RB(pw - 0.06, 0.035, 0.05, 0.008), trim, [px, 0.12, 0], null, hinge);
    add(new THREE.PlaneGeometry(pw - 0.1, WIN.h - 0.1), glassMat, [px, 0, 0], null, hinge, false, false);
    add(
      new THREE.SphereGeometry(0.018, 10, 8),
      M(0xd8d0c8, { metalness: 0.9, roughness: 0.25 }),
      [dir * (pw - 0.06), 0, 0.05],
      null,
      hinge,
    );
    return hinge;
  };
  const paneL = casement(-WIN.w / 2, 1),
    paneR = casement(WIN.w / 2, -1);
  add(
    new THREE.CylinderGeometry(0.015, 0.015, WIN.w + 1.8, 10),
    M(0xd8d0c8, { metalness: 0.9, roughness: 0.25 }),
    [WIN.x, RH - 0.12, -RD / 2 + 0.14],
    [0, 0, Math.PI / 2],
    root,
  );

  // ---- outside: a big backdrop the glass shader also samples
  const skyMat = new THREE.MeshBasicMaterial({ map: skyTex });
  add(new THREE.PlaneGeometry(26, 19), skyMat, [WIN.x, 1.5, -15], null, root, false, false);

  return { root, ceiling, frontWall, hallCeiling, door, paneL, paneR, glassUniforms, winGroup, skyMat };
}

/** Tileable cream wallpaper with tiny pink and sage flowers and a faint stripe. */
function wallpaper() {
  const t = canvasTex(
    makeCanvas(512, 512, (g, w, h) => {
      g.fillStyle = '#fbf1ea';
      g.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 64) {
        g.fillStyle = 'rgba(232, 196, 196, 0.18)';
        g.fillRect(x, 0, 22, h);
      }
      const flower = (cx: number, cy: number, c: string) => {
        g.fillStyle = c;
        for (let i = 0; i < 5; i++) {
          const a2 = (i / 5) * Math.PI * 2;
          g.beginPath();
          g.ellipse(cx + Math.cos(a2) * 3.4, cy + Math.sin(a2) * 3.4, 2.9, 1.9, a2, 0, 7);
          g.fill();
        }
        g.fillStyle = '#f2cf7a';
        g.beginPath();
        g.arc(cx, cy, 2.2, 0, 7);
        g.fill();
        g.strokeStyle = 'rgba(126, 160, 120, 0.55)';
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(cx, cy + 6);
        g.quadraticCurveTo(cx + 6, cy + 14, cx + 2, cy + 20);
        g.stroke();
      };
      for (let y = 0; y < 8; y++)
        for (let x = 0; x < 8; x++) {
          const ox = x * 64 + (y % 2 ? 32 : 0) + 11,
            oy = y * 64 + 20;
          flower(ox % w, oy, y % 3 === 0 ? 'rgba(226, 160, 174, 0.42)' : 'rgba(236, 192, 200, 0.38)');
        }
    }),
  );
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** White panelled wainscoting with a chair rail on the four inside walls (split around the door). */
function wainscot(root: THREE.Group, trim: THREE.Material) {
  const panel = M(0xfaf6f0, { roughness: 0.55 });
  const H = 0.95;
  const runs: [number, number, number, number][] = [
    // x, z, length, rotationY  (along the inside face of each wall)
    [0, -RD / 2 + 0.015, RW, 0],
    [-RW / 2 + 0.015, 0, RD, Math.PI / 2],
    [RW / 2 - 0.015, 0, RD, Math.PI / 2],
  ];
  const doorL = DOOR.x - DOOR.w / 2 - 0.08,
    doorR = DOOR.x + DOOR.w / 2 + 0.08;
  runs.push([(-RW / 2 + doorL) / 2, RD / 2 - 0.015, doorL + RW / 2, 0]);
  runs.push([(doorR + RW / 2) / 2, RD / 2 - 0.015, RW / 2 - doorR, 0]);
  for (const [x, z, l, r] of runs) {
    add(RB(l, H, 0.02, 0.004), panel, [x, H / 2, z], [0, r, 0], root, false, true);
    add(RB(l, 0.045, 0.045, 0.01), trim, [x, H, z], [0, r, 0], root, false);
  }
}
