# Căn phòng của Su

A small 3D room you can walk around in the browser: a 20/10 gift from Phú to Su. You start in the hallway in front of her door, open it, and explore a cosy room on a rainy night. Every keepsake and every note on the cork board opens a letter about a real day the two of them shared. Open enough of them and the firefly jar on the windowsill lights up for the finale.

Live: https://can-phong-cua-su.web.app (private link, not indexed)

## What is in it

| Part    | Details                                                                                                                                                                                                    |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lobby   | Slowly orbiting dollhouse preview, weather (rainy night, clear night, sunset), settings (music, ambience, graphics, look sensitivity)                                                                      |
| Walking | First person. Desktop: WASD + mouse (pointer lock), E or click to open. Phone: left-thumb joystick, swipe to look, tap to open. Capsule collision against wall and furniture footprints                    |
| Content | 36 dated memories on the board, 37 keepsake letters, a 9-page notebook "Sổ tay về em", a finale                                                                                                            |
| World   | Real proportions (10 × 10 m room + hallway), CC0 furniture models, Poly Haven HDRI and PBR textures, rainy-glass shader, moonlight through a real window opening, lightning, dust, fireflies, soap bubbles |
| Sound   | Synthesised with Web Audio: rain, music-box lullaby, chimes, paper, footsteps, door, distant thunder                                                                                                       |

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-checks, builds, then scans the bundle for private data
npm run preview    # serve the production build on :4173
```

## Quality gates

| Gate                                                                              | Where                                                       |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Prettier, ESLint, `tsc --noEmit`                                                  | pre-commit (staged files), CI                               |
| Vitest unit tests (flow, storage, movement, content rules)                        | pre-push, CI                                                |
| Private-data scan (phone, address, banned wording) on `src/` and the built bundle | pre-commit, `npm run build`, CI                             |
| Conventional commit messages                                                      | commit-msg hook (commitlint)                                |
| Playwright walkthrough, desktop + phone                                           | CI                                                          |
| Deploy to Firebase Hosting after green CI on `main`, with a content smoke test    | `deploy.yml` (Workload Identity Federation, no stored keys) |

## Layout

```
src/
  content/   timeline, keepsake letters, notebook + finale text
  core/      flow state machine, settings + progress storage
  world/     room + hallway, furniture (CC0 models), keepsakes, cork board, weather, atmosphere
  player/    movement maths, capsule player, touch controls
  audio/     synthesised sound
  ui/        styles
public/
  models/    CC0 GLB models (see public/CREDITS.md)
  textures/  Poly Haven HDRI + PBR textures
```

## Privacy

The notes this gift is written from contain an address and a phone number. They never enter this repository: `scripts/check-private.mjs` fails the commit, the build and CI if anything like them appears.

Phu Nguyen — HCMC, VN
