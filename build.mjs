import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const output = resolve(root, 'dist');
const appFiles = [
  'index.html', 'style.css', 'app.js', 'street3d.js',
  '酒樓.png', '游泳池.png', '圖書館.png', '郵政局.png', '書店.png',
  '快餐店.png', '學校.png', '運動場.png', '家.png', '公園.png',
  '玩具店.png', '服裝店.png', '面包店.png'
]

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of appFiles) await cp(resolve(root, file), resolve(output, file));
await cp(resolve(root, 'assets'), resolve(output, 'assets'), { recursive: true });
console.log('Static site prepared in dist/.');
