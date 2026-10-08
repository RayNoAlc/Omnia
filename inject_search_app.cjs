const fs = require('fs');

let app = fs.readFileSync('src/App.jsx', 'utf8');

if (!app.includes('GlobalSearchModal')) {
  // Import GlobalSearchModal
  app = app.replace(
    /import \{ TABS, applyTheme \} from "\.\/components\/ui";/,
    'import { TABS, applyTheme } from "./components/ui";\nimport { GlobalSearchModal } from "./components/Tabs.jsx";'
  );

  // Add state
  app = app.replace(
    /const \[isZen, setIsZen\] = useState\(false\);/,
    'const [isZen, setIsZen] = useState(false);\n  const [showSearch, setShowSearch] = useState(false);'
  );

  // Add event listener
  app = app.replace(
    /useEffect\(\(\) => \{\s*applyTheme\(config\?.theme\);\s*\}, \[config\?.theme\]\);/,
    `useEffect(() => { applyTheme(config?.theme); }, [config?.theme]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);`
  );

  // Render modal
  app = app.replace(
    /<\/AppLayout>/,
    `  {showSearch && <GlobalSearchModal onClose={() => setShowSearch(false)} setTab={setTab} commitments={commitments} notes={notes} materials={materials} />}\n    </AppLayout>`
  );

  fs.writeFileSync('src/App.jsx', app, 'utf8');
  console.log("Updated App.jsx with Ctrl+K search!");
}
