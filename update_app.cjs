const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

if (!app.includes('const [isZen, setIsZen]')) {
  app = app.replace(
    /const \[tab, setTab\] = useState\("hoje"\);/,
    'const [tab, setTab] = useState("hoje");\n  const [isZen, setIsZen] = useState(false);'
  );

  app = app.replace(
    /<AppLayout activeTab=\{tab\} onTabChange=\{setTab\} TABS=\{visibleTabs\} onLogout=\{.*?\}\>/,
    '<AppLayout activeTab={tab} onTabChange={setTab} TABS={visibleTabs} onLogout={() => supabase.auth.signOut()} isZen={isZen}>'
  );

  app = app.replace(
    /\{tab === "foco" && \(\s*<FocoTab config=\{config\}/,
    '{tab === "foco" && (\n              <FocoTab isZen={isZen} setIsZen={setIsZen} config={config}'
  );
  
  fs.writeFileSync('src/App.jsx', app, 'utf8');
  console.log("Updated App.jsx with isZen state!");
} else {
  console.log("Already updated.");
}
