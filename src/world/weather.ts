/** Weather presets: they change the sky seen through the window, the light, and whether it rains. */
import * as THREE from 'three';
import type { Weather } from '../core/store';
import { canvasTex, makeCanvas, rnd } from './kit';

export interface Preset {
  sky: THREE.Texture;
  rain: boolean;
  moon: { color: number; intensity: number };
  hemi: { sky: number; ground: number; intensity: number };
  exposure: number;
  lampScale: number;
  stars: boolean;
  label: string;
}

function skyTexture(top: string, mid: string, bottom: string, windows: number, sun?: string) {
  return canvasTex(
    makeCanvas(1024, 768, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, top);
      gr.addColorStop(0.6, mid);
      gr.addColorStop(1, bottom);
      g.fillStyle = gr;
      g.fillRect(0, 0, w, h);
      if (sun) {
        const s = g.createRadialGradient(w * 0.62, h * 0.62, 0, w * 0.62, h * 0.62, 220);
        s.addColorStop(0, sun);
        s.addColorStop(1, 'rgba(255,200,150,0)');
        g.fillStyle = s;
        g.fillRect(0, 0, w, h);
      }
      if (!sun)
        for (let i = 0; i < 120; i++) {
          g.fillStyle = `rgba(255,255,255,${rnd(0.2, 0.9)})`;
          g.fillRect(rnd(0, w), rnd(0, h * 0.5), 1.5, 1.5);
        }
      for (let i = 0; i < 22; i++) {
        const x = rnd(-40, w),
          bw = rnd(60, 150),
          bh = rnd(0.25, 0.62) * h;
        g.fillStyle = sun ? `hsl(${rnd(330, 350)} 25% ${rnd(22, 30)}%)` : `hsl(240 30% ${rnd(8, 13)}%)`;
        g.fillRect(x, h - bh, bw, bh);
        for (let k = 0; k < 40; k++)
          if (Math.random() < windows) {
            g.fillStyle = Math.random() < 0.7 ? '#ffcf7a' : '#bfe0ff';
            g.globalAlpha = rnd(0.5, 1);
            g.fillRect(x + rnd(6, bw - 12), h - bh + rnd(8, bh - 8), 6, 8);
            g.globalAlpha = 1;
          }
      }
    }),
  );
}

export function makePresets(): Record<Weather, Preset> {
  return {
    rain: {
      sky: skyTexture('#141a3a', '#2a2550', '#56364f', 0.45),
      rain: true,
      moon: { color: 0x9fb0ff, intensity: 0.85 },
      hemi: { sky: 0xffe6d6, ground: 0x6a4a3c, intensity: 0.55 },
      exposure: 1.15,
      lampScale: 1,
      stars: false,
      label: 'Mưa đêm',
    },
    clear: {
      sky: skyTexture('#0b1033', '#1d2a5c', '#3b3f6e', 0.4),
      rain: false,
      moon: { color: 0xc8d4ff, intensity: 1.6 },
      hemi: { sky: 0xd8dcff, ground: 0x3a2a30, intensity: 0.38 },
      exposure: 1.15,
      lampScale: 0.9,
      stars: true,
      label: 'Đêm trăng',
    },
    sunset: {
      sky: skyTexture('#f7a76c', '#f6c49a', '#f3a6b6', 0.12, 'rgba(255,230,170,.95)'),
      rain: false,
      moon: { color: 0xffb27a, intensity: 2.6 },
      hemi: { sky: 0xffe0c4, ground: 0x6a4434, intensity: 0.7 },
      exposure: 1.05,
      lampScale: 0.55,
      stars: false,
      label: 'Hoàng hôn',
    },
  };
}
