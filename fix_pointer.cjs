const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');
code = code.replace(
  /className="absolute w-full border-t" style=\{\{ top: i \* HOUR_HEIGHT \+ Y_OFFSET,\s*height: 1, borderColor: "rgba\(128,128,128,0\.1\)" \}\}/g,
  'className="absolute w-full border-t pointer-events-none" style={{ top: i * HOUR_HEIGHT + Y_OFFSET, height: 1, borderColor: "rgba(128,128,128,0.1)" }}'
);
fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
