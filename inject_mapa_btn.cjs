const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const mapBtnHtml = `
      {showMapa && <MapaMentalModal notes={notes} commitments={commitments} onClose={() => setShowMapa(false)} T={T} />}
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <ExportarBiblioteca userId={userId} commitments={commitments} notes={notes} materials={materials} summaries={summaries} disciplinas={disciplinas} semestres={semestres.filter((s) => s !== "Sem data")} />
          <PrimaryButton onClick={() => setShowMapa(true)}><Network className="w-4 h-4 mr-2" /> Árvore de Conhecimento</PrimaryButton>
        </div>
`;

tabs = tabs.replace(
  /<div className="space-y-6">\s*<ExportarBiblioteca userId=\{userId\} commitments=\{commitments\} notes=\{notes\} materials=\{materials\} summaries=\{summaries\} disciplinas=\{disciplinas\} semestres=\{semestres\.filter\(\(s\) => s !== "Sem data"\)\} \/>/,
  mapBtnHtml
);

tabs = tabs.replace(
  /const \[openCommitment, setOpenCommitment\] = useState\(null\);/,
  'const [openCommitment, setOpenCommitment] = useState(null);\n  const [showMapa, setShowMapa] = useState(false);'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Knowledge Tree Button!");
