const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');
tabs = tabs.replace("  } catch (err) {\n    console.error('Erro ao gerar imagem', err);\n  }\n  setExporting(false);\n};\n", "  } catch (err) {\n    console.error('Erro ao gerar imagem', err);\n  }\n  setExporting(false);\n};\n"); // no-op
// Let's just append </div> before {modal === "sono" &&
tabs = tabs.replace('{modal === "sono" &&', '</div>\n        {modal === "sono" &&');
fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
