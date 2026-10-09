const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Find all matches of the vacation toggle
const pattern = /<label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style=\{\{ borderColor: T\.border, backgroundColor: T\.brand \+ '22' \}\}>\s*<div>\s*<div className='font-bold' style=\{\{ color: T\.ink \}\}>🌴 Modo Férias \(Burnout\)<\/div>\s*<div className='text-sm mt-1' style=\{\{ color: T\.inkSoft \}\}>.*?<\/div>\s*<\/div>\s*<input type='checkbox' checked=\{safeConfig\.vacationMode\} onChange=\{\(\) => handleToggle\('vacationMode'\)\} className='w-6 h-6 accent-blue-500' \/>\s*<\/label>/gs;

const matches = tabs.match(pattern) || [];
console.log("Found", matches.length, "toggles");

if (matches.length > 0) {
  tabs = tabs.replace(pattern, "");
  
  // Re-inject exactly once at the end of the first section
  const sectionEnd = "</section>";
  const firstSectionIdx = tabs.indexOf(sectionEnd);
  
  if (firstSectionIdx > -1) {
    // Actually let's inject it into the Gamification / App settings area
    tabs = tabs.replace(
      /<div className='font-bold' style=\{\{ color: T\.ink \}\}><Gamepad2 size=\{20\}/,
      matches[0] + "\n\n              <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.bg }}>\n                <div>\n                  <div className='font-bold' style={{ color: T.ink }}><Gamepad2 size={20}"
    );
  }
}

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
