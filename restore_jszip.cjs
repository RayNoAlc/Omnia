const fs = require('fs');
const JSZip = require('jszip');

async function restoreZip() {
    const data = fs.readFileSync('C:/Users/ryant/Downloads/Minha-vida-em-um-app-backup.zip');
    const zip = await JSZip.loadAsync(data);
    
    const tabsData = await zip.file('src/components/Tabs.jsx').async('string');
    fs.writeFileSync('src/components/Tabs.jsx', tabsData, 'utf8');
    
    const appData = await zip.file('src/App.jsx').async('string');
    fs.writeFileSync('src/App.jsx', appData, 'utf8');
    
    const uiData = await zip.file('src/components/ui.jsx').async('string');
    fs.writeFileSync('src/components/ui.jsx', uiData, 'utf8');
    
    const utilsData = await zip.file('src/lib/utils.js').async('string');
    fs.writeFileSync('src/lib/utils.js', utilsData, 'utf8');
    
    console.log('Restored pristine files from zip via JSZip!');
}

restoreZip();
