const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

app = app.replace(
  /const savedCfg = localStorage\.getItem\("omnia_config"\);\s*if \(savedCfg\) \{ const parsed = JSON\.parse\(savedCfg\); if \(parsed\) setConfig\(parsed\); \}/,
  `const savedCfg = localStorage.getItem("omnia_config");
    if (savedCfg) { const parsed = JSON.parse(savedCfg); if (parsed) setConfig(parsed); }
    const handleStorage = (e) => {
      if (!e || e.key === "omnia_config" || e.type === "storage") {
        const fresh = localStorage.getItem("omnia_config");
        if (fresh) setConfig(JSON.parse(fresh));
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);`
);

fs.writeFileSync('src/App.jsx', app, 'utf8');
console.log("Injected storage listener!");
