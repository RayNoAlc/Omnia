const fs = require('fs');

let backupApp = fs.readFileSync('C:/Users/ryant/Downloads/temp_backup/src/App.jsx', 'utf8');

backupApp = backupApp.replace(
  'import { useFocusTimer } from "./lib/useFocusTimer";',
  'import { useFocusTimer } from "./lib/useFocusTimer";\nimport { AppLayout } from "./layouts/AppLayout";\nimport { TABS } from "./components/ui";'
);

const returnRegex = /return \(\s*<div className="min-h-screen w-full"[\s\S]*?\);\n\}/m;

const newReturn = `  return (
    <AppLayout activeTab={tab} onTabChange={setTab} TABS={TABS}>
      {!dataLoaded ? (
        <div className="py-16 flex justify-center" style={{ color: T.inkSoft }}>
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <>
          {tab === "hoje" && (
            <HojeTab overdue={overdue} blocksHoje={blocksHoje} commitmentsHoje={commitmentsHoje} routineItemsHoje={routineItemsHoje} proximos={proximos} overload={overloadWindow} onToggleBlock={handleToggleBlock} onGoInbox={() => setTab("inbox")} onGoAgenda={() => setTab("agenda")} routine={routine} metaHoje={metaHoje} onSetMeta={handleSetMeta} minutosEstudadosHoje={minutosEstudadosHoje} avisos={avisos} />
          )}
          {tab === "inbox" && (
            <InboxTab userId={userId} onSubmit={handleInboxSubmit} loading={inboxLoading} error={inboxError} pendingReview={pendingReview} setPendingReview={setPendingReview} onConfirm={confirmPendingReview} onSaveNote={saveAsNote} setMaterials={setMaterials} />
          )}
          {tab === "agenda" && (
            <AgendaTab userId={userId} commitments={commitments} studyBlocks={studyBlocks} routineBlocks={routineBlocks} routineExceptions={routineExceptions} setCommitments={setCommitments} setStudyBlocks={setStudyBlocks} setRoutineExceptions={setRoutineExceptions} onReplan={handleReplan} onReduzir={handleReduzir} onDeleteCommitment={handleDeleteCommitment} onToggleBlock={handleToggleBlock} />
          )}
          {tab === "desempenho" && (
            <DesempenhoTab commitments={commitments} sessions={sessions} quizAttempts={quizAttempts} professorAttempts={professorAttempts} />
          )}
          {tab === "biblioteca" && (
            <BibliotecaTab userId={userId} materials={materials} setMaterials={setMaterials} />
          )}
          {tab === "foco" && (
            <FocoTab commitments={commitments} sessions={sessions} metaHoje={metaHoje} timer={focusTimer} />
          )}
          {tab === "secretaria" && (
            <SecretariaTab userId={userId} routine={routine} routineBlocks={routineBlocks} routineExceptions={routineExceptions} commitments={commitments} studyBlocks={studyBlocks} notes={notes} sessions={sessions} setRoutineBlocks={setRoutineBlocks} setRoutineExceptions={setRoutineExceptions} />
          )}
          {tab === "rotina" && (
            <RotinaTab routine={routine} routineBlocks={routineBlocks} routineExceptions={routineExceptions} onUpdateRoutine={handleUpdateRoutine} onAddBlock={handleAddRoutineBlock} onUpdateBlock={handleUpdateRoutineBlock} onDeleteBlock={handleDeleteRoutineBlock} onDeleteException={handleDeleteException} />
          )}
        </>
      )}
    </AppLayout>
  );
}`;

backupApp = backupApp.replace(returnRegex, newReturn);
fs.writeFileSync('src/App.jsx', backupApp, 'utf8');
