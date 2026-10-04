const fs = require('fs');
const JSZip = require('jszip');

async function listZip() {
    const data = fs.readFileSync('C:/Users/ryant/Downloads/Minha-vida-em-um-app-backup.zip');
    const zip = await JSZip.loadAsync(data);
    console.log(Object.keys(zip.files).slice(0, 10));
}
listZip();
