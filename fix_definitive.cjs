// DEFINITIVE FIX:
// 1. Restore pristine bytes from ZIP
// 2. Apply cp1252 reverse mapping to undo the mojibake
// 3. Verify every known string

const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const cp1252Reverse = new Map([
  [0x20AC, 0x80], [0x201A, 0x82], [0x0192, 0x83], [0x201E, 0x84],
  [0x2026, 0x85], [0x2020, 0x86], [0x2021, 0x87], [0x02C6, 0x88],
  [0x2030, 0x89], [0x0160, 0x8A], [0x2039, 0x8B], [0x0152, 0x8C],
  [0x017D, 0x8E], [0x2018, 0x91], [0x2019, 0x92], [0x201C, 0x93],
  [0x201D, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
  [0x02DC, 0x98], [0x2122, 0x99], [0x0161, 0x9A], [0x203A, 0x9B],
  [0x0153, 0x9C], [0x017E, 0x9E], [0x0178, 0x9F],
]);

function undoCp1252Mojibake(rawBuffer) {
  // Iterate: decode UTF-8 string, map cp1252 codepoints back to bytes, repeat
  let buf = rawBuffer;
  for (let iter = 0; iter < 5; iter++) {
    const str = buf.toString('utf8');
    
    // Check if any cp1252-mapped chars or >127 <=255 chars exist
    let hasMojibake = false;
    for (const c of str) {
      const code = c.charCodeAt(0);
      if (cp1252Reverse.has(code) || (code > 127 && code <= 255)) {
        hasMojibake = true;
        break;
      }
    }
    if (!hasMojibake) break;
    
    const bytes = [];
    for (const c of str) {
      const code = c.charCodeAt(0);
      const mapped = cp1252Reverse.get(code);
      if (mapped !== undefined) {
        bytes.push(mapped);
      } else if (code <= 255) {
        bytes.push(code);
      } else {
        // Keep multi-byte chars as-is (they're already correct UTF-8)
        const charBuf = Buffer.from(c, 'utf8');
        for (const b of charBuf) bytes.push(b);
      }
    }
    buf = Buffer.from(bytes);
  }
  return buf;
}

async function main() {
  const zipData = fs.readFileSync('C:/Users/ryant/Downloads/Minha-vida-em-um-app-backup.zip');
  const zip = await JSZip.loadAsync(zipData);
  
  let fixedCount = 0;
  
  for (const [name, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    const normalized = name.replace(/\\/g, '/');
    if (!normalized.startsWith('src/')) continue;
    
    const destPath = path.resolve(normalized);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    
    // Get raw bytes from ZIP
    const rawBuf = await entry.async('nodebuffer');
    
    // Only fix text files
    if (/\.(jsx?|css|json)$/i.test(normalized)) {
      const fixedBuf = undoCp1252Mojibake(rawBuf);
      fs.writeFileSync(destPath, fixedBuf);
      fixedCount++;
    } else {
      fs.writeFileSync(destPath, rawBuf);
    }
  }
  
  console.log(`Restored and fixed ${fixedCount} files.\n`);
  
  // === VERIFICATION ===
  const tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');
  const ui = fs.readFileSync('src/components/ui.jsx', 'utf8');
  const utils = fs.readFileSync('src/lib/utils.js', 'utf8');
  
  const checks = [
    ['Tabs.jsx Próximos', tabs.includes('Próximos')],
    ['Tabs.jsx 🎓', tabs.includes('🎓')],
    ['Tabs.jsx 🌙', tabs.includes('🌙')],
    ['Tabs.jsx Sábado', tabs.includes('Sábado')],
    ['Tabs.jsx Terça', tabs.includes('Terça')],
    ['Tabs.jsx —', tabs.includes('—')],
    ['Tabs.jsx 🎯', tabs.includes('🎯')],
    ['Tabs.jsx ✅', tabs.includes('✅')],
    ['ui.jsx Manhã', ui.includes('Manhã')],
    ['utils.js exceções', utils.includes('exceções')],
    ['utils.js amanhã', utils.includes('amanhã')],
    ['utils.js revisão', utils.includes('revisão')],
    ['No U+FFFD in Tabs', !tabs.includes('\uFFFD')],
    ['No U+FFFD in utils', !utils.includes('\uFFFD')],
  ];
  
  let allPass = true;
  for (const [label, ok] of checks) {
    console.log(`${ok ? '✓' : '✗'} ${label}`);
    if (!ok) allPass = false;
  }
  
  if (allPass) {
    console.log('\n🎉 ALL CHECKS PASSED! Encoding is perfectly fixed.');
  } else {
    console.log('\n❌ Some checks failed.');
    // Show a sample of what the emoji looks like
    const idx = tabs.indexOf('TIPO_ROTINA_ICONE');
    if (idx >= 0) console.log('ICONE sample:', tabs.substring(idx + 30, idx + 120));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
