const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(/const { addCommitment, deleteCommitment } = require\("\.\.\/lib\/db"\);/, 'const { addCommitment, deleteCommitment } = await import("../lib/db.js");');
tabs = tabs.replace(/const { callAI } = require\("\.\.\/lib\/ai"\);/, 'const { callAI } = await import("../lib/ai.js");');
tabs = tabs.replace(/const { supabase } = require\("\.\.\/lib\/supabaseClient"\);/, 'const { supabase } = await import("../lib/supabaseClient.js");');

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
