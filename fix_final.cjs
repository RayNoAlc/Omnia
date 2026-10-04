// FINAL APPROACH: The ZIP has mixed encoding in Tabs.jsx specifically.
// Most files have 1 layer of cp1252 mojibake, but Tabs.jsx has 2 layers for emojis
// and 1 layer for accented chars.
//
// The CORRECT approach: process the raw ZIP bytes through iconv to decode
// cp1252 interpretation back to the original bytes, then those bytes are valid UTF-8.
//
// But since some parts are already correct UTF-8 and some are double-encoded,
// we need a SELECTIVE approach. We'll:
// 1. Extract from ZIP as raw buffer
// 2. For each file, attempt the following string replacements on the UTF-8 text
//    to fix known double-encoded cp1252 mojibake patterns

const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

// Build a map of all possible double-encoded UTF-8 sequences via cp1252
// When a UTF-8 byte sequence like c3 a1 (á) is read as cp1252:
//   c3 -> Ã (U+00C3), a1 -> ¡ (U+00A1)
// Then re-encoded as UTF-8: Ã = c3 83, ¡ = c2 a1
// So "á" becomes "Ã¡" in the file, stored as bytes c3 83 c2 a1
//
// Similarly for 4-byte emoji like 🌙 (f0 9f 8c 99):
//   f0 -> ð (U+00F0), 9f -> Ÿ (cp1252: U+0178), 8c -> Œ (cp1252: U+0152), 99 -> ™ (cp1252: U+2122)
// Re-encoded: ð=c3 b0, Ÿ=c5 b8, Œ=c5 92, ™=e2 84 a2
// So 🌙 becomes "ðŸŒ™" stored as c3 b0 c5 b8 c5 92 e2 84 a2

// Build mojibake string -> correct string replacement map
function buildReplacements() {
  const cp1252Map = new Map();
  // Fill with identity for 0-255
  for (let i = 0; i < 256; i++) cp1252Map.set(i, i);
  // cp1252 special chars
  const specials = {
    0x80: 0x20AC, 0x82: 0x201A, 0x83: 0x0192, 0x84: 0x201E,
    0x85: 0x2026, 0x86: 0x2020, 0x87: 0x2021, 0x88: 0x02C6,
    0x89: 0x2030, 0x8A: 0x0160, 0x8B: 0x2039, 0x8C: 0x0152,
    0x8E: 0x017D, 0x91: 0x2018, 0x92: 0x2019, 0x93: 0x201C,
    0x94: 0x201D, 0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014,
    0x98: 0x02DC, 0x99: 0x2122, 0x9A: 0x0161, 0x9B: 0x203A,
    0x9C: 0x0153, 0x9E: 0x017E, 0x9F: 0x0178,
  };
  for (const [k, v] of Object.entries(specials)) cp1252Map.set(Number(k), v);
  
  // For common accented characters used in Portuguese, compute the mojibake
  const ptChars = [
    'á', 'à', 'â', 'ã', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú', 'ü',
    'ç', 'Á', 'À', 'Â', 'Ã', 'É', 'Ê', 'Í', 'Ó', 'Ô', 'Õ', 'Ú', 'Ç',
    '\u2014', '\u2013', '\u201C', '\u201D', '\u2018', '\u2019', '\u2026',
    '🌙', '🎓', '📖', '💼', '📚', '🏋', '🍽', '🌿', '🎮', '⚽', '👤', '🩺', '🎉',
    '🎯', '✅', '📌', '📎', '🔄', '🔊', '🔍', '➡', '⬆', '⬇',
  ];

  const replacements = [];
  
  for (const char of ptChars) {
    const utf8Bytes = Buffer.from(char, 'utf8');
    
    // Simulate cp1252 misinterpretation
    let mojibakeStr = '';
    for (const byte of utf8Bytes) {
      const codepoint = cp1252Map.get(byte);
      mojibakeStr += String.fromCodePoint(codepoint);
    }
    
    // The mojibake string, when present in the file, should be replaced with the correct char
    if (mojibakeStr !== char) {
      replacements.push({ from: mojibakeStr, to: char });
    }
  }
  
  // Sort by length descending (longer patterns first to avoid partial matches)
  replacements.sort((a, b) => b.from.length - a.from.length);
  
  return replacements;
}

function fixText(text, replacements) {
  let result = text;
  let changed = true;
  let iterations = 0;
  
  while (changed && iterations < 3) {
    changed = false;
    iterations++;
    for (const r of replacements) {
      if (result.includes(r.from)) {
        result = result.split(r.from).join(r.to);
        changed = true;
      }
    }
  }
  
  return result;
}

async function main() {
  const replacements = buildReplacements();
  
  console.log('Built', replacements.length, 'replacement rules.');
  console.log('Sample rules:');
  for (const r of replacements.slice(0, 5)) {
    console.log(`  "${r.from}" -> "${r.to}"`);
  }
  
  const zipData = fs.readFileSync('C:/Users/ryant/Downloads/Minha-vida-em-um-app-backup.zip');
  const zip = await JSZip.loadAsync(zipData);
  
  for (const [name, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    const normalized = name.replace(/\\/g, '/');
    if (!normalized.startsWith('src/')) continue;
    
    const destPath = path.resolve(normalized);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    
    const rawBuf = await entry.async('nodebuffer');
    
    if (/\.(jsx?|css)$/i.test(normalized)) {
      const text = rawBuf.toString('utf8');
      const fixed = fixText(text, replacements);
      fs.writeFileSync(destPath, fixed, 'utf8');
    } else {
      fs.writeFileSync(destPath, rawBuf);
    }
  }
  
  console.log('\nFiles restored and fixed.');
  
  // Verify
  const tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');
  const ui = fs.readFileSync('src/components/ui.jsx', 'utf8');
  const utils = fs.readFileSync('src/lib/utils.js', 'utf8');
  
  const checks = [
    ['Próximos', tabs.includes('Próximos')],
    ['🎓', tabs.includes('🎓')],
    ['🌙', tabs.includes('🌙')],
    ['Sábado', tabs.includes('Sábado')],
    ['Terça', tabs.includes('Terça')],
    ['—', tabs.includes('—')],
    ['Manhã', ui.includes('Manhã')],
    ['exceções', utils.includes('exceções')],
    ['amanhã', utils.includes('amanhã')],
    ['No FFFD in Tabs', !tabs.includes('\uFFFD')],
    ['No FFFD in utils', !utils.includes('\uFFFD')],
    ['No FFFD in ui', !ui.includes('\uFFFD')],
  ];
  
  let pass = 0;
  for (const [label, ok] of checks) {
    console.log(`${ok ? '✓' : '✗'} ${label}`);
    if (ok) pass++;
  }
  console.log(`\n${pass}/${checks.length} passed`);
  
  const idx = tabs.indexOf('TIPO_ROTINA_ICONE');
  if (idx >= 0) console.log('\nICONE:', tabs.substring(idx + 30, idx + 130));
  
  const diasIdx = tabs.indexOf('DIAS_SEMANA');
  if (diasIdx >= 0) console.log('DIAS:', tabs.substring(diasIdx, diasIdx + 80));
}

main().catch(e => { console.error(e); process.exit(1); });
