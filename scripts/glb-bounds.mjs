// Prints approximate bounding boxes of GLB files (POSITION accessor min/max, node scale ignored).
import { readFileSync, readdirSync } from 'node:fs';
const dir = process.argv[2] ?? 'public/models';
for (const f of readdirSync(dir).filter((x) => x.endsWith('.glb'))) {
  const buf = readFileSync(`${dir}/${f}`);
  const len = buf.readUInt32LE(12);
  const json = JSON.parse(buf.subarray(20, 20 + len).toString('utf8'));
  const mn = [Infinity, Infinity, Infinity],
    mx = [-Infinity, -Infinity, -Infinity];
  for (const m of json.meshes ?? [])
    for (const p of m.primitives) {
      const a = json.accessors[p.attributes.POSITION];
      if (a.min)
        for (let i = 0; i < 3; i++) {
          mn[i] = Math.min(mn[i], a.min[i]);
          mx[i] = Math.max(mx[i], a.max[i]);
        }
    }
  const s = (json.nodes ?? []).map((n) => n.scale).filter(Boolean)[0];
  console.log(
    f.padEnd(28),
    mx.map((v, i) => (v - mn[i]).toFixed(2)).join(' x '),
    'min',
    mn.map((v) => v.toFixed(2)).join(','),
    s ? 'nodeScale ' + s.map((v) => v.toFixed(2)) : '',
  );
}
