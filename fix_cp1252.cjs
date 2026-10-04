// ROOT CAUSE FIX: The ZIP backup has files where UTF-8 bytes were interpreted
// as Windows cp1252 and then re-encoded as UTF-8. This is a well-known "mojibake"
// pattern. We reverse it by: read as UTF-8 → map codepoints back to cp1252 bytes → decode as UTF-8.

const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

// cp1252 maps these codepoints back to single bytes 0x80-0x9F
const cp1252Reverse = new Map([
  [0x20AC, 0x80], // €
  [0x201A, 0x82], // ‚
  [0x0192, 0x83], // ƒ
  [0x201E, 0x84], // „
  [0x2026, 0x85], // …
  [0x2020, 0x86], // †
  [0x2021, 0x87], // ‡
  [0x02C6, 0x88], // ˆ
  [0x2030, 0x89], // ‰
  [0x0160, 0x8A], // Š
  [0x2039, 0x8B], // ‹
  [0x0152, 0x8C], // Œ
  [0x017D, 0x8E], // Ž
  [0x2018, 0x91], // '
  [0x2019, 0x92], // '
  [0x201C, 0x93], // "
  [0x201D, 0x94], // "
  [0x2022, 0x95], // •
  [0x2013, 0x96], // –
  [0x2014, 0x97], // —
  [0x02DC, 0x98], // ˜
  [0x2122, 0x99], // ™
  [0x0161, 0x9A], // š
  [0x203A, 0x9B], // ›
  [0x0153, 0x9C], // œ
  [0x017E, 0x9E], // ž
  [0x0178, 0x9F], // Ÿ
]);

function undoCp1252Layer(str) {
  const bytes = [];
  let anyMapped = false;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    const cp1252Byte = cp1252Reverse.get(code);
    if (cp1252Byte !== undefined) {
      bytes.push(cp1252Byte);
      anyMapped = true;
    } else if (code <= 255) {
      bytes.push(code);
    } else {
      // Already a valid multi-byte char, keep its UTF-8 bytes
      const charBuf = Buffer.from(str[i], 'utf8');
      for (const b of charBuf) bytes.push(b);
    }
  }
  return { buf: Buffer.from(bytes), changed: anyMapped };
}

function fixFile(filePath) {
  let buf = fs.readFileSync(filePath);
  let iterations = 0;
  while (iterations < 10) {
    const str = buf.toString('utf8');
    const result = undoCp1252Layer(str);
    if (!result.changed) break;
    buf = result.buf;
    iterations++;
  }
  fs.writeFileSync(filePath, buf);
  return iterations;
}

async function main() {
  // Step 1: Restore raw bytes from ZIP
  const data = fs.readFileSync('C:/Users/ryant/Downloads/Minha-vida-em-um-app-backup.zip');
  const zip = await JSZip.loadAsync(data);
  
  for (const [name, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    const normalized = name.replace(/\\/g, '/');
    if (!normalized.startsWith('src/')) continue;
    fs.mkdirSync(path.dirname(normalized), { recursive: true });
    const buf = await entry.async('nodebuffer');
    fs.writeFileSync(normalized, buf);
  }
  console.log('Step 1: Restored raw files from ZIP');

  // Step 2: Fix all source files
  const srcFiles = [];
  function walk(dir) {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) walk(full);
      else if (/\.(jsx?|css)$/.test(f)) srcFiles.push(full);
    }
  }
  walk('src');
  
  for (const f of srcFiles) {
    const iters = fixFile(f);
    if (iters > 0) console.log(`Fixed ${f} (${iters} layers)`);
  }

  // Step 3: Verify
  const tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');
  const ui = fs.readFileSync('src/components/ui.jsx', 'utf8');
  const utils = fs.readFileSync('src/lib/utils.js', 'utf8');
  
  console.log('\n=== VERIFICATION ===');
  console.log('Tabs.jsx:');
  console.log('  Próximos:', tabs.includes('Próximos'));
  console.log('  🎓:', tabs.includes('🎓'));
  console.log('  🌙:', tabs.includes('🌙'));
  console.log('  Sábado:', tabs.includes('Sábado'));
  console.log('  Terça:', tabs.includes('Terça'));
  console.log('  —:', tabs.includes('—'));
  
  const idx = tabs.indexOf('TIPO_ROTINA_ICONE');
  if (idx >= 0) console.log('  ICONE sample:', tabs.substring(idx + 30, idx + 80));
  
  console.log('ui.jsx:');
  console.log('  Manhã:', ui.includes('Manhã'));
  
  console.log('utils.js:');
  console.log('  exceções:', utils.includes('exceções'));
  console.log('  amanhã:', utils.includes('amanhã'));
}

main().catch(e => { console.error(e); process.exit(1); });
