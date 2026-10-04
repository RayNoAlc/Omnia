const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

const importLocalforage = "import localforage from 'localforage';\n";
if (!app.includes('localforage')) {
  app = app.replace('import { useState', importLocalforage + 'import { useState');
}

const targetStart = "(async () => {\n      let r = await fetchRoutine(userId);";
const targetEnd = "setDataLoaded(true);\n    })();";

const idx1 = app.indexOf(targetStart);
const idx2 = app.indexOf(targetEnd, idx1);

if (idx1 !== -1 && idx2 !== -1) {
  const newLoadCode = "(async () => {\n" +
"      const cache = await localforage.getItem('omnia_cache_' + userId);\n" +
"      if (cache) {\n" +
"        setRoutine(cache.r || null);\n" +
"        setRoutineBlocks(cache.rb || []);\n" +
"        setRoutineExceptions(cache.rex || []);\n" +
"        setCommitments(cache.c || []);\n" +
"        setStudyBlocks(cache.sb || []);\n" +
"        setNotes(cache.n || []);\n" +
"        setSessions(cache.s || []);\n" +
"        setSummaries(cache.sm || []);\n" +
"        setQuizAttempts(cache.qa || []);\n" +
"        setProfessorAttempts(cache.pa || []);\n" +
"        setMaterials(cache.mt || []);\n" +
"        setStudyGoals(cache.sg || []);\n" +
"        setDataLoaded(true);\n" +
"      }\n" +
"      \n" +
"      if (navigator.onLine) {\n" +
"        let r = await fetchRoutine(userId);\n" +
"        if (!r) r = await createDefaultRoutine(userId);\n" +
"        const [rb, rex, c, sb, n, s, sm, qa, pa, mt, sg] = await Promise.all([\n" +
"          fetchRoutineBlocks(userId),\n" +
"          fetchRoutineExceptions(userId),\n" +
"          fetchCommitments(userId),\n" +
"          fetchStudyBlocks(userId),\n" +
"          fetchNotes(userId),\n" +
"          fetchSessions(userId),\n" +
"          fetchSummaries(userId),\n" +
"          fetchQuizAttempts(userId),\n" +
"          fetchProfessorAttempts(userId),\n" +
"          fetchMaterials(userId),\n" +
"          fetchStudyGoals(userId),\n" +
"        ]);\n" +
"        \n" +
"        setRoutine(r); setRoutineBlocks(rb); setRoutineExceptions(rex); setCommitments(c); setStudyBlocks(sb);\n" +
"        setNotes(n); setSessions(s); setSummaries(sm); setQuizAttempts(qa); setProfessorAttempts(pa);\n" +
"        setMaterials(mt); setStudyGoals(sg);\n" +
"        \n" +
"        await localforage.setItem('omnia_cache_' + userId, { r, rb, rex, c, sb, n, s, sm, qa, pa, mt, sg });\n" +
"        setDataLoaded(true);\n" +
"      }\n" +
"    })();";

  const before = app.slice(0, idx1);
  const after = app.slice(idx2 + targetEnd.length);
  fs.writeFileSync('src/App.jsx', before + newLoadCode + after, 'utf8');
  console.log("Success");
} else {
  console.log("Not found");
}
