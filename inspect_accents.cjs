const fs = require('fs');
const JSZip = require('jszip');

async function main() {
  const zip = await JSZip.loadAsync(fs.readFileSync('C:/Users/ryant/Downloads/Minha-vida-em-um-app-backup.zip'));
  
  for (const k of Object.keys(zip.files)) {
    if (k.includes('Tabs.jsx') && !k.includes('tabs/')) {
      const buf = await zip.file(k).async('nodebuffer');
      
      // Find "Próximos" pattern - the ó should be c3 b3 in proper UTF-8
      // In the ZIP, it might be double-encoded differently
      // Let's search for "ximos" and look at what's before it
      let idx = 0;
      while (true) {
        idx = buf.indexOf(Buffer.from('ximos', 'utf8'), idx + 1);
        if (idx < 0) break;
        console.log('Found "ximos" at', idx);
        console.log('  Preceding bytes:', buf.slice(idx - 10, idx).toString('hex'));
        console.log('  Preceding text:', buf.slice(idx - 10, idx + 10).toString('utf8'));
        break;
      }
      
      // Find "Sáb" pattern
      idx = buf.indexOf(Buffer.from('b"', 'utf8'), 0);
      // Better: search for "Seg", "Ter", "Qua" in the DIAS_SEMANA line
      const diasIdx = buf.indexOf(Buffer.from('DIAS_SEMANA', 'utf8'));
      if (diasIdx >= 0) {
        console.log('\nDIAS_SEMANA line:');
        console.log('  text:', buf.slice(diasIdx, diasIdx + 100).toString('utf8'));
        console.log('  hex:', buf.slice(diasIdx, diasIdx + 100).toString('hex'));
      }
      
      // Check what byte sequence represents "á" in this file
      // In proper UTF-8: c3 a1
      // In double-encoded cp1252: c3 83 c2 a1 
      // In triple: even more
      const c3a1 = buf.indexOf(Buffer.from([0xc3, 0xa1]));
      const c383c2a1 = buf.indexOf(Buffer.from([0xc3, 0x83, 0xc2, 0xa1]));
      console.log('\nByte c3a1 (proper á) at:', c3a1);
      console.log('Byte c383c2a1 (double-encoded á) at:', c383c2a1);
      
      if (c383c2a1 >= 0) {
        console.log('  Context:', buf.slice(c383c2a1 - 5, c383c2a1 + 10).toString('utf8'));
      }
      
      break;
    }
  }
}

main();
