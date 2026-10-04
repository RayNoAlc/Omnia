const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const regex = /\{hours\.map\(\(_, i\) => \([\s\S]*?rgba\(128,128,128,0\.1\)" \}\}>\S*<\/div>\s*\)\)\}/;
const replace = `{hourLines.map((line, i) => (
                      <div key={i} className="absolute w-full border-t pointer-events-none" style={{ top: line.top, height: 1, borderColor: "rgba(128,128,128,0.1)" }}></div>
                    ))}`;

code = code.replace(regex, replace);
fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
