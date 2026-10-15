/** Cork board on the back wall: one paper note per timeline memory. Notes curl off the board when opened. */
import * as THREE from 'three';
import { TIMELINE } from '../content/timeline';
import { add, canvasTex, Interactable, M, makeCanvas, RB, rnd } from './kit';
import { RD } from './room';

const PAPERS = ['#ffe0e6', '#fff3c4', '#dcebff', '#e3f4dc', '#f6e6ff', '#fffaf2'];

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

export function noteTexture(i: number, read: boolean) {
  const n = TIMELINE[i];
  return canvasTex(
    makeCanvas(256, 256, (g, w, h) => {
      g.fillStyle = PAPERS[i % PAPERS.length];
      g.fillRect(0, 0, w, h);
      const gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, '#ffffff40');
      gr.addColorStop(1, '#0000001a');
      g.fillStyle = gr;
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#c0546a';
      g.font = '600 22px "Be Vietnam Pro", sans-serif';
      g.fillText(n.date, 20, 42);
      g.fillStyle = '#3a2a2c';
      g.font = '700 32px Charm, cursive';
      wrap(g, n.title, 20, 96, 216, 36);
      if (read) {
        g.save();
        g.translate(206, 214);
        g.rotate(-0.25);
        g.strokeStyle = '#d9687d';
        g.lineWidth = 3;
        g.beginPath();
        g.arc(0, 0, 26, 0, 7);
        g.stroke();
        g.fillStyle = '#d9687d';
        g.font = '700 30px Charm, cursive';
        g.textAlign = 'center';
        g.fillText('♡', 0, 10);
        g.restore();
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
  const BW = 3.3,
    BH = 1.75;
  add(RB(BW + 0.08, BH + 0.08, 0.04, 0.012), M(0x6b4a34, { roughness: 0.45 }), [0, 0, 0], null, group);
  const cork = canvasTex(
    makeCanvas(512, 300, (g, w, h) => {
      g.fillStyle = '#c09468';
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 9000; i++) {
        g.fillStyle = `rgba(${Math.random() < 0.5 ? '80,48,20' : '235,205,165'},${rnd(0.1, 0.3)})`;
        g.beginPath();
        g.arc(rnd(0, w), rnd(0, h), rnd(0.6, 2.2), 0, 7);
        g.fill();
      }
    }),
  );
  add(
    new THREE.PlaneGeometry(BW, BH),
    M(0xffffff, { map: cork, roughness: 1 }),
    [0, 0, 0.022],
    null,
    group,
    false,
    true,
  );
  const notes: THREE.Mesh[] = [];
  const items: Interactable[] = [];
  const COLS = 9,
    ROWS = Math.ceil(TIMELINE.length / COLS),
    NS = 0.29;
  TIMELINE.forEach((m, i) => {
    const c = i % COLS,
      r = Math.floor(i / COLS);
    const pivot = new THREE.Group();
    pivot.position.set(
      -BW / 2 + 0.2 + (c * (BW - 0.4)) / (COLS - 1) + rnd(-0.02, 0.02),
      BH / 2 - 0.08 - (r * (BH - 0.42)) / (ROWS - 1) + rnd(-0.02, 0.02),
      0.03,
    );
    pivot.rotation.z = rnd(-0.1, 0.1);
    group.add(pivot);
    const geo = new THREE.PlaneGeometry(NS, NS, 1, 10);
    geo.translate(0, -NS / 2, 0);
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
    add(
      new THREE.SphereGeometry(0.014, 12, 8),
      M(0xd9687d, { roughness: 0.3 }),
      [0, -0.012, 0.016],
      null,
      pivot,
      true,
      false,
    );
    mesh.userData.base = (geo.attributes.position.array as Float32Array).slice();
    notes.push(mesh);
    items.push({ id: m.id, label: `${m.date} · ${m.title}`, object: mesh, kind: 'note' });
  });
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
