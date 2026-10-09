const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

// Remove double T import
app = app.replace(/import \{ T \} from "\.\/components\/ui";\n/, '');

fs.writeFileSync('src/App.jsx', app, 'utf8');
console.log("Fixed double UI import!");
