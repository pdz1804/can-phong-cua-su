/**
 * The memory wall on the back wall: every timeline day pinned in order, as the kind of paper it
 * really was (sticky note, polaroid, movie ticket, sealed letter), joined by a red string.
 * Polaroids are photo slots (`memory-<id>`), so real photos can replace the illustrations.
 * Opened memories get a small heart stamp. Pieces curl off the board when opened.
 */
import * as THREE from 'three';
import { TIMELINE } from '../content/timeline';
import { add, canvasTex, Interactable, M, makeCanvas, RB, rnd } from './kit';
import { RD } from './room';
import { photoTexture, Scene } from './photos';
import { swapInDesignerPiece } from './designer-models';

type Kind = 'sticky' | 'polaroid' | 'ticket' | 'letter';

const KIND: Record<string, Kind> = {
  t0613: 'letter',
  t0811: 'letter',
  t0825: 'letter',
  t1003: 'letter',
  t0725: 'ticket',
  t0808: 'ticket',
  t0719: 'polaroid',
  t0802: 'polaroid',
  t0816: 'polaroid',
  t0905: 'polaroid',
  t0906: 'polaroid',
  t0919: 'polaroid',
  t1004: 'polaroid',
  t0628: 'polaroid',
};
const SCENE: Record<string, Scene> = {
  t0628: 'cafe',
  t0816: 'bouquet',
  t0905: 'lanterns',
  t0919: 'sunset',
};
const SIZE: Record<Kind, [number, number]> = {
  sticky: [0.26, 0.26],
  polaroid: [0.24, 0.29],
  ticket: [0.34, 0.15],
  letter: [0.31, 0.21],
};
const PAPERS = ['#ffe0e6', '#fff3c4', '#dcebff', '#e3f4dc', '#f6e6ff'];

function wrap(g: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  let line = '',
    yy = y;
  for (const w of text.split(' ')) {
    const t = line ? line + ' ' + w : w;
    if (g.measureText(t).width > maxW && line) {
      g.fillText(line, x, yy);
      line = w;
      yy += lh;
    } else line = t;
  }
  g.fillText(line, x, yy);
}

function stamp(g: CanvasRenderingContext2D, x: number, y: number) {
  g.save();
  g.translate(x, y);
  g.rotate(-0.25);
  g.strokeStyle = '#d9687d';
  g.lineWidth = 3;
  g.beginPath();
  g.arc(0, 0, 22, 0, 7);
  g.stroke();
  g.fillStyle = '#d9687d';
  g.font = '700 26px Charm, cursive';
  g.textAlign = 'center';
  g.fillText('♡', 0, 9);
  g.restore();
}

export function noteTexture(i: number, read: boolean) {
  const n = TIMELINE[i];
  const kind = KIND[n.id] ?? 'sticky';
  const [w0, h0] = SIZE[kind];
  const W = 320,
    H = Math.round((W * h0) / w0);
  return canvasTex(
    makeCanvas(W, H, (g, w, h) => {
      if (kind === 'sticky') {
        g.fillStyle = PAPERS[i % PAPERS.length];
        g.fillRect(0, 0, w, h);
        const gr = g.createLinearGradient(0, 0, 0, h);
        gr.addColorStop(0, '#ffffff40');
        gr.addColorStop(1, '#00000018');
        g.fillStyle = gr;
        g.fillRect(0, 0, w, h);
        g.fillStyle = '#c0546a';
        g.font = '600 26px "Be Vietnam Pro", sans-serif';
        g.fillText(n.date, 22, 46);
        g.fillStyle = '#3a2a2c';
        g.font = '700 38px Charm, cursive';
        wrap(g, n.title, 22, 108, w - 44, 42);
        if (read) stamp(g, w - 40, h - 40);
      } else if (kind === 'polaroid') {
        g.fillStyle = '#fffdf8';
        g.fillRect(0, 0, w, h);
        g.fillStyle = '#e8e0d6';
        g.fillRect(18, 18, w - 36, w - 36); // the photo sits on top of this as its own slot
        g.fillStyle = '#3a2a2c';
        g.font = '700 30px Charm, cursive';
        g.textAlign = 'center';
        g.fillText(`${n.date} · ${n.title}`.slice(0, 26), w / 2, h - 30);
        if (read) stamp(g, w - 34, h - 70);
      } else if (kind === 'ticket') {
        g.fillStyle = '#fbe7c4';
        g.fillRect(0, 0, w, h);
        g.fillStyle = '#e2405c';
        g.fillRect(0, 0, w * 0.26, h);
        g.setLineDash([6, 6]);
        g.strokeStyle = '#ffffffaa';
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(w * 0.26, 4);
        g.lineTo(w * 0.26, h - 4);
        g.stroke();
        g.setLineDash([]);
        g.fillStyle = '#fff4e6';
        g.font = '700 22px "Be Vietnam Pro", sans-serif';
        g.save();
        g.translate(w * 0.13, h / 2);
        g.rotate(-Math.PI / 2);
        g.textAlign = 'center';
        g.fillText('ADMIT 2', 0, 8);
        g.restore();
        g.fillStyle = '#b8455b';
        g.font = '600 20px "Be Vietnam Pro", sans-serif';
        g.fillText(`GALAXY · ${n.date}`, w * 0.32, 42);
        g.fillStyle = '#3a2a2c';
        g.font = '700 32px Charm, cursive';
        wrap(g, n.title, w * 0.32, 92, w * 0.64, 34);
        if (read) stamp(g, w - 34, h - 30);
      } else {
        g.fillStyle = '#fbf3e6';
        g.fillRect(0, 0, w, h);
        g.strokeStyle = '#e4d3bd';
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(w / 2, h * 0.55);
        g.lineTo(w, 0);
        g.stroke();
        g.fillStyle = '#c0546a';
        g.beginPath();
        g.arc(w / 2, h * 0.55, 20, 0, 7);
        g.fill();
        g.fillStyle = '#fff1f3';
        g.font = '700 22px Charm, cursive';
        g.textAlign = 'center';
        g.fillText('♡', w / 2, h * 0.55 + 8);
        g.fillStyle = '#3a2a2c';
        g.font = '700 30px Charm, cursive';
        g.fillText(`${n.date} · ${n.title}`.slice(0, 24), w / 2, h - 22);
        if (read) stamp(g, w - 30, 34);
      }
    }),
  );
}

export interface Board {
  group: THREE.Group;
  notes: THREE.Mesh[];
  items: Interactable[];
  markRead(i: number): void;
}

export function buildBoard(root: THREE.Group, seen: Set<string>): Board {
  const group = new THREE.Group();
  group.position.set(-1.9, 1.85, -RD / 2 + 0.03);
  root.add(group);
  const BW = 4.0,
    BH = 1.75;
  // frame and cork surface sit in their own group so the designer's board can replace just them;
  // the notes, pins, clips and string below are added to `group` and stay
  const frame = new THREE.Group();
  group.add(frame);
  add(RB(BW + 0.1, BH + 0.1, 0.045, 0.015), M(0xc79c74, { roughness: 0.5 }), [0, 0, 0], null, frame);
  const cork = canvasTex(
    makeCanvas(768, 336, (g, w, h) => {
      g.fillStyle = '#cfa57a';
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 14000; i++) {
        g.fillStyle = `rgba(${Math.random() < 0.5 ? '120,80,45' : '245,220,185'},${rnd(0.08, 0.24)})`;
        g.beginPath();
        g.arc(rnd(0, w), rnd(0, h), rnd(0.6, 2.2), 0, 7);
        g.fill();
      }
    }),
  );
  add(
    new THREE.PlaneGeometry(BW, BH),
    M(0xffffff, { map: cork, roughness: 1 }),
    [0, 0, 0.024],
    null,
    frame,
    false,
    true,
  );
  void swapInDesignerPiece('decor-cork-board', frame, 'wall');

  const notes: THREE.Mesh[] = [];
  const items: Interactable[] = [];
  const pins: THREE.Vector3[] = [];
  const COLS = 12,
    ROWS = Math.ceil(TIMELINE.length / COLS);
  TIMELINE.forEach((m, i) => {
    // read left → right on row 1, right → left on row 2, … so the string snakes through time
    const r = Math.floor(i / COLS),
      c0 = i % COLS,
      c = r % 2 ? COLS - 1 - c0 : c0;
    const kind = KIND[m.id] ?? 'sticky';
    const [w, h] = SIZE[kind];
    const pivot = new THREE.Group();
    pivot.position.set(
      -BW / 2 + 0.2 + (c * (BW - 0.4)) / (COLS - 1) + rnd(-0.015, 0.015),
      BH / 2 - 0.1 - (r * (BH - 0.45)) / Math.max(1, ROWS - 1) + rnd(-0.03, 0.03),
      0.03,
    );
    pivot.rotation.z = rnd(-0.12, 0.12);
    group.add(pivot);
    const geo = new THREE.PlaneGeometry(w, h, 1, 10);
    geo.translate(0, -h / 2, 0);
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({
        map: noteTexture(i, seen.has(m.id)),
        roughness: 0.85,
        side: THREE.DoubleSide,
        envMapIntensity: 0.15,
      }),
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.z = 0.004;
    pivot.add(mesh);
    if (kind === 'polaroid') {
      const photo = new THREE.Mesh(
        new THREE.PlaneGeometry(w * 0.86, w * 0.86),
        M(0xffffff, {
          map: photoTexture(`memory-${m.id}`, SCENE[m.id] ?? 'photobooth', 288, 288),
          roughness: 0.5,
        }),
      );
      photo.position.set(0, -w * 0.07 - (w * 0.86) / 2, 0.002);
      mesh.add(photo);
    }
    // wooden clip for photos and tickets, a pink pin for the rest
    if (kind === 'polaroid' || kind === 'ticket')
      add(
        RB(0.026, 0.05, 0.016, 0.004),
        M(0xe0be94, { roughness: 0.6 }),
        [0, -0.01, 0.018],
        null,
        pivot,
        true,
        false,
      );
    else
      add(
        new THREE.SphereGeometry(0.015, 12, 8),
        M(0xd9687d, { roughness: 0.3 }),
        [0, -0.012, 0.018],
        null,
        pivot,
        true,
        false,
      );
    pins.push(pivot.position.clone().add(new THREE.Vector3(0, -0.005, 0.012)));
    mesh.userData.base = (geo.attributes.position.array as Float32Array).slice();
    notes.push(mesh);
    items.push({ id: m.id, label: `${m.date} · ${m.title}`, object: mesh, kind: 'note' });
  });
  // the red string, sagging a little between pins
  const pts: THREE.Vector3[] = [];
  pins.forEach((p, k) => {
    pts.push(p);
    const q = pins[k + 1];
    if (q)
      pts.push(
        p
          .clone()
          .lerp(q, 0.5)
          .add(new THREE.Vector3(0, -0.035, 0.002)),
      );
  });
  add(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 6, 0.0025, 5),
    M(0xc8324a, { roughness: 0.7 }),
    [0, 0, 0],
    null,
    group,
    false,
    false,
  );

  return {
    group,
    notes,
    items,
    markRead(i) {
      const mat = notes[i].material as THREE.MeshStandardMaterial;
      mat.map?.dispose();
      mat.map = noteTexture(i, true);
    },
  };
}

/** Curls a note's mesh from the bottom edge. t: 0 flat → 1 fully lifted. */
export function curl(mesh: THREE.Mesh, t: number) {
  const pos = mesh.geometry.attributes.position as THREE.BufferAttribute;
  const base = mesh.userData.base as Float32Array;
  const k = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  for (let v = 0; v < pos.count; v++) {
    const y = base[v * 3 + 1];
    pos.setZ(v, base[v * 3 + 2] + k * 2.2 * y * y);
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
  mesh.rotation.x = -k * 0.45;
  mesh.position.z = 0.004 + k * 0.12;
}
