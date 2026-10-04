const fs = require('fs');
function decodeDoubleUTF8(file) {
    const buffer = fs.readFileSync(file);
    let str = buffer.toString('utf8');
    
    // Double UTF-8 decoding technique: convert back to latin1 and then decode to utf8
    // If the file was saved as UTF-8 but its contents are double-encoded:
    try {
        let fixed = Buffer.from(str, 'binary').toString('utf8');
        // Let's do a simple check if the fixed string looks better
        if (fixed.includes('Próximos')) {
            fs.writeFileSync(file, fixed, 'utf8');
            console.log('Fixed ' + file + ' using binary decode.');
            return;
        }
    } catch(e) {}
    
    // Manual replacements if the above failed because it wasn't uniformly double-encoded
    str = str.replace(/PrÃ³ximos/g, 'Próximos');
    str = str.replace(/ðŸ“Œ/g, '📌');
    str = str.replace(/â€“/g, '—');
    str = str.replace(/SÃ¡bado/g, 'Sábado');
    str = str.replace(/SÃ¡b/g, 'Sáb');
    str = str.replace(/TerÃ§a/g, 'Terça');
    str = str.replace(/Ã§/g, 'ç');
    str = str.replace(/Ã£/g, 'ã');
    str = str.replace(/Ã¡/g, 'á');
    str = str.replace(/Ã³/g, 'ó');
    str = str.replace(/Ã©/g, 'é');
    str = str.replace(/Ã/g, 'í');
    str = str.replace(/prÃ³ximos/g, 'próximos');
    
    fs.writeFileSync(file, str, 'utf8');
    console.log('Fixed ' + file + ' using regex.');
}
decodeDoubleUTF8('src/components/Tabs.jsx');
decodeDoubleUTF8('src/App.jsx');
