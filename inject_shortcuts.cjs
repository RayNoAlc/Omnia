const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Inject GlobalSearch trigger and other shortcuts
const shortcutsHtml = `
  // --- IDEA 43: ATALHOS DE TECLADO ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearch(true);
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setTab("foco");
      } else if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setTab("agenda");
      } else if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setTab("biblioteca");
      } else if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setTab("hoje");
      } else if (e.key === '?') {
        alert("Atalhos:\\nF: Foco\\nC: Calendário/Agenda\\nB: Biblioteca\\nH: Hoje\\nCtrl+K: Busca Global");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
`;

tabs = tabs.replace(
  /const \[showSearch, setShowSearch\] = React\.useState\(false\);/,
  '$&\n' + shortcutsHtml
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Keyboard Shortcuts!");
