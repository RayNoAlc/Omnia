const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

const newListener = `
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K or Shift + S for Search
      if (((e.ctrlKey || e.metaKey) && e.key === 'k') || (e.shiftKey && e.key.toLowerCase() === 's')) {
        e.preventDefault();
        setShowSearch(true);
        return;
      }

      // Ignore shortcuts if user is typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      // Power User Shortcuts (Shift + Key)
      if (e.shiftKey) {
        switch(e.key.toLowerCase()) {
          case 'h': setTab("hoje"); break;
          case 'f': setTab("foco"); break;
          case 'b': setTab("biblioteca"); break;
          case 'a': setTab("agenda"); break;
          case 'd': setTab("desempenho"); break;
          case 'i': setTab("inbox"); break;
          case 'c': setTab("inbox"); break; // C to "Create"
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
`;

app = app.replace(
  /useEffect\(\(\) => \{\s*const handleKeyDown = \(e\) => \{\s*if \(\(e\.ctrlKey \|\| e\.metaKey\) && e\.key === 'k'\) \{\s*e\.preventDefault\(\);\s*setShowSearch\(true\);\s*\}\s*\};\s*window\.addEventListener\('keydown', handleKeyDown\);\s*return \(\) => window\.removeEventListener\('keydown', handleKeyDown\);\s*\}, \[\]\);/,
  newListener.trim()
);

fs.writeFileSync('src/App.jsx', app, 'utf8');
console.log("Injected Power User Shortcuts!");
