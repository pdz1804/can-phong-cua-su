/**
 * The lobby's dollhouse setting: a dusk sky with a few stars instead of a black void, and a soft
 * rounded base the house sits on, like a diorama on a table. Shown only while the lobby orbits.
 */
import * as THREE from 'three';
import { add, canvasTex, M, makeCanvas, rnd } from './kit';

export function buildLobbyStage(scene: THREE.Scene) {
  const sky = canvasTex(
    makeCanvas(1024, 512, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, '#1b1530');
      gr.addColorStop(0.55, '#4a3352');
      gr.addColorStop(0.85, '#c98a8f');
      gr.addColorStop(1, '#f2c6a8');
      g.fillStyle = gr;
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 220; i++) {
        g.fillStyle = `rgba(255,246,230,${rnd(0.3, 0.9)})`;
        g.beginPath();
        g.arc(rnd(0, w), rnd(0, h * 0.5), rnd(0.6, 1.4), 0, Math.PI * 2);
        g.fill();
      }
    }),
  );

  const stage = new THREE.Group();
  stage.visible = false;
  scene.add(stage);
  // a rounded plinth under the house and hallway, its top just below the floor
  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(10.5, 10.5, 0.3, 96),
    M(0xf3e2d6, { roughness: 0.9 }),
  );
  top.position.set(-0.6, -0.17, 1.6);
  top.receiveShadow = true;
  stage.add(top);
  add(
    new THREE.TorusGeometry(10.5, 0.15, 16, 128),
    M(0xe7c3c2, { roughness: 0.7 }),
    [-0.6, -0.17, 1.6],
    [Math.PI / 2, 0, 0],
    stage,
    false,
    true,
  );
  add(
    new THREE.CylinderGeometry(10.4, 9.6, 0.9, 96),
    M(0xd9a7a9, { roughness: 0.8 }),
    [-0.6, -0.77, 1.6],
    null,
    stage,
    false,
    false,
  );
  return { stage, sky };
}
