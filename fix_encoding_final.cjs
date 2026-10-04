// Triple-encoded UTF-8 fix. The ZIP backup has files that were UTF-8 encoded,
// then treated as latin1 and re-encoded to UTF-8, possibly multiple times.
// We need to iteratively decode until stable.

const fs = require('fs');
const path = require('path');

function decodeOneLayer(buf) {
  const str = buf.toString('utf8');
  const bytes = [];
  let changed = false;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code > 127 && code <= 255) {
      bytes.push(code);
      changed = true;
    } else if (code > 255) {
      // Multi-byte char that's already correct (or replacement char)
      const charBuf = Buffer.from(str[i], 'utf8');
      for (const b of charBuf) bytes.push(b);
    } else {
      bytes.push(code);
    }
  }
  return { buf: Buffer.from(bytes), changed };
}

function fixFile(filePath) {
  let buf = fs.readFileSync(filePath);
  let iterations = 0;
  while (iterations < 5) {
    const result = decodeOneLayer(buf);
    if (!result.changed) break;
    buf = result.buf;
    iterations++;
  }
  fs.writeFileSync(filePath, buf);
  return iterations;
}

const srcFiles = [
  'src/components/Tabs.jsx',
  'src/components/ui.jsx',
  'src/components/Auth.jsx',
  'src/components/ChatMarkdown.jsx',
  'src/App.jsx',
  'src/lib/utils.js',
  'src/lib/db.js',
  'src/lib/ai.js',
  'src/lib/aiHelpers.js',
  'src/lib/pdf.js',
  'src/lib/routineTools.js',
  'src/lib/supabaseClient.js',
  'src/lib/useFocusTimer.js',
  'src/main.jsx',
  'src/index.css',
];

// First restore from ZIP
const JSZip = require('jszip');

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
  
  // Step 2: Iteratively decode
  for (const f of srcFiles) {
    if (fs.existsSync(f)) {
      const iters = fixFile(f);
      console.log(`Fixed ${f} (${iters} decode iterations)`);
    }
  }
  
  // Step 3: Verify
  const tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');
  console.log('\n--- VERIFICATION ---');
  console.log('Próximos:', tabs.includes('Próximos'));
  console.log('🎓:', tabs.includes('🎓'));
  console.log('Sábado:', tabs.includes('Sábado'));
  console.log('Terça:', tabs.includes('Terça'));
  console.log('🌙:', tabs.includes('🌙'));
  
  const idx = tabs.indexOf('TIPO_ROTINA_ICONE');
  if (idx >= 0) {
    console.log('\nTIPO_ROTINA_ICONE sample:', JSON.stringify(tabs.substring(idx, idx + 150)));
  }
  
  const ui = fs.readFileSync('src/components/ui.jsx', 'utf8');
  console.log('Manhã (ui.jsx):', ui.includes('Manhã'));
}

main().catch(e => { console.error(e); process.exit(1); });
