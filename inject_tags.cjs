const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Add formatTextWithTags component globally
const tagsComponent = `
export function formatTextWithTags(text, T) {
  if (!text) return null;
  const parts = text.split(/(#\\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('#')) {
      return <span key={i} className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mx-1" style={{ backgroundColor: T.brand + '33', color: T.brand }}>{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}
`;

tabs = tabs.replace(
  /export function Header/,
  tagsComponent + '\nexport function Header'
);

// Apply it to Notes in BibliotecaTab
// Search for n.texto and replace with formatTextWithTags(n.texto, T)
tabs = tabs.replace(
  /<div className="text-sm mt-2 whitespace-pre-wrap" style=\{\{ color: T\.inkSoft \}\}>\{n\.texto\}<\/div>/g,
  '<div className="text-sm mt-2 whitespace-pre-wrap" style={{ color: T.inkSoft }}>{formatTextWithTags(n.texto, T)}</div>'
);

// Apply it to Commitments in BibliotecaTab and AgendaTab
tabs = tabs.replace(
  /className="font-medium truncate" style=\{\{ color: T\.ink \}\}>\{c\.assunto\}<\/h4>/g,
  'className="font-medium truncate" style={{ color: T.ink }}>{formatTextWithTags(c.assunto, T)}</h4>'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Custom Tags support!");
