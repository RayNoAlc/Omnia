const fs = require('fs');

const backupApp = fs.readFileSync('C:/Users/ryant/Downloads/temp_backup/src/App.jsx', 'utf8');

// We need to import AppLayout
let newApp = backupApp.replace(
  'import { useFocusTimer } from "./lib/useFocusTimer";',
  'import { useFocusTimer } from "./lib/useFocusTimer";\nimport { AppLayout } from "./layouts/AppLayout";\nimport { TABS } from "./components/ui";'
);

// We need to replace the entire return statement of App()
const returnRegex = /return \(\s*<div className="min-h-screen[\s\S]*?\);\n\}/m;

const newReturn = `
  const renderTab = () => {
    switch (tab) {
      case "hoje": return <HojeTab userId={userId} routine={routine} routineBlocks={routineBlocks} routineExceptions={routineExceptions} commitments={commitments} studyBlocks={studyBlocks} sessions={sessions} studyGoals={studyGoals} onUpdateGoal={async (id, d) => { const st = await upsertStudyGoal(userId, id, d); setStudyGoals(p => p.map(g => g.id === st.id ? st : g).concat(p.find(g => g.id === st.id) ? [] : [st])); }} />;
      case "inbox": return <InboxTab userId={userId} onSubmit={handleInboxSubmit} loading={inboxLoading} error={inboxError} pendingReview={pendingReview} setPendingReview={setPendingReview} onConfirm={confirmPendingReview} onSaveNote={saveAsNote} setMaterials={setMaterials} />;
      case "agenda": return <AgendaTab userId={userId} commitments={commitments} studyBlocks={studyBlocks} routineBlocks={routineBlocks} routineExceptions={routineExceptions} setCommitments={setCommitments} setStudyBlocks={setStudyBlocks} setRoutineExceptions={setRoutineExceptions} onReplan={handleReplan} onReduzir={handleReduzir} onDeleteCommitment={handleDeleteCommitment} onToggleBlock={handleToggleBlock} />;
      case "desempenho": return <DesempenhoTab commitments={commitments} sessions={sessions} quizAttempts={quizAttempts} professorAttempts={professorAttempts} />;
      case "biblioteca": return <BibliotecaTab userId={userId} materials={materials} setMaterials={setMaterials} />;
      case "foco": return <FocoTab commitments={commitments} sessions={sessions} metaHoje={routine?.metaEstudoMinutos || 0} timer={focusTimer} />;
      case "secretaria": return <SecretariaTab userId={userId} routine={routine} routineBlocks={routineBlocks} routineExceptions={routineExceptions} commitments={commitments} studyBlocks={studyBlocks} notes={notes} sessions={sessions} setRoutineBlocks={setRoutineBlocks} setRoutineExceptions={setRoutineExceptions} />;
      case "rotina": return <RotinaTab routine={routine} routineBlocks={routineBlocks} routineExceptions={routineExceptions} onUpdateRoutine={handleUpdateRoutine} onAddBlock={handleAddRoutineBlock} onUpdateBlock={handleUpdateRoutineBlock} onDeleteBlock={handleDeleteRoutineBlock} onDeleteException={handleDeleteRoutineException} />;
      default: return null;
    }
  };

  return (
    <AppLayout activeTab={tab} onTabChange={setTab} TABS={TABS}>
      {renderTab()}
    </AppLayout>
  );
}
`;

newApp = newApp.replace(returnRegex, newReturn);

// In original App.jsx, the auth loading check was inside return:
// if (session === undefined) return <div...
// if (session === null) return <Auth />
// if (!dataLoaded) return <div...

const authLoadingRegex = /if \(session === undefined\) return.*?if \(!dataLoaded\) return[^;]+;/s;

newApp = newApp.replace(authLoadingRegex, `
  if (session === undefined) return <div className="flex items-center justify-center h-screen" style={{ backgroundColor: T.background }}><Loader2 className="w-8 h-8 animate-spin" style={{ color: T.brand }} /></div>;
  if (session === null) return <Auth />;
  if (!dataLoaded) return <div className="flex items-center justify-center h-screen" style={{ backgroundColor: T.background }}><Loader2 className="w-8 h-8 animate-spin" style={{ color: T.brand }} /></div>;
`);

fs.writeFileSync('src/App.jsx', newApp, 'utf8');
