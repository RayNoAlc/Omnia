const fs = require('fs');
const path = require('path');

function fixFile(file) {
    if (!fs.existsSync(file)) return;
    const buffer = fs.readFileSync(file);
    let str = buffer.toString('utf8');
    
    // Attempt binary decode if it's double encoded
    try {
        let fixed = Buffer.from(str, 'binary').toString('utf8');
        if (fixed.includes('Próximos') || fixed.includes('amanhã') || fixed.includes('Sábado')) {
            str = fixed;
        }
    } catch(e) {}
    
    // Replace broken patterns that Expand-Archive ANSI decoding caused
    // This is brutal but effective for portuguese text
    const replacements = {
        'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú',
        'Ã¢': 'â', 'Ãª': 'ê', 'Ã®': 'î', 'Ã´': 'ô', 'Ã»': 'û',
        'Ã£': 'ã', 'Ãµ': 'õ',
        'Ã§': 'ç',
        'Ã': 'Á', 'Ã‰': 'É', 'Ã': 'Í', 'Ã“': 'Ó', 'Ãš': 'Ú',
        'Ã‚': 'Â', 'ÃŠ': 'Ê', 'ÃŽ': 'Î', 'Ã”': 'Ô', 'Ã›': 'Û',
        'Ãƒ': 'Ã', 'Ã•': 'Õ',
        'Ã‡': 'Ç',
        'ðŸ“Œ': '📌',
        'â€“': '—',
        // Common powershell ANSI replacements where it just throws away the unicode:
        'Sǭb': 'Sáb',
        'Tera': 'Terça',
        'Sbado': 'Sábado',
        'Sb': 'Sáb',
        'Prximos': 'Próximos',
        'Manh': 'Manhã',
        'Reviso': 'Revisão',
        'excees': 'exceções',
        'alterao': 'alteração',
        ' ': 'à ',
        'no': 'não',
        '?': '—',
        '': 'á', // fallback for remaining  which are usually 'á' or 'ã' or 'ç'. It's risky but better than .
    };

    for (const [bad, good] of Object.entries(replacements)) {
        str = str.split(bad).join(good);
    }
    
    // manual fix
    str = str.replace(/Pr.ximos/g, 'Próximos');
    str = str.replace(/Manh./g, 'Manhã');
    str = str.replace(/amanh./g, 'amanhã');
    str = str.replace(/n.o/g, 'não');

    fs.writeFileSync(file, str, 'utf8');
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) walkDir(full);
        else if (full.endsWith('.js') || full.endsWith('.jsx')) fixFile(full);
    }
}

walkDir('src');
