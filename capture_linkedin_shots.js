const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const targets = [
  {
    name: '01_vintage_certificate_akshay.png',
    url: 'https://git-nerchuko.vercel.app/quiz.html?cert=GN-2026-PENNZS',
    size: '1440,1050',
    delay: 4000
  },
  {
    name: '02_verification_registry_portal.png',
    url: 'https://git-nerchuko.vercel.app/verify.html?id=GN-2026-PENNZS',
    size: '1440,980',
    delay: 3500
  },
  {
    name: '03_adaptive_3d_difficulty_modal.png',
    url: 'https://git-nerchuko.vercel.app/play.html',
    size: '1440,920',
    delay: 3000
  },
  {
    name: '04_landing_page_hero_visualizer.png',
    url: 'https://git-nerchuko.vercel.app/',
    size: '1440,900',
    delay: 3000
  }
];

for (const t of targets) {
  const dest = path.join(outDir, t.name);
  console.log(`Capturing ${t.name}...`);
  spawnSync(edge, [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    `--window-size=${t.size}`,
    `--virtual-time-budget=${t.delay}`,
    '--user-data-dir=C:\\Users\\Akshay\\AppData\\Local\\Temp\\edge_scr_' + Math.random().toString(36).substring(2,6),
    `--screenshot=${dest}`,
    t.url
  ], { timeout: 25000 });
  
  if (fs.existsSync(dest)) {
    console.log(`✓ Saved ${t.name} (${fs.statSync(dest).size} bytes)`);
  } else {
    console.error(`✗ Failed to capture ${t.name}`);
  }
}

console.log('All screenshots processed!');
