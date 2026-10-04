const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function main() {
  const data = fs.readFileSync('C:/Users/ryant/Downloads/Minha-vida-em-um-app-backup.zip');
  const zip = await JSZip.loadAsync(data);

  let count = 0;
  for (const [name, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    // Only restore src/ files
    if (!name.startsWith('src/') && !name.startsWith('src\\')) continue;
    
    const normalized = name.replace(/\\/g, '/');
    const destPath = path.resolve(normalized);
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    
    // Extract as raw buffer to preserve encoding perfectly
    const buf = await entry.async('nodebuffer');
    fs.writeFileSync(destPath, buf);
    count++;
  }
  
  console.log(`Restored ${count} files from ZIP with perfect encoding.`);
  
  // Verify a known string
  const tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');
  if (tabs.includes('Próximos')) {
    console.log('VERIFY OK: "Próximos" found correctly.');
  } else {
    console.log('VERIFY FAIL: "Próximos" not found!');
  }
  if (tabs.includes('🎓')) {
    console.log('VERIFY OK: emoji 🎓 found correctly.');
  } else {
    console.log('VERIFY FAIL: emoji 🎓 not found!');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
