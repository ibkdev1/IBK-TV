#!/usr/bin/env node
/**
 * IBK-TV · Android Launcher Icon Generator
 * Creates Malian flag PNG launcher icons for all mipmap densities.
 * No npm packages needed — uses only built-in Node.js modules.
 */

'use strict';

const zlib = require('zlib');
const fs   = require('fs');
const path = require('path');

// ── CRC-32 ────────────────────────────────────────────────────
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  CRC_TABLE[i] = c;
}
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (const b of buf) crc = CRC_TABLE[(crc ^ b) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// ── PNG chunk ─────────────────────────────────────────────────
function chunk(type, data) {
  const t   = Buffer.from(type, 'ascii');
  const len = Buffer.allocUnsafe(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.allocUnsafe(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crcBuf]);
}

// ── Malian flag PNG (green | yellow | red vertical tricolor) ──
// Official colors: Green #14B53A · Gold #FCD116 · Red #CE1126
function makeMaliFlagPNG(size) {
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const third = Math.floor(size / 3);
  const rows = [];

  for (let y = 0; y < size; y++) {
    const scanline = Buffer.allocUnsafe(1 + size * 3);
    scanline[0] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      let r, g, b;
      if (x < third) {
        // Green stripe
        r = 20; g = 181; b = 58;
      } else if (x < third * 2) {
        // Gold stripe
        r = 252; g = 209; b = 22;
      } else {
        // Red stripe
        r = 206; g = 17; b = 38;
      }
      scanline[1 + x * 3]     = r;
      scanline[1 + x * 3 + 1] = g;
      scanline[1 + x * 3 + 2] = b;
    }
    rows.push(scanline);
  }

  const idat = zlib.deflateSync(Buffer.concat(rows), { level: 9 });
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Icon specs ────────────────────────────────────────────────
const DENSITIES = {
  'mipmap-mdpi':    48,
  'mipmap-hdpi':    72,
  'mipmap-xhdpi':   96,
  'mipmap-xxhdpi':  144,
  'mipmap-xxxhdpi': 192,
};

const resDir = path.join(__dirname, 'app', 'src', 'main', 'res');
let count = 0;

for (const [density, size] of Object.entries(DENSITIES)) {
  const dir = path.join(resDir, density);
  fs.mkdirSync(dir, { recursive: true });

  const png = makeMaliFlagPNG(size);
  fs.writeFileSync(path.join(dir, 'ic_launcher.png'),       png);
  fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), png);

  console.log(`  ✓  ${density}/ic_launcher.png  (${size}×${size} px)  🇲🇱`);
  count++;
}

console.log(`\n✅  ${count * 2} Malian flag icons written to res/mipmap-*/\n`);
