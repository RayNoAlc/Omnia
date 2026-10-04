// The ZIP itself contains double-UTF8-encoded files.
// The original files had UTF-8 text, but they were saved/zipped with
// the bytes being interpreted as latin1/cp1252, then re-encoded to UTF-8.
// We need to: read as UTF-8 -> interpret those codepoints as latin1 bytes -> decode those bytes as UTF-8.

const fs = require('fs');
const path = require('path');

function fixDoubleUTF8(filePath) {
  const buf = fs.readFileSync(filePath);
  const wrongStr = buf.toString('utf8');
  
  // Convert each char's codepoint to a byte (latin1 interpretation)
  const bytes = [];
  for (let i = 0; i < wrongStr.length; i++) {
    const code = wrongStr.charCodeAt(i);
    if (code > 255) {
      // This character isn't part of double-encoding, keep as multi-byte UTF-8
      const charBuf = Buffer.from(wrongStr[i], 'utf8');
      for (const b of charBuf) bytes.push(b);
    } else {
      bytes.push(code);
    }
  }
  
  const fixedBuf = Buffer.from(bytes);
  const fixedStr = fixedBuf.toString('utf8');
  fs.writeFileSync(filePath, fixedStr, 'utf8');
  return fixedStr;
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

for (const f of srcFiles) {
  if (fs.existsSync(f)) {
    fixDoubleUTF8(f);
    console.log('Fixed:', f);
  }
}

// Verify
const tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');
console.log('\n--- VERIFICATION ---');
console.log('Próximos found:', tabs.includes('Próximos'));
console.log('🎓 found:', tabs.includes('🎓'));
console.log('Sábado found:', tabs.includes('Sábado'));
console.log('Terça found:', tabs.includes('Terça'));

const idx = tabs.indexOf('TIPO_ROTINA_ICONE');
if (idx >= 0) {
  console.log('TIPO_ROTINA_ICONE line:', tabs.substring(idx, idx + 200));
}
