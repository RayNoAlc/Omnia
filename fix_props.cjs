const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

const returnRegex = /return \(\s*<AppLayout activeTab=\{tab\}.*?\);\n\}/s;

const newReturn = `  return (
    <AppLayout activeTab={tab} onTabChange={setTab} TABS={TABS} onLogout={() => supabase.auth.signOut()}>
      {!dataLoaded ? (
        <div className="py-16 flex justify-center" style={{ color: T.inkSoft }}>
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <>
          {tab === "hoje" && (
            <HojeTab overdue={overdue} blocksHoje={blocksHoje} commitmentsHoje={commitmentsHoje} routineItemsHoje={routineItemsHoje}
              proximos={proximos} overload={overloadWindow} onToggleBlock={handleToggleBlock}
              onGoInbox={() => setTab("inbox")} onGoAgenda={() => setTab("agenda")}
              routine={routine} metaHoje={metaHoje} onSetMeta={handleSetMeta} minutosEstudadosHoje={minutosEstudadosHoje}
              avisos={avisos} />
          )}
          {tab === "inbox" && (
            <InboxTab userId={userId} onSubmit={handleInboxSubmit} loading={inboxLoading} error={inboxError}
              pendingReview={pendingReview} setPendingReview={setPendingReview}
              onConfirm={confirmPendingReview} onSaveNote={saveAsNote} setMaterials={setMaterials} />
          )}
          {tab === "agenda" && (
            <AgendaTab userId={userId} commitments={commitments} studyBlocks={studyBlocks}
              onDeleteCommitment={handleDeleteCommitment} onToggleBlock={handleToggleBlock}
              onReplan={handleReplan} onReduzir={handleReduzir}
              routine={routine} routineBlocks={routineBlocks} routineExceptions={routineExceptions}
              notes={notes} materials={materials} summaries={summaries}
              quizAttempts={quizAttempts} professorAttempts={professorAttempts}
              setNotes={setNotes} setMaterials={setMaterials} setSummaries={setSummaries}
              setQuizAttempts={setQuizAttempts} setProfessorAttempts={setProfessorAttempts} />
          )}
          {tab === "desempenho" && (
            <DesempenhoTab commitments={commitments} sessions={sessions}
              quizAttempts={quizAttempts} professorAttempts={professorAttempts} />
          )}
          {tab === "biblioteca" && (
            <BibliotecaTab userId={userId} notes={notes} commitments={commitments} materials={materials}
              quizAttempts={quizAttempts} professorAttempts={professorAttempts}
              onDeleteNote={handleDeleteNote} summaries={summaries} setSummaries={setSummaries}
              setNotes={setNotes} setMaterials={setMaterials}
              setQuizAttempts={setQuizAttempts} setProfessorAttempts={setProfessorAttempts} />
          )}
          {tab === "foco" && (
            <FocoTab userId={userId} commitments={commitments} sessions={sessions} metaHoje={metaHoje} timer={focusTimer}
              notes={notes} materials={materials} summaries={summaries}
              quizAttempts={quizAttempts} professorAttempts={professorAttempts}
              setNotes={setNotes} setMaterials={setMaterials} setSummaries={setSummaries}
              setQuizAttempts={setQuizAttempts} setProfessorAttempts={setProfessorAttempts} />
          )}
          {tab === "secretaria" && (
            <SecretariaTab userId={userId} routine={routine} routineBlocks={routineBlocks} routineExceptions={routineExceptions}
              commitments={commitments} studyBlocks={studyBlocks} notes={notes} sessions={sessions}
              setRoutineBlocks={setRoutineBlocks} setRoutineExceptions={setRoutineExceptions} />
          )}
          {tab === "rotina" && (
            <RotinaTab routine={routine} routineBlocks={routineBlocks} routineExceptions={routineExceptions} onUpdateRoutine={handleUpdateRoutine}
              onAddBlock={handleAddRoutineBlock} onUpdateBlock={handleUpdateRoutineBlock} onDeleteBlock={handleDeleteRoutineBlock}
              onDeleteException={handleDeleteException} />
          )}
        </>
      )}
    </AppLayout>
  );
}`;

app = app.replace(returnRegex, newReturn);
fs.writeFileSync('src/App.jsx', app, 'utf8');
