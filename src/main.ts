/**
 * Căn phòng của Su — entry point. Wires the world, the player and the UI to the flow:
 * loading → lobby (dollhouse preview, weather, settings) → doorstep → explore ⇄ reading/paused → finale.
 */
import './ui/styles.css';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Flow } from './core/flow';
import { Store, Weather } from './core/store';
import { loadAssets } from './world/assets';
import { Colliders, Interactable } from './world/kit';
import { buildRoom, DOOR, RD, WIN } from './world/room';
import { buildFurniture } from './world/furniture';
import { buildKeepsakes } from './world/keepsakes';
import { buildBoard, curl } from './world/board';
import { buildAtmosphere } from './world/atmosphere';
import { makePresets } from './world/weather';
import { Player } from './player/player';
import { bindTouch } from './player/touch';
import { Sound } from './audio/audio';
import { TIMELINE } from './content/timeline';
import { KEEPSAKES } from './content/keepsakes';
import { FINALE_LINES, NOTEBOOK } from './content/about-su';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const store = new Store();
const flow = new Flow();
const sound = new Sound();
const coarse = matchMedia('(pointer: coarse)').matches;
const lowGfx = () =>
  store.settings.quality === 'low' ||
  (store.settings.quality === 'auto' && (coarse || Math.min(innerWidth, innerHeight) < 700));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- renderer ---------- */
const canvas = $<HTMLCanvasElement>('c');
let renderer: THREE.WebGLRenderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowGfx(), powerPreference: 'high-performance' });
} catch {
  $('loading').hidden = true;
  $('fallback').hidden = false;
  throw new Error('WebGL unavailable');
}
renderer.setPixelRatio(Math.min(devicePixelRatio, lowGfx() ? 1.25 : 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07060c);
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.05, 80);
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), 0.6, 0.6, 0.85);
composer.addPass(bloom);
composer.addPass(new OutputPass());
if (lowGfx()) composer.setPixelRatio(renderer.getPixelRatio() * 0.75);
function onResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.fov = camera.aspect < 1 ? 72 : 60;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
}
addEventListener('resize', onResize);
onResize();

/* ---------- world ---------- */
const assets = await loadAssets((r) => ($('loadBar').style.width = `${Math.round(r * 100)}%`));
await document.fonts.ready;
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromEquirectangular(assets.hdr).texture;
scene.environmentIntensity = 0.4;
pmrem.dispose();
const presets = makePresets();
const col = new Colliders();
scene.add(col.group);
const building = buildRoom(scene, assets, col, presets[store.settings.weather].sky);
// the room and hallway wall blockers (registered before any furniture); the door blocker is excluded
const walls = col.group.children.filter((c) => !c.userData.isDoor);
const furniture = buildFurniture(building.root, assets, col);
const keep = buildKeepsakes(building.root, assets, furniture);
const board = buildBoard(building.root, new Set([...store.seen]));
const atmo = buildAtmosphere(scene, furniture.lampWorld, lowGfx());
const items: Interactable[] = [
  ...keep.items,
  ...board.items,
  { id: 'door', label: 'Mở cửa phòng', object: building.door, kind: 'door' },
];
const meshToItem = new Map<THREE.Object3D, Interactable>();
for (const it of items)
  it.object.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) meshToItem.set(o, it);
  });
const pickables = [...meshToItem.keys()];

function applyWeather(w: Weather) {
  const p = presets[w];
  building.skyMat.map = p.sky;
  building.skyMat.needsUpdate = true;
  building.glassUniforms.uBg.value = p.sky;
  renderer.toneMappingExposure = p.exposure;
  atmo.applyPreset(p);
  sound.rainWanted = p.rain;
  sound.apply();
}
applyWeather(store.settings.weather);

/* ---------- player ---------- */
const player = new Player(camera, canvas);
player.sensitivity = store.settings.sensitivity;
player.setColliders(col.group);
player.onStep = () => sound.step();
const START = { x: DOOR.x, z: RD / 2 + 2.4, yaw: 0 };

/* ---------- UI: lobby ---------- */
const help = coarse
  ? 'Ngón cái trái: kéo để đi. Bên phải: vuốt để nhìn quanh. Chạm vào món đồ để mở.'
  : '<kbd>W A S D</kbd> đi lại · <kbd>chuột</kbd> nhìn quanh · <kbd>E</kbd> hoặc <kbd>click</kbd> mở đồ · <kbd>Shift</kbd> đi chậm · <kbd>Esc</kbd> menu';
$('controlsHelp').innerHTML = help;
$('controlsHelp2').innerHTML = help;
for (const r of document.querySelectorAll<HTMLInputElement>('#weather input')) {
  r.checked = r.value === store.settings.weather;
  r.addEventListener('change', () => {
    store.saveSettings({ weather: r.value as Weather });
    applyWeather(r.value as Weather);
  });
}
const optMusic = $<HTMLInputElement>('optMusic'),
  optAmb = $<HTMLInputElement>('optAmbience'),
  optQ = $<HTMLSelectElement>('optQuality'),
  optS = $<HTMLInputElement>('optSens');
optMusic.checked = store.settings.music;
optAmb.checked = store.settings.ambience;
optQ.value = store.settings.quality;
optS.value = String(store.settings.sensitivity);
const syncSound = () => {
  sound.music = store.settings.music;
  sound.ambience = store.settings.ambience;
  sound.apply();
};
optMusic.onchange = () => {
  store.saveSettings({ music: optMusic.checked });
  syncSound();
};
optAmb.onchange = () => {
  store.saveSettings({ ambience: optAmb.checked });
  syncSound();
};
optQ.onchange = () => store.saveSettings({ quality: optQ.value as never });
optS.oninput = () => {
  store.saveSettings({ sensitivity: Number(optS.value) });
  player.sensitivity = store.settings.sensitivity;
};
syncSound();

function setHint(t: string) {
  $('hint').textContent = t;
}
function updateJar() {
  ($('jarMeter').firstElementChild as HTMLElement).style.height = `${Math.round(store.glow * 100)}%`;
}
updateJar();

/* ---------- flow ---------- */
let doorOpen = false,
  finaleT = -1;
const lockPointer = () => {
  if (coarse) return;
  try {
    // Chrome returns a promise that rejects when the page is not focusable; that is not an error for us
    (canvas.requestPointerLock?.() as unknown as Promise<void> | undefined)?.catch?.(() => {});
  } catch {
    /* pointer lock unavailable: drag-free play still works via the click-to-lock retry */
  }
};
flow.on((p, prev) => {
  $('lobby').hidden = p !== 'lobby';
  $('hud').hidden = !['doorstep', 'explore'].includes(p);
  $('pause').hidden = p !== 'paused';
  if (p === 'paused') requestAnimationFrame(() => $('resumeBtn').focus());
  building.ceiling.visible = building.hallCeiling.visible = furniture.fan.visible = p !== 'lobby';
  player.enabled = p === 'doorstep' || p === 'explore';
  if (!player.enabled) player.releaseKeys();
  if (p === 'doorstep' && prev === 'lobby') {
    player.teleport(START.x, START.z, START.yaw, -0.05);
    sound.start();
    syncSound();
    setHint(coarse ? 'Đi tới cửa rồi chạm vào cửa để mở' : 'Click để bắt đầu, đi tới cửa rồi bấm E để mở');
  }
  if (p === 'explore' && prev === 'doorstep')
    setHint(
      coarse
        ? 'Chạm vào món đồ hoặc tờ giấy trên bảng để đọc'
        : 'Nhìn vào món đồ và bấm E. Mở thật nhiều kỷ niệm để thắp sáng hũ đom đóm',
    );
  if (p === 'lobby') {
    document.exitPointerLock?.();
    doorOpen = false;
  }
});
$('loading').style.opacity = '0';
setTimeout(() => ($('loading').hidden = true), 900);
flow.go('lobby');
$('startBtn').onclick = () => {
  flow.go('doorstep');
  lockPointer();
};
$('pauseBtn').onclick = () => {
  document.exitPointerLock?.();
  flow.go('paused');
};
$('resumeBtn').onclick = () => {
  flow.go(doorOpen ? 'explore' : 'doorstep');
  lockPointer();
};
$('lobbyBtn').onclick = () => {
  flow.go('lobby');
  building.door.rotation.y = 0;
  col.remove('door'); // never stack a second collider: exactly one door blocker exists while it is shut
  col.box(DOOR.x, RD / 2 + 0.1, DOOR.w, 0.3, 'door').userData.isDoor = true;
  player.setColliders(col.group);
};
document.addEventListener('pointerlockchange', () => {
  if (!document.pointerLockElement && (flow.phase === 'explore' || flow.phase === 'doorstep') && !coarse)
    flow.go('paused');
});
canvas.addEventListener('click', () => {
  if (coarse || !player.enabled) return;
  if (document.pointerLockElement !== canvas) return lockPointer();
  if (aimed) use(aimed);
});
addEventListener('keydown', (e) => {
  if (e.code === 'KeyE' && player.enabled && aimed) use(aimed);
  if (e.code === 'Escape') {
    if (!$('letter').hidden) closeLetter();
    else if (!$('notebook').hidden) closeNotebook();
  }
});
bindTouch(
  canvas,
  player,
  (x, y) => {
    const it = pickAt(x, y, 3.4);
    if (it) use(it);
  },
  () => player.enabled,
);

/* ---------- aiming + using things ---------- */
const ray = new THREE.Raycaster();
let aimed: Interactable | null = null;
function pickAt(x: number, y: number, range: number): Interactable | null {
  ray.setFromCamera(new THREE.Vector2((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1), camera);
  ray.far = range;
  // walls are tested too, so nothing can be opened through a wall
  const hit = ray.intersectObjects([...pickables, ...walls], false)[0];
  return hit ? (meshToItem.get(hit.object) ?? null) : null;
}
function updateAim() {
  const it = player.enabled && !coarse ? pickAt(innerWidth / 2, innerHeight / 2, 2.6) : null;
  aimed = it && (it.kind !== 'door' || !doorOpen) ? it : null;
  $('crosshair').classList.toggle('on', !!aimed);
  const pr = $('prompt');
  pr.hidden = !aimed;
  if (aimed) pr.innerHTML = `<kbd>E</kbd>${aimed.label}`;
}

let peel: { mesh: THREE.Mesh; t: number; back: boolean; done?: () => void } | null = null;
function use(it: Interactable) {
  if (it.kind === 'door') return openDoor();
  if (flow.phase !== 'explore') return;
  if (it.kind === 'jar') {
    if (store.unlocked && !store.finaleDone) return startFinale();
    return showLetter(
      store.finaleDone
        ? {
            date: 'Hũ đom đóm',
            title: 'Đom đóm đã bay ra rồi',
            body: 'Giờ tụi nó ở khắp phòng với em. Mỗi lần em nhớ anh, cứ nhìn quanh là thấy.',
          }
        : {
            date: 'Hũ đom đóm',
            title: 'Hũ chưa đủ sáng',
            body: 'Mỗi kỷ niệm em mở sẽ thắp thêm đom đóm trong hũ. Khi hũ sáng lên, em mở nắp ra nhé. Còn nhiều điều anh cất quanh phòng lắm đó.',
          },
      null,
    );
  }
  if (it.kind === 'notebook') return openNotebook(it.id);
  if (it.kind === 'note') {
    const i = TIMELINE.findIndex((m) => m.id === it.id);
    sound.paper();
    flow.go('reading');
    document.exitPointerLock?.();
    peel = { mesh: it.object as THREE.Mesh, t: 0, back: false };
    peel.done = () => {
      showLetter(TIMELINE[i], it.id);
      board.markRead(i);
    };
    return;
  }
  if (it.id === 'bubbles') atmo.releaseBubbles(keep.bubbleSource.getWorldPosition(new THREE.Vector3()));
  it.object.userData.pop = 0;
  sound.chime();
  showLetter(KEEPSAKES[it.id], it.id);
}

function openDoor() {
  if (doorOpen) return;
  doorOpen = true;
  sound.door();
  col.remove('door');
  player.setColliders(col.group);
  flow.go('explore');
}

function showLetter(l: { date: string; title: string; body: string }, id: string | null) {
  if (flow.phase === 'explore') flow.go('reading');
  document.exitPointerLock?.();
  $('letterDate').textContent = l.date;
  $('letterTitle').textContent = l.title;
  $('letterBody').textContent = l.body;
  $('letter').hidden = false;
  if (id && store.markSeen(id)) {
    sound.chime();
    updateJar();
  }
  $('letterClose').focus();
}
function closeLetter() {
  if ($('letter').hidden) return;
  $('letter').hidden = true;
  const finish = () => {
    flow.go('explore');
    lockPointer();
    if (store.unlocked && !store.finaleDone)
      setHint('Hũ đom đóm trên bậu cửa sổ đã sáng rồi. Em tới mở nắp nhé');
  };
  if (peel) {
    peel.back = true;
    peel.done = () => {
      peel = null;
      finish();
    };
  } else finish();
}
$('letterClose').onclick = closeLetter;
$('letter').onclick = (e) => {
  if (e.target === $('letter')) closeLetter();
};

let page = 0;
function renderPage() {
  const p = NOTEBOOK[page];
  $('nbHeading').textContent = p.heading;
  $('nbLines').innerHTML = '';
  for (const line of p.lines) {
    const li = document.createElement('li');
    li.textContent = line;
    $('nbLines').appendChild(li);
  }
  $('nbPage').textContent = `${page + 1} / ${NOTEBOOK.length}`;
}
function openNotebook(id: string) {
  flow.go('reading');
  document.exitPointerLock?.();
  page = 0;
  renderPage();
  $('notebook').hidden = false;
  if (store.markSeen(id)) updateJar();
  sound.paper();
  $('nbNext').focus();
}
function closeNotebook() {
  $('notebook').hidden = true;
  flow.go('explore');
  lockPointer();
}
$('nbPrev').onclick = () => {
  page = (page + NOTEBOOK.length - 1) % NOTEBOOK.length;
  renderPage();
  sound.paper();
};
$('nbNext').onclick = () => {
  page = (page + 1) % NOTEBOOK.length;
  renderPage();
  sound.paper();
};
$('nbClose').onclick = closeNotebook;

/* ---------- finale ---------- */
let camTween: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  lf: THREE.Vector3;
  lt: THREE.Vector3;
  t: number;
  dur: number;
} | null = null;
async function startFinale() {
  if (!flow.go('finale')) return;
  document.exitPointerLock?.();
  const fwd = new THREE.Vector3();
  camera.getWorldDirection(fwd);
  camTween = {
    from: camera.position.clone(),
    to: new THREE.Vector3(WIN.x - 0.15, 1.7, -RD / 2 + 1.5),
    lf: camera.position.clone().add(fwd),
    lt: new THREE.Vector3(WIN.x, 2.6, -8),
    t: 0,
    dur: reduceMotion ? 0.01 : 2.4,
  };
  sound.rainWanted = false;
  sound.apply();
  await new Promise((r) => setTimeout(r, reduceMotion ? 0 : 2400));
  finaleT = 0;
  sound.fanfare();
  atmo.releaseFireflies();
  const fin = $('finLines');
  fin.innerHTML = '';
  $('finale').hidden = false;
  const ps = FINALE_LINES.map((t) => {
    const p = document.createElement('p');
    p.textContent = t;
    fin.appendChild(p);
    return p;
  });
  await new Promise((r) => setTimeout(r, reduceMotion ? 0 : 4200));
  for (const p of ps) {
    p.classList.add('on');
    await new Promise((r) => setTimeout(r, reduceMotion ? 0 : 1700));
  }
  $('finBack').classList.add('on');
  $('finBack').focus();
  store.setFinaleDone(); // saved only once she has seen the whole message
}
$('finBack').onclick = () => {
  $('finale').hidden = true;
  $('finBack').classList.remove('on');
  finaleT = -1;
  camTween = null;
  sound.rainWanted = presets[store.settings.weather].rain;
  sound.apply();
  player.teleport(WIN.x - 0.15, -RD / 2 + 1.6, 0, 0.1);
  flow.go('explore');
  setHint('Đom đóm sẽ ở lại trong phòng với em');
  lockPointer();
};
if (store.finaleDone) atmo.releaseFireflies();

/* ---------- loop ---------- */
const clock = new THREE.Clock();
const jarWorld = new THREE.Vector3();
let nextFlash = performance.now() + 15000,
  lobbyAngle = 0.6;
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05),
    T = clock.elapsedTime;
  if (flow.phase === 'lobby') {
    lobbyAngle += dt * (reduceMotion ? 0 : 0.06);
    camera.position.set(0.2 + Math.sin(lobbyAngle) * 11, 9.5, 0.6 + Math.cos(lobbyAngle) * 11);
    camera.lookAt(0.2, 0.6, 0.2);
  } else if (camTween) {
    camTween.t = Math.min(1, camTween.t + dt / camTween.dur);
    const k = camTween.t < 0.5 ? 4 * camTween.t ** 3 : 1 - Math.pow(-2 * camTween.t + 2, 3) / 2;
    camera.position.lerpVectors(camTween.from, camTween.to, k);
    camera.lookAt(new THREE.Vector3().lerpVectors(camTween.lf, camTween.lt, k));
  } else player.update(dt);
  if (flow.phase === 'explore' || flow.phase === 'doorstep') updateAim();
  // door swing
  const doorWant = doorOpen ? 1.45 : 0;
  building.door.rotation.y += (doorWant - building.door.rotation.y) * Math.min(1, dt * 2.5);
  // window: open in the finale
  const paneWant = finaleT >= 0 ? 1.25 : 0;
  building.paneL.rotation.y += (-paneWant - building.paneL.rotation.y) * Math.min(1, dt * 2);
  building.paneR.rotation.y += (paneWant - building.paneR.rotation.y) * Math.min(1, dt * 2);
  // weather
  building.glassUniforms.uTime.value = T;
  building.glassUniforms.uWet.value = atmo.wet();
  if (performance.now() > nextFlash && flow.phase !== 'lobby') {
    atmo.flash();
    if (atmo.wet() > 0.5) sound.thunder();
    nextFlash = performance.now() + 18000 + Math.random() * 14000;
  }
  if (finaleT >= 0) finaleT += dt;
  keep.jar.getWorldPosition(jarWorld);
  keep.jarGlow.intensity = finaleT >= 0 || store.finaleDone ? 0 : store.glow * 1.4;
  atmo.update(dt, T, { jarWorld, glow: store.finaleDone ? 1 : store.glow, finaleT });
  // living details
  furniture.fan.rotation.y += dt * 0.9;
  furniture.bulbs.forEach(
    (b) =>
      ((b.material as THREE.MeshStandardMaterial).emissiveIntensity =
        2.2 + Math.sin(T * 1.4 + b.userData.ph) * 0.8),
  );
  furniture.stars.forEach((s) => {
    s.rotation.y = Math.sin(T * 0.5 + s.userData.ph) * 0.6;
  });
  keep.fishTank.children.forEach((f) => {
    const u = f.userData;
    if (!u.fish) return;
    const a2 = T * u.s + u.ph;
    f.position.set(
      Math.cos(a2) * u.r,
      u.y + Math.sin(T * 0.9 + u.ph) * 0.02,
      u.cz + Math.sin(a2) * u.r * 1.6,
    );
    f.rotation.y = -a2 - (u.s > 0 ? Math.PI / 2 : -Math.PI / 2);
  });
  for (const it of keep.items) {
    const u = it.object.userData;
    if (u.pop === undefined) continue;
    u.base ??= it.object.scale.clone();
    u.pop += dt * 2.4;
    const p = Math.min(u.pop, 1);
    it.object.scale.copy(u.base).multiplyScalar(1 + Math.sin(p * Math.PI) * 0.1);
    if (u.pop >= 1) {
      it.object.scale.copy(u.base);
      u.pop = undefined;
    }
  }
  if (peel) {
    peel.t = peel.back ? Math.max(0, peel.t - dt * 2) : Math.min(1, peel.t + dt * (reduceMotion ? 10 : 1.3));
    curl(peel.mesh, peel.t);
    if (!peel.back && peel.t >= 1 && peel.done) {
      const d = peel.done;
      peel.done = undefined;
      d();
    }
    if (peel.back && peel.t <= 0 && peel.done) peel.done();
  }
  composer.render();
});

// keyboard focus stays inside whichever dialog is open
addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  const dlg = ['letter', 'notebook', 'pause', 'finale', 'lobby'].map((id) => $(id)).find((d) => !d.hidden);
  if (!dlg) return;
  const fs = [...dlg.querySelectorAll<HTMLElement>('button, input, select, summary')].filter(
    (b) => getComputedStyle(b).visibility !== 'hidden' && b.offsetParent !== null,
  );
  if (!fs.length) return;
  const a = fs[0],
    z = fs[fs.length - 1];
  if (!dlg.contains(document.activeElement)) {
    e.preventDefault();
    a.focus();
  } else if (e.shiftKey && document.activeElement === a) {
    e.preventDefault();
    z.focus();
  } else if (!e.shiftKey && document.activeElement === z) {
    e.preventDefault();
    a.focus();
  }
});

// Test hook for the Playwright walkthrough only (open with #qa); never used by the experience itself.
if (location.hash === '#qa')
  Object.assign(window, {
    __qa: {
      col,
      doorOpen: () => doorOpen,
      player,
      flow,
      store,
      use: (id: string) => {
        const it = items.find((i) => i.id === id);
        if (it) use(it);
      },
    },
  });
