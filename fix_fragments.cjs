const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  /return \(\s*\{showMapa && <MapaMentalModal notes=\{notes\} commitments=\{commitments\} onClose=\{\(\) => setShowMapa\(false\)\} T=\{T\} \/>\}\s*<div className="flex flex-col gap-6">/,
  'return (\n      <>\n        {showMapa && <MapaMentalModal notes={notes} commitments={commitments} onClose={() => setShowMapa(false)} T={T} />}\n        <div className="flex flex-col gap-6">'
);

// Add closing tag at the end of BibliotecaTab
tabs = tabs.replace(
  /<\/div>\s*\)\s*\}\s*function ExportarBiblioteca/,
  '</div>\n      </>\n    )\n  }\n\n  function ExportarBiblioteca'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Fixed JSX fragments!");
