// Fails when private data or banned wording would ship. Patterns live here, never in content.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const root = process.argv[2] ?? 'src';
const TEXT = new Set(['.ts', '.js', '.mjs', '.html', '.css', '.json', '.md', '.txt']);
const rules = [
  // Vietnamese mobile numbers; the lookbehind skips decimals like .0773993808 inside libraries
  { name: 'phone number', re: /(?<![.\d\w])0[35789]\d{8}(?!\d)/ },
  { name: 'street address', re: /\b\d{2,4}\/\d{1,4}\/\d{1,4}\b/ },
  { name: 'address street name with house number', re: /\d+\s*L[ýy] Th[ưu][ờo]ng Ki[ệe]t/i },
  { name: 'clothing size', re: /\bsize\s*:?\s*3\d\b/i },
  { name: 'banned emoticon', re: /:\){3,}/ },
  { name: 'banned word', re: /l[àa]m d[âa]u/i },
];
const hits = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (TEXT.has(extname(p))) {
      const text = readFileSync(p, 'utf8');
      for (const r of rules) {
        const m = text.match(r.re);
        if (m)
          hits.push(
            `${p}: ${r.name} near "${text.slice(Math.max(0, m.index - 20), m.index + m[0].length + 10).replace(/\s+/g, ' ')}"`,
          );
      }
    }
  }
}
walk(root);
if (hits.length) {
  console.error('Private/banned content found:\n' + hits.join('\n'));
  process.exit(1);
}
console.log(`check-private: clean (${root})`);
