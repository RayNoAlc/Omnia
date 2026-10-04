const fs = require('fs');

// 1. App.jsx
let app = fs.readFileSync('src/App.jsx', 'utf8');
app = app.replace(
  '<BibliotecaTab userId={userId} notes={notes} commitments={commitments}',
  '<BibliotecaTab userId={userId} setCommitments={setCommitments} notes={notes} commitments={commitments}'
);
fs.writeFileSync('src/App.jsx', app, 'utf8');

// 2. Tabs.jsx
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');
tabs = tabs.replace(
  'upsertSummary, addSession as dbAddSession,',
  'upsertSummary, addSession as dbAddSession, addCommitment,'
);

tabs = tabs.replace(
  'export function BibliotecaTab({ userId, notes, commitments, materials, quizAttempts, professorAttempts, onDeleteNote, summaries, setSummaries, setNotes, setMaterials, setQuizAttempts, setProfessorAttempts }) {',
  'export function BibliotecaTab({ userId, setCommitments, notes, commitments, materials, quizAttempts, professorAttempts, onDeleteNote, summaries, setSummaries, setNotes, setMaterials, setQuizAttempts, setProfessorAttempts }) {'
);

const saveResumoOld = `async function saveResumo() {
    setSalvandoResumo(true);
    setErroSalvarResumo(null);
    setResumoSalvo(false);
    try {
      const saved = await upsertSummary(userId, { disciplina: disc, commitmentId: null, texto: resumoDraft });
      setSummaries((prev) => {
        const exists = prev.some((s) => s.disciplina === disc && !s.commitmentId);
        return exists ? prev.map((s) => (s.disciplina === disc && !s.commitmentId ? saved : s)) : [...prev, saved];
      });
      setResumoSalvo(true);
    } catch (e) {
      setErroSalvarResumo(e.message || String(e));
    } finally {
      setSalvandoResumo(false);
    }
  }`;

const saveResumoNew = `async function saveResumo(agendarRevisoes = false) {
    setSalvandoResumo(true);
    setErroSalvarResumo(null);
    setResumoSalvo(false);
    try {
      const saved = await upsertSummary(userId, { disciplina: disc, commitmentId: null, texto: resumoDraft });
      setSummaries((prev) => {
        const exists = prev.some((s) => s.disciplina === disc && !s.commitmentId);
        return exists ? prev.map((s) => (s.disciplina === disc && !s.commitmentId ? saved : s)) : [...prev, saved];
      });
      if (agendarRevisoes) {
        const d1 = new Date(); d1.setDate(d1.getDate() + 1);
        const d3 = new Date(); d3.setDate(d3.getDate() + 3);
        const d7 = new Date(); d7.setDate(d7.getDate() + 7);
        const p1 = await addCommitment(userId, { tipo: 'leitura', disciplina: disc, assunto: 'Revisão: Resumo (1 dia)', prazo: d1.toISOString().slice(0,10), concluido: false });
        const p3 = await addCommitment(userId, { tipo: 'leitura', disciplina: disc, assunto: 'Revisão: Resumo (3 dias)', prazo: d3.toISOString().slice(0,10), concluido: false });
        const p7 = await addCommitment(userId, { tipo: 'leitura', disciplina: disc, assunto: 'Revisão: Resumo (7 dias)', prazo: d7.toISOString().slice(0,10), concluido: false });
        if (setCommitments) setCommitments(prev => [...prev, p1, p3, p7]);
      }
      setResumoSalvo(true);
    } catch (e) {
      setErroSalvarResumo(e.message || String(e));
    } finally {
      setSalvandoResumo(false);
    }
  }`;

tabs = tabs.replace(saveResumoOld, saveResumoNew);

const saveResumoC_Old = `async function saveResumo() {
    setSalvandoResumo(true);
    setErroSalvarResumo(null);
    setResumoSalvo(false);
    try {
      const saved = await upsertSummary(userId, { disciplina: commitment.disciplina, commitmentId: commitment.id, texto: resumoDraft });
      setSummaries((prev) => {
        const exists = prev.some((s) => s.commitmentId === commitment.id);
        return exists ? prev.map((s) => (s.commitmentId === commitment.id ? saved : s)) : [...prev, saved];
      });
      setResumoSalvo(true);
    } catch (e) {
      setErroSalvarResumo(e.message || String(e));
    } finally {
      setSalvandoResumo(false);
    }
  }`;

const saveResumoC_New = `async function saveResumo(agendarRevisoes = false) {
    setSalvandoResumo(true);
    setErroSalvarResumo(null);
    setResumoSalvo(false);
    try {
      const saved = await upsertSummary(userId, { disciplina: commitment.disciplina, commitmentId: commitment.id, texto: resumoDraft });
      setSummaries((prev) => {
        const exists = prev.some((s) => s.commitmentId === commitment.id);
        return exists ? prev.map((s) => (s.commitmentId === commitment.id ? saved : s)) : [...prev, saved];
      });
      if (agendarRevisoes) {
        const d1 = new Date(); d1.setDate(d1.getDate() + 1);
        const d3 = new Date(); d3.setDate(d3.getDate() + 3);
        const d7 = new Date(); d7.setDate(d7.getDate() + 7);
        const assunto = commitment.assunto ? commitment.assunto : 'Resumo';
        const p1 = await addCommitment(userId, { tipo: 'leitura', disciplina: commitment.disciplina, assunto: 'Revisão: ' + assunto + ' (1 dia)', prazo: d1.toISOString().slice(0,10), concluido: false });
        const p3 = await addCommitment(userId, { tipo: 'leitura', disciplina: commitment.disciplina, assunto: 'Revisão: ' + assunto + ' (3 dias)', prazo: d3.toISOString().slice(0,10), concluido: false });
        const p7 = await addCommitment(userId, { tipo: 'leitura', disciplina: commitment.disciplina, assunto: 'Revisão: ' + assunto + ' (7 dias)', prazo: d7.toISOString().slice(0,10), concluido: false });
        if (setCommitments) setCommitments(prev => [...prev, p1, p3, p7]);
      }
      setResumoSalvo(true);
    } catch (e) {
      setErroSalvarResumo(e.message || String(e));
    } finally {
      setSalvandoResumo(false);
    }
  }`;

tabs = tabs.replace(saveResumoC_Old, saveResumoC_New);

// Add the UI buttons
tabs = tabs.replace(
  '<PrimaryButton onClick={saveResumo} disabled={salvandoResumo}>',
  '<PrimaryButton onClick={() => saveResumo(false)} disabled={salvandoResumo}>'
);
tabs = tabs.replace(
  '<PrimaryButton onClick={saveResumo} disabled={salvandoResumo}>', // replace 2nd instance
  '<PrimaryButton onClick={() => saveResumo(false)} disabled={salvandoResumo}>'
);

tabs = tabs.replace(
  '<GhostButton onClick={() => setPanel(null)}>Fechar</GhostButton>',
  '<GhostButton onClick={() => setPanel(null)}>Fechar</GhostButton>\n                  <button onClick={() => saveResumo(true)} disabled={salvandoResumo} className="text-xs px-2 py-1 rounded transition-transform hover:scale-105" style={{ color: T.brand, border: `1px solid ${T.brand}` }}>⏳ Salvar e Agendar Revisões (1, 3, 7 d)</button>'
);
tabs = tabs.replace(
  '<GhostButton onClick={() => setPanel(null)}>Fechar</GhostButton>',
  '<GhostButton onClick={() => setPanel(null)}>Fechar</GhostButton>\n                  <button onClick={() => saveResumo(true)} disabled={salvandoResumo} className="text-xs px-2 py-1 rounded transition-transform hover:scale-105" style={{ color: T.brand, border: `1px solid ${T.brand}` }}>⏳ Salvar e Agendar Revisões (1, 3, 7 d)</button>'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
