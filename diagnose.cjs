const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// I will wrap all those bare labels and divs from <label ... BarChart> down to just before <section className='p-6 rounded-2xl shadow-sm border' style={{ backgroundColor: T.surface, borderColor: T.border }}> <div className='flex items-center gap-3 mb-4'> <Paperclip
const anchorStart = "<label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.bg }}>\n                <div>\n                  <div className='font-bold' style={{ color: T.ink }}><BarChart";

const anchorEnd = "em PDF.</div>\n                </div>\n                <input type='checkbox' checked={safeConfig.enablePdf} onChange={() => handleToggle('enablePdf')} className='w-6 h-6 accent-blue-500' />\n              </label>\n            </div>\n          </section>";

let partsStart = tabs.split(anchorStart);
if(partsStart.length > 1) {
  tabs = partsStart[0] + "\n\n          <section className='p-6 rounded-2xl shadow-sm border' style={{ backgroundColor: T.surface, borderColor: T.border }}>\n            <div className='flex items-center gap-3 mb-4'>\n              <Activity className='w-6 h-6' style={{ color: T.brand }} />\n              <h3 className='text-xl font-bold' style={{ color: T.ink }}>Módulos e Funcionalidades</h3>\n            </div>\n            <div className='flex flex-col gap-4'>\n" + anchorStart + partsStart[1];
  console.log("Wrapped start");
}

let partsEnd = tabs.split(anchorEnd);
if(partsEnd.length > 1) {
  // We already have a </section> at the end? Oh wait, anchorEnd includes </section>!
  // This means they WERE inside a section!
  // But wait, the Vite error said: Unexpected closing "section" tag does not match opening "label" tag
  console.log("End is already there!");
}

// If they WERE inside a section, but there was an unclosed <label>!
// Wait! Let's find ANY unclosed tags. 
const cheerio = require('cheerio'); // Do we have cheerio? No.
