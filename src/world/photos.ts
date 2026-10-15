/**
 * Photo slots. Every picture frame in the room is a named slot. By default it shows an illustrated
 * scene drawn here; if public/photos/manifest.json maps the slot id to an image file, the real
 * photo replaces the illustration once it loads. Missing manifest or file = illustration stays.
 *
 * manifest.json example: { "polaroid-1": "first-photobooth.jpg", "hall-print": "sala.jpg" }
 */
import * as THREE from 'three';
import { canvasTex, makeCanvas, rnd } from './kit';

export type Scene = 'umbrella' | 'bouquet' | 'sala' | 'cafe' | 'photobooth' | 'lily' | 'sunset' | 'lanterns';

let manifest: Promise<Record<string, string>> | null = null;
function getManifest() {
  manifest ??= fetch(`${import.meta.env.BASE_URL}photos/manifest.json`, { cache: 'no-cache' })
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}));
  return manifest;
}

/** Soft vertical gradient + out-of-focus light dots: the shared "photo" look of every illustration. */
function backdrop(
  g: CanvasRenderingContext2D,
  w: number,
  h: number,
  top: string,
  bottom: string,
  dots: string,
) {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, top);
  gr.addColorStop(1, bottom);
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < 26; i++) {
    const x = rnd(0, w),
      y = rnd(0, h * 0.7),
      r = rnd(6, 26);
    const b = g.createRadialGradient(x, y, 0, x, y, r);
    b.addColorStop(0, dots);
    b.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = b;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
}

/** Two figures side by side; she is slightly shorter, in a green dress, he in cream. */
function couple(g: CanvasRenderingContext2D, cx: number, base: number, s: number, close = 1) {
  const fig = (x: number, height: number, body: string, hair: string) => {
    g.fillStyle = body;
    g.beginPath();
    g.moveTo(x - 16 * s, base);
    g.quadraticCurveTo(x - 18 * s, base - height * 0.55, x - 9 * s, base - height * 0.72);
    g.lineTo(x + 9 * s, base - height * 0.72);
    g.quadraticCurveTo(x + 18 * s, base - height * 0.55, x + 16 * s, base);
    g.fill();
    g.fillStyle = '#f3d2bd';
    g.beginPath();
    g.arc(x, base - height * 0.82, 10 * s, 0, 7);
    g.fill();
    g.fillStyle = hair;
    g.beginPath();
    g.arc(x, base - height * 0.85, 10.5 * s, Math.PI, 0);
    g.fill();
  };
  fig(cx - 14 * s * close, 118 * s, '#f4ead8', '#2b1d18');
  fig(cx + 14 * s * close, 104 * s, '#7fb09b', '#3a2620');
}

const PAINT: Record<Scene, (g: CanvasRenderingContext2D, w: number, h: number) => void> = {
  umbrella(g, w, h) {
    backdrop(g, w, h, '#2e3a5f', '#6d6f93', 'rgba(255,214,150,0.55)');
    g.strokeStyle = 'rgba(200,215,255,0.35)';
    g.lineWidth = 1.4;
    for (let i = 0; i < 90; i++) {
      const x = rnd(0, w),
        y = rnd(0, h);
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x - 3, y + 14);
      g.stroke();
    }
    couple(g, w / 2, h * 0.92, h / 300, 0.7);
    g.fillStyle = '#d9687d';
    g.beginPath();
    g.ellipse(w / 2, h * 0.5, w * 0.27, h * 0.1, 0, Math.PI, 0);
    g.fill();
    g.strokeStyle = '#5a3b3b';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(w / 2, h * 0.5);
    g.lineTo(w / 2, h * 0.7);
    g.stroke();
  },
  bouquet(g, w, h) {
    backdrop(g, w, h, '#fbe6e9', '#f3c7cf', 'rgba(255,255,255,0.7)');
    g.fillStyle = '#6f9a5f';
    for (let i = 0; i < 9; i++) g.fillRect(w / 2 - 20 + i * 5, h * 0.55, 3, h * 0.35);
    g.fillStyle = '#f6e1d0';
    g.beginPath();
    g.moveTo(w * 0.3, h * 0.5);
    g.lineTo(w * 0.7, h * 0.5);
    g.lineTo(w * 0.56, h * 0.92);
    g.lineTo(w * 0.44, h * 0.92);
    g.fill();
    for (let i = 0; i < 14; i++) {
      const x = w / 2 + rnd(-w * 0.2, w * 0.2),
        y = h * 0.4 + rnd(-h * 0.14, h * 0.1);
      g.fillStyle = ['#ffffff', '#f4a6b6', '#fff3c4', '#e98da0'][i % 4];
      g.beginPath();
      g.arc(x, y, rnd(10, 18), 0, 7);
      g.fill();
    }
  },
  sala(g, w, h) {
    backdrop(g, w, h, '#f7b38a', '#f6d6c4', 'rgba(255,240,210,0.6)');
    g.fillStyle = '#a6b8c9';
    g.fillRect(0, h * 0.72, w, h * 0.28);
    const cx = w / 2,
      cy = h * 0.5;
    for (let p = 0; p < 8; p++) {
      const a = (p / 8) * Math.PI * 2;
      g.fillStyle = p % 2 ? '#ffe3ea' : '#ffc9d6';
      g.beginPath();
      g.ellipse(cx + Math.cos(a) * 40, cy + Math.sin(a) * 26, 46, 22, a, 0, 7);
      g.fill();
    }
    g.fillStyle = '#f2c14e';
    g.beginPath();
    g.arc(cx, cy, 20, 0, 7);
    g.fill();
    couple(g, cx, h * 0.95, h / 420);
  },
  cafe(g, w, h) {
    backdrop(g, w, h, '#e9d3b8', '#cfae8c', 'rgba(255,236,200,0.6)');
    g.fillStyle = '#8b5e3c';
    g.fillRect(0, h * 0.72, w, h * 0.06);
    for (const [x, c] of [
      [w * 0.3, '#5a4a42'],
      [w * 0.62, '#e0a76b'],
    ] as const) {
      g.fillStyle = c;
      g.beginPath();
      g.ellipse(x, h * 0.66, 30, 20, 0, 0, 7);
      g.fill();
      g.beginPath();
      g.arc(x - 18, h * 0.55, 13, 0, 7);
      g.fill();
    }
    g.fillStyle = '#fff';
    g.fillRect(w * 0.45, h * 0.6, 22, 26);
  },
  photobooth(g, w, h) {
    backdrop(g, w, h, '#ffd6e0', '#f8b5c6', 'rgba(255,255,255,0.8)');
    couple(g, w / 2, h * 0.98, h / 260, 0.55);
    g.fillStyle = 'rgba(255,255,255,0.85)';
    g.font = `700 ${Math.round(h / 9)}px Charm, cursive`;
    g.textAlign = 'center';
    g.fillText('♡', w * 0.8, h * 0.2);
  },
  lily(g, w, h) {
    backdrop(g, w, h, '#eef3ea', '#d5e2cf', 'rgba(255,255,255,0.8)');
    for (let f = 0; f < 3; f++) {
      const cx = w * (0.32 + f * 0.18),
        cy = h * (0.42 + (f % 2) * 0.12);
      for (let p = 0; p < 6; p++) {
        const a = (p / 6) * Math.PI * 2;
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.ellipse(cx + Math.cos(a) * 16, cy + Math.sin(a) * 16, 22, 8, a, 0, 7);
        g.fill();
      }
      g.fillStyle = '#f2c14e';
      g.beginPath();
      g.arc(cx, cy, 6, 0, 7);
      g.fill();
    }
  },
  sunset(g, w, h) {
    backdrop(g, w, h, '#f59f7b', '#fbd8a6', 'rgba(255,240,200,0.7)');
    g.fillStyle = 'rgba(255,240,200,0.95)';
    g.beginPath();
    g.arc(w / 2, h * 0.62, h * 0.14, 0, 7);
    g.fill();
    g.fillStyle = '#7d8fb3';
    g.fillRect(0, h * 0.7, w, h * 0.3);
    couple(g, w / 2, h * 0.98, h / 380);
  },
  lanterns(g, w, h) {
    backdrop(g, w, h, '#1e2447', '#3d3563', 'rgba(255,200,120,0.6)');
    for (let i = 0; i < 6; i++) {
      const x = w * (0.15 + i * 0.14),
        y = h * (0.3 + (i % 2) * 0.16);
      const l = g.createRadialGradient(x, y, 0, x, y, 34);
      l.addColorStop(0, i % 2 ? '#ffd36b' : '#ff7b6b');
      l.addColorStop(1, 'rgba(255,150,90,0)');
      g.fillStyle = l;
      g.fillRect(x - 34, y - 34, 68, 68);
    }
    couple(g, w / 2, h * 0.98, h / 330);
  },
};

/** A texture for a named frame: illustrated now, swapped to the real photo if one is configured. */
export function photoTexture(slot: string, scene: Scene, w = 384, h = 448): THREE.Texture {
  const tex = canvasTex(makeCanvas(w, h, (g) => PAINT[scene](g, w, h)));
  void getManifest().then((m) => {
    const file = m[slot];
    if (!file) return;
    new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}photos/${file}`, (photo) => {
      tex.image = photo.image;
      tex.needsUpdate = true;
    });
  });
  return tex;
}
