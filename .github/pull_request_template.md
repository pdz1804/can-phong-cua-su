## What and why

<!-- Behaviour change and motivation. -->

## How verified

- [ ] `npm run typecheck && npm test && npm run build`
- [ ] Walked the room on desktop and a phone (if visual)
- [ ] `npm run test:e2e` (if the flow changed)

## Invariants

- [ ] No address, phone number or clothing size anywhere (`npm run check:private`)
- [ ] New designer models are listed in `public/models/designer/manifest.json`, glTF 2.0 binary, no Draco
- [ ] Download budget raised in `.github/bundle-baseline.json` only when the growth is intended
