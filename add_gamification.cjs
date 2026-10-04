const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const calcCode = "  const xpSessions = sessions.reduce((a, s) => a + s.minutos * 10, 0);\n" +
"  const xpQuiz = quizAttempts.reduce((a, q) => a + q.acertos * 50, 0);\n" +
"  const xpProf = professorAttempts.reduce((a, p) => a + (p.nota || 0) * 100, 0);\n" +
"  const totalXp = xpSessions + xpQuiz + xpProf;\n" +
"  const level = Math.floor(totalXp / 1000) + 1;\n" +
"  const xpProximoNivel = level * 1000;\n" +
"  const progressoNivel = ((totalXp % 1000) / 1000) * 100;\n" +
"\n" +
"  const datasAtividades = Array.from(new Set([\n" +
"    ...sessions.map(s => s.data && s.data.slice(0,10)),\n" +
"    ...quizAttempts.map(q => q.data && q.data.slice(0,10)),\n" +
"    ...professorAttempts.map(p => p.data && p.data.slice(0,10)),\n" +
"  ])).filter(Boolean).sort().reverse();\n" +
"  \n" +
"  let streak = 0;\n" +
"  let d = new Date();\n" +
"  for (let i = 0; i < 365; i++) {\n" +
"    const dIso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');\n" +
"    if (datasAtividades.includes(dIso)) {\n" +
"      streak++;\n" +
"    } else if (i === 0) {\n" +
"      // today no activity yet, streak not broken\n" +
"    } else {\n" +
"      break;\n" +
"    }\n" +
"    d.setDate(d.getDate() - 1);\n" +
"  }\n";

tabs = tabs.replace(
  /const interruptionInsight = computeInterruptionInsight\(sessions\);\s*return \(/,
  'const interruptionInsight = computeInterruptionInsight(sessions);\n' + calcCode + '\n  return ('
);

const uiCode = "      <div className=\"space-y-5\">\n" +
"        <Card>\n" +
"          <div className=\"flex flex-col sm:flex-row items-center justify-between gap-4\">\n" +
"            <div className=\"flex-1 w-full\">\n" +
"              <div className=\"flex items-center justify-between mb-1\">\n" +
"                <span className=\"text-sm font-bold\" style={{ color: T.brand }}>✨ Nível {level}</span>\n" +
"                <span className=\"text-xs\" style={{ color: T.inkSoft }}>{totalXp} / {xpProximoNivel} XP</span>\n" +
"              </div>\n" +
"              <div className=\"h-2 rounded-full overflow-hidden\" style={{ backgroundColor: T.surfaceAlt }}>\n" +
"                <div className=\"h-full transition-all\" style={{ width: progressoNivel + '%', backgroundColor: T.brand }} />\n" +
"              </div>\n" +
"            </div>\n" +
"            <div className=\"flex items-center gap-3 shrink-0\">\n" +
"              <div className=\"flex flex-col items-center p-2 px-4 rounded-lg\" style={{ backgroundColor: T.surfaceAlt }}>\n" +
"                <span className=\"text-[10px] uppercase font-semibold tracking-wider\" style={{ color: T.inkSoft }}>Ofensiva</span>\n" +
"                <div className=\"flex items-center gap-1 font-bold text-lg\" style={{ color: streak > 0 ? '#F59E0B' : T.ink }}>🔥 {streak} {streak === 1 ? 'dia' : 'dias'}</div>\n" +
"              </div>\n" +
"            </div>\n" +
"          </div>\n" +
"        </Card>\n";

tabs = tabs.replace(/<div className="space-y-5">/, uiCode);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
