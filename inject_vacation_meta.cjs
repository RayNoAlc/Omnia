const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

let parts = tabs.split("function MetaHojeCard({ blocksHoje, routine, metaHoje, onSetMeta, minutosEstudadosHoje }) {");
if (parts.length > 1) {
  const newFunc = "function MetaHojeCard({ blocksHoje, routine, metaHoje, onSetMeta, minutosEstudadosHoje, config }) {\n" +
    "  const isVacation = config?.vacationMode;\n  if (isVacation) {\n    return <Card style={{ borderColor: T.brand, backgroundColor: T.brand + '22' }}><div className='flex flex-col items-center justify-center p-4 text-center'><h3 className='font-bold text-lg mb-2' style={{ color: T.brand }}>🌴 Modo Férias Ativado</h3><p className='text-sm' style={{ color: T.inkSoft }}>Seus streaks estão congelados. Sem metas de estudo para hoje. Descanse!</p></div></Card>;\n  }\n";
  tabs = parts[0] + newFunc + parts[1];
  console.log("Injected MetaHojeCard override");
}

let parts2 = tabs.split("<MetaHojeCard blocksHoje={blocksHoje} routine={routine} metaHoje={metaHoje} onSetMeta={onSetMeta} minutosEstudadosHoje={minutosEstudadosHoje} />");
if (parts2.length > 1) {
  tabs = parts2[0] + "<MetaHojeCard blocksHoje={blocksHoje} routine={routine} metaHoje={metaHoje} onSetMeta={onSetMeta} minutosEstudadosHoje={minutosEstudadosHoje} config={config} />" + parts2[1];
  console.log("Passed config to MetaHojeCard");
}

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
