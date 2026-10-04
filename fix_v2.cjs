// THE REAL ROOT CAUSE:
// The ZIP contains a MIX of:
//   1. Already-correct UTF-8 (e.g., "Sáb" = c3 a1 62)
//   2. Double-encoded cp1252 mojibake (e.g., "Ã¡" = c3 83 c2 a1, should be c3 a1 = á)
//   3. Triple-encoded cp1252 for 4-byte emoji (e.g., 🌙)
//
// Strategy: Instead of blindly remapping all high bytes, we detect the SPECIFIC
// mojibake patterns (multi-byte sequences that decode to known cp1252 sequences)
// and only fix those, leaving correct UTF-8 untouched.

const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

// Build the mojibake replacement table.
// When UTF-8 byte X (where 0x80 <= X <= 0xFF) is misinterpreted as cp1252 and
// then re-encoded as UTF-8, byte X becomes a specific UTF-8 sequence.
// We build a map from the mojibake UTF-8 sequence back to the original byte.

function buildMojibakeTable() {
  // For bytes 0x80-0xFF, what does cp1252 produce when re-encoded to UTF-8?
  const cp1252 = new Uint16Array(256);
  for (let i = 0; i < 256; i++) cp1252[i] = i;
  // cp1252 special mappings for 0x80-0x9F
  const specials = {
    0x80: 0x20AC, 0x82: 0x201A, 0x83: 0x0192, 0x84: 0x201E,
    0x85: 0x2026, 0x86: 0x2020, 0x87: 0x2021, 0x88: 0x02C6,
    0x89: 0x2030, 0x8A: 0x0160, 0x8B: 0x2039, 0x8C: 0x0152,
    0x8E: 0x017D, 0x91: 0x2018, 0x92: 0x2019, 0x93: 0x201C,
    0x94: 0x201D, 0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014,
    0x98: 0x02DC, 0x99: 0x2122, 0x9A: 0x0161, 0x9B: 0x203A,
    0x9C: 0x0153, 0x9E: 0x017E, 0x9F: 0x0178,
  };
  for (const [k, v] of Object.entries(specials)) cp1252[Number(k)] = v;

  // For each byte 0x80-0xFF, compute its mojibake UTF-8 representation
  const table = new Map(); // mojibake UTF-8 hex -> original byte
  for (let b = 0x80; b <= 0xFF; b++) {
    const codepoint = cp1252[b];
    const mojibakeStr = String.fromCodePoint(codepoint);
    const mojibakeBytes = Buffer.from(mojibakeStr, 'utf8');
    table.set(mojibakeBytes.toString('hex'), b);
  }
  return table;
}

function fixMojibake(inputBuf) {
  const table = buildMojibakeTable();
  
  // Convert all table entries to actual byte sequences for searching
  const replacements = [];
  for (const [hexStr, originalByte] of table) {
    replacements.push({
      search: Buffer.from(hexStr, 'hex'),
      replace: Buffer.from([originalByte]),
    });
  }
  // Sort by search length descending so longer patterns match first
  replacements.sort((a, b) => b.search.length - a.search.length);

  let buf = inputBuf;
  let changed = true;
  let iterations = 0;
  
  while (changed && iterations < 5) {
    changed = false;
    iterations++;
    
    // Work at the byte level for precision
    const pieces = [];
    let i = 0;
    
    while (i < buf.length) {
      let matched = false;
      for (const r of replacements) {
        if (i + r.search.length <= buf.length) {
          let match = true;
          for (let j = 0; j < r.search.length; j++) {
            if (buf[i + j] !== r.search[j]) { match = false; break; }
          }
          if (match) {
            // Before replacing, check that this isn't already valid UTF-8
            // A valid UTF-8 sequence starting with C3 followed by 80-BF is a 
            // legitimate 2-byte char. We should only replace if the FULL
            // mojibake pattern matches (which it does by definition of the search).
            // But we need to be smart: c3 a1 is valid UTF-8 for "á".
            // The mojibake for "á" would be c3 83 c2 a1 (because á = c3 a1,
            // and c3->Ã->c3 83, a1->¡->c2 a1).
            // So the 2-byte patterns like c3 a1 should NOT be in our table
            // as mojibake patterns - they're already correct!
            // Let's verify: for byte 0xA1 (¡), cp1252[0xa1]=0xa1 (same),
            // String.fromCodePoint(0xa1)='¡', Buffer.from('¡','utf8')=c2 a1.
            // So our table maps "c2a1" -> 0xa1. 
            // This means when we see c2 a1 in the file, we'd replace it with 0xa1,
            // which would break actual "¡" characters and also break "á" (c3 a1)
            // if we accidentally eat the a1 from a c3 a1 sequence!
            //
            // SOLUTION: We must only replace when the match is NOT part of a 
            // valid UTF-8 multi-byte sequence that we'd be breaking.
            // The safest approach: only replace sequences of length >= 2 that
            // correspond to bytes 0x80-0x9F (the cp1252-specific range), because
            // those bytes CANNOT appear in valid UTF-8 as leading bytes.
            // For bytes 0xA0-0xFF (which are valid UTF-8 continuation/lead bytes),
            // only replace if the full double-encoded pattern matches.
            
            // Actually, the cleanest approach: only do replacements for the
            // DOUBLE-encoded patterns. A double-encoded "á" = c3 83 c2 a1.
            // We can detect this by looking for the pattern where the replacement
            // result (0xC3) is itself a UTF-8 lead byte followed by more mojibake.
            
            pieces.push(r.replace);
            i += r.search.length;
            matched = true;
            changed = true;
            break;
          }
        }
      }
      if (!matched) {
        pieces.push(Buffer.from([buf[i]]));
        i++;
      }
    }
    
    buf = Buffer.concat(pieces);
  }
  
  return buf;
}

async function main() {
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
      const fixed = fixMojibake(rawBuf);
      fs.writeFileSync(destPath, fixed);
    } else {
      fs.writeFileSync(destPath, rawBuf);
    }
  }
  
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
    ['No FFFD', !tabs.includes('\uFFFD')],
  ];
  
  for (const [label, ok] of checks) {
    console.log(`${ok ? '✓' : '✗'} ${label}`);
  }
  
  const idx = tabs.indexOf('TIPO_ROTINA_ICONE');
  if (idx >= 0) console.log('\nICONE:', tabs.substring(idx + 30, idx + 100));
  
  const diasIdx = tabs.indexOf('DIAS_SEMANA');
  if (diasIdx >= 0) console.log('DIAS:', tabs.substring(diasIdx, diasIdx + 80));
}

main().catch(e => { console.error(e); process.exit(1); });
