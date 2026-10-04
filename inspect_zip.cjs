const fs = require('fs');
const JSZip = require('jszip');

async function main() {
  const data = fs.readFileSync('C:/Users/ryant/Downloads/Minha-vida-em-um-app-backup.zip');
  const zip = await JSZip.loadAsync(data);
  
  // Find the right key
  for (const key of Object.keys(zip.files)) {
    if (key.includes('Tabs.jsx')) {
      console.log('Key found:', JSON.stringify(key));
      const buf = await zip.file(key).async('nodebuffer');
      
      // Find "sono:" in the raw buffer
      const sonoIdx = buf.indexOf(Buffer.from('sono:', 'utf8'));
      if (sonoIdx >= 0) {
        const slice = buf.slice(sonoIdx, sonoIdx + 50);
        console.log('RAW ZIP hex around sono:', slice.toString('hex'));
        console.log('RAW ZIP text around sono:', slice.toString('utf8'));
        
        // Check what 🌙 should be: f0 9f 8c 99
        console.log('\nExpected 🌙 hex: f09f8c99');
        console.log('Does raw ZIP contain f09f8c99?', buf.includes(Buffer.from([0xf0, 0x9f, 0x8c, 0x99])));
      }
      
      // Also check Próximos
      const proxIdx = buf.indexOf(Buffer.from('ximos', 'utf8'));
      if (proxIdx >= 0) {
        const slice = buf.slice(proxIdx - 10, proxIdx + 10);
        console.log('\nAround "ximos":', slice.toString('hex'));
        console.log('Text:', slice.toString('utf8'));
      }
      
      break;
    }
  }
}

main();
