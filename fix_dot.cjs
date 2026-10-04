const fs = require('fs');
const path = require('path');

function fixMiddleDot(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fixMiddleDot(fullPath);
        } else if (/\.(jsx?)$/.test(file)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('Â·')) {
                content = content.replace(/Â·/g, '·');
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed middle dot in:', fullPath);
            }
        }
    }
}

fixMiddleDot('src');
