const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// 1. Add callAI
code = code.replace(
  `import { callVision, callAudioTranscription, callAIWithTools } from "../lib/ai";`,
  `import { callVision, callAudioTranscription, callAIWithTools, callAI } from "../lib/ai";`
);

// 2. Add deleteCommitment
code = code.replace(
  `  upsertSummary, addSession as dbAddSession, addCommitment,\n`,
  `  upsertSummary, addSession as dbAddSession, addCommitment, deleteCommitment,\n`
);

// 3. Add supabase
code = code.replace(
  `import { PRESETS } from "../lib/useFocusTimer";\n`,
  `import { PRESETS } from "../lib/useFocusTimer";\nimport { supabase } from "../lib/supabaseClient";\n`
);

// 4. Remove dynamic imports
code = code.replace(`const { addCommitment, deleteCommitment } = await import("../lib/db.js");`, ``);
code = code.replace(`const { callAI } = await import("../lib/ai.js");`, ``);
code = code.replace(`const { supabase } = await import("../lib/supabaseClient.js");`, ``);

// Also remove extractPdfText dynamic import if any
code = code.replace(`const { extractPdfText } = await import("../lib/pdf");`, ``);
// And add it to the top
code = code.replace(
  `import { supabase } from "../lib/supabaseClient";\n`,
  `import { supabase } from "../lib/supabaseClient";\nimport { extractPdfText } from "../lib/pdf";\n`
);

// Wait, the dynamic imports in InboxTab for extractPdfText are there twice:
code = code.replace(`const { extractPdfText } = await import("../lib/pdf");`, ``);

// What about JSZip?
code = code.replace(`const { default: JSZip } = await import("jszip");`, ``);
code = code.replace(
  `import jsPDF from 'jspdf';\n`,
  `import jsPDF from 'jspdf';\nimport JSZip from 'jszip';\n`
);

fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
console.log("Done");
