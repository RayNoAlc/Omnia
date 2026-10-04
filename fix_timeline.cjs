const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// 1. Replace HOUR_HEIGHT = 40 with 80 in BOTH places (RotinaTab body and handleDrop)
code = code.replace(/const HOUR_HEIGHT = 40;/g, 'const HOUR_HEIGHT = 80;');

// 2. Fix the hours array generation
const hoursRegex = /const hours = \[\];\s*for \(let m = wakeMin; m <= sleepMin; m \+= 60\) \{\s*const h = Math\.floor\(m \/ 60\) % 24;\s*hours\.push\(`\$\{h\.toString\(\)\.padStart\(2, "0"\)\}:00`\);\s*\}/;

const newHoursCode = `const hourLines = [];
  const startHourMin = Math.floor(wakeMin / 60) * 60;
  for (let m = startHourMin; m <= sleepMin + 60; m += 60) {
    if (m < wakeMin) continue;
    const h = Math.floor(m / 60) % 24;
    hourLines.push({
      label: \`\${h.toString().padStart(2, "0")}:00\`,
      top: ((m - wakeMin) / 60) * HOUR_HEIGHT + Y_OFFSET
    });
  }`;

code = code.replace(hoursRegex, newHoursCode);

// 3. Fix the rendering of hour lines (left column)
const renderLeftRegex = /\{hours\.map\(\(hour, i\) => \(\s*<div key=\{i\} className="absolute w-full text-right pr-2 text-\[10px\]" style=\{\{ top: i \* HOUR_HEIGHT \+ Y_OFFSET - 6, color: T\.inkSoft \}\}>\s*\{hour\}\s*<\/div>\s*\)\)\}/;
const newRenderLeft = `{hourLines.map((line, i) => (
                  <div key={i} className="absolute w-full text-right pr-2 text-[10px]" style={{ top: line.top - 6, color: T.inkSoft }}>
                    {line.label}
                  </div>
                ))}`;
code = code.replace(renderLeftRegex, newRenderLeft);

// 4. Fix the rendering of hour lines (grid lines in the days columns)
const renderGridRegex = /\{hours\.map\(\(_, i\) => \(\s*<div key=\{i\} className="absolute w-full border-t pointer-events-none" style=\{\{ top: i \* HOUR_HEIGHT \+ Y_OFFSET, height: 1, borderColor: "rgba\\(128,128,128,0\\.1\\)" \}\}>\s*<\/div>\s*\)\)\}/g;
const newRenderGrid = `{hourLines.map((line, i) => (
                      <div key={i} className="absolute w-full border-t pointer-events-none" style={{ top: line.top, height: 1, borderColor: "rgba(128,128,128,0.1)" }}></div>
                    ))}`;
code = code.replace(renderGridRegex, newRenderGrid);

fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
