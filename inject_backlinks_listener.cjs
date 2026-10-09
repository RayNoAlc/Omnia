const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const searchListener = `
  useEffect(() => {
    const handleOmniaSearch = (e) => {
      setShowSearch(e.detail || true);
    };
    window.addEventListener('omnia-search', handleOmniaSearch);
    return () => window.removeEventListener('omnia-search', handleOmniaSearch);
  }, []);
`;

tabs = tabs.replace(
  /const \[showSearch, setShowSearch\] = React\.useState\(false\);/,
  '$&\n' + searchListener
);

// We need to pass initial query to GlobalSearchModal!
// Wait, setShowSearch(true) only shows it. We need to pass the query string.
tabs = tabs.replace(
  /const \[showSearch, setShowSearch\] = React\.useState\(false\);/,
  'const [showSearch, setShowSearch] = React.useState(false);\n  const [searchQuery, setSearchQuery] = React.useState("");'
);

tabs = tabs.replace(
  /setShowSearch\(e\.detail \|\| true\);/,
  'if (typeof e.detail === "string") setSearchQuery(e.detail);\n      setShowSearch(true);'
);

// When shortcut Ctrl+K is pressed:
tabs = tabs.replace(
  /setShowSearch\(true\);/g,
  'setSearchQuery("");\n        setShowSearch(true);'
);

// But wait, the shortcut replacement will also replace inside the handleOmniaSearch! Let's be careful.
// Let's just fix GlobalSearchModal to accept an initialQuery prop.
tabs = tabs.replace(
  /export function GlobalSearchModal\(\{ onClose, commitments, notes, materials, setTab \}\) \{/,
  'export function GlobalSearchModal({ onClose, commitments, notes, materials, setTab, initialQuery = "" }) {'
);

tabs = tabs.replace(
  /const \[q, setQ\] = React\.useState\(""\);/,
  'const [q, setQ] = React.useState(initialQuery);'
);

tabs = tabs.replace(
  /<GlobalSearchModal onClose=\{\(\) => setShowSearch\(false\)\}/,
  '<GlobalSearchModal onClose={() => setShowSearch(false)} initialQuery={searchQuery}'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Backlink Listener!");
