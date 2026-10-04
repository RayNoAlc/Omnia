const fs = require('fs');
const JSZip = require('jszip');

async function restoreZip() {
    const data = fs.readFileSync('C:/Users/ryant/Downloads/Minha-vida-em-um-app-backup.zip');
    const zip = await JSZip.loadAsync(data);
    
    for (const key of Object.keys(zip.files)) {
        if (!key.endsWith('/')) {
            const dest = key.replace(/\\\\/g, '/');
            if (dest.startsWith('src/')) {
                const content = await zip.file(key).async('nodebuffer');
                fs.writeFileSync(dest, content);
            }
        }
    }
    console.log('Restored pristine src/ from zip via JSZip!');
}

restoreZip();
