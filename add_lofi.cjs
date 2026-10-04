const fs = require('fs');

let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

if (!tabs.includes('Headphones')) {
  tabs = tabs.replace(
    /Moon, SlidersHorizontal, Pencil, Target, CalendarDays,/,
    "Moon, SlidersHorizontal, Pencil, Target, CalendarDays, Headphones,"
  );
}

// Inject state in FocoTab
tabs = tabs.replace(
  /export function FocoTab\(\{[^\}]+\}\) \{([\s\S]*?)const \{/m,
  "export function FocoTab(props) {\n  const { commitments, sessions, metaHoje, timer, userId, notes, materials, summaries, quizAttempts, professorAttempts, setNotes, setMaterials, setSummaries, setQuizAttempts, setProfessorAttempts } = props;\n  const [lofiOn, setLofiOn] = useState(false);\n  const {"
);

// Add the button and iframe in immersive mode
const toggleCode = "              <div className=\"flex items-center justify-center gap-2 mt-4\">\n" +
"                <GhostButton onClick={() => setLofiOn(!lofiOn)} style={{ color: lofiOn ? T.brand : T.inkSoft }}>\n" +
"                  <Headphones className=\"w-4 h-4\" /> {lofiOn ? 'Lo-Fi: Ligado' : 'Lo-Fi: Desligado'}\n" +
"                </GhostButton>\n" +
"              </div>\n" +
"              {lofiOn && <iframe width=\"2\" height=\"2\" src=\"https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1\" allow=\"autoplay\" style={{ opacity: 0.01, position: 'absolute' }} />}\n";

tabs = tabs.replace(
  /<\/GhostButton>\n\s*\)\}\n\s*<GhostButton onClick=\{reiniciarCiclo\}/,
  "</GhostButton>\n              )}\n              <GhostButton onClick={reiniciarCiclo}"
);

tabs = tabs.replace(
  /<GhostButton onClick=\{encerrar\}\><X className="w-4 h-4" \/> Encerrar<\/GhostButton>\n\s*<\/div>\n\s*<\/Card>/,
  "<GhostButton onClick={encerrar}><X className=\"w-4 h-4\" /> Encerrar</GhostButton>\n            </div>\n" + toggleCode + "          </Card>"
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
