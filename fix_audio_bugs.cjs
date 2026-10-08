const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Fix Download double import
tabs = tabs.replace(/import \{\s*Volume2,\s*Square,\s*Download,\s*/g, 'import {\n  Volume2, Square, ');

// Fix the button tags duplication
// The string is currently:
// <div className="flex gap-2"><AudioReaderButton text={n.texto} T={T} /><button onClick={() => onDeleteNote(n.id)} style={{ color: T.inkSoft }} className="shrink-0"><Trash2 className="w-3.5 h-3.5" /></button></div> style={{ color: T.inkSoft }} className="shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
tabs = tabs.replace(
  /<div className="flex gap-2"><AudioReaderButton text=\{n\.texto\} T=\{T\} \/><button onClick=\{\(\) => onDeleteNote\(n\.id\)\} style=\{\{ color: T\.inkSoft \}\} className="shrink-0"><Trash2 className="w-3\.5 h-3\.5" \/><\/button><\/div> style=\{\{ color: T\.inkSoft \}\} className="shrink-0"><Trash2 className="w-3\.5 h-3\.5" \/><\/button>/g,
  '<div className="flex gap-2"><AudioReaderButton text={n.texto} T={T} /><button onClick={() => onDeleteNote(n.id)} style={{ color: T.inkSoft }} className="shrink-0"><Trash2 className="w-3.5 h-3.5" /></button></div>'
);

// The other replacement:
// <div className="flex gap-2"><AudioReaderButton text={n.texto} T={T} /><button onClick={() => handleDeleteNote(n.id)} style={{ color: T.inkSoft }} className="shrink-0"><Trash2 className="w-3.5 h-3.5" /></button></div> style={{ color: T.inkSoft }} className="shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
tabs = tabs.replace(
  /<div className="flex gap-2"><AudioReaderButton text=\{n\.texto\} T=\{T\} \/><button onClick=\{\(\) => handleDeleteNote\(n\.id\)\} style=\{\{ color: T\.inkSoft \}\} className="shrink-0"><Trash2 className="w-3\.5 h-3\.5" \/><\/button><\/div> style=\{\{ color: T\.inkSoft \}\} className="shrink-0"><Trash2 className="w-3\.5 h-3\.5" \/><\/button>/g,
  '<div className="flex gap-2"><AudioReaderButton text={n.texto} T={T} /><button onClick={() => handleDeleteNote(n.id)} style={{ color: T.inkSoft }} className="shrink-0"><Trash2 className="w-3.5 h-3.5" /></button></div>'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Fixed syntax bugs!");
