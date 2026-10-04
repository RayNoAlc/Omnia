const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Inject FocusPet into FocoTab
tabs = tabs.replace(
  '{props.config?.enableLofi !== false && (',
  '<FocusPet timerOn={phase === "work" && running} streak={streak} />\n            {props.config?.enableLofi !== false && ('
);
tabs = tabs.replace(
  '            <GhostButton onClick={() => setShowRoom(!showRoom)}>',
  '            <FocusPet timerOn={false} streak={streak} />\n            <GhostButton onClick={() => setShowRoom(!showRoom)}>'
);

// Inject Gamification components into DesempenhoTab
const gamificationInjection = `
        {props.config?.enableGamification !== false && (
          <>
            <Arquetipos sessions={sessions} quizAttempts={quizAttempts} professorAttempts={professorAttempts} />
            <OmniaWrapped sessions={sessions} />
            <Badges sessions={sessions} />
            <Heatmap sessions={sessions} />
          </>
        )}
        <div>
`;
tabs = tabs.replace(
  '        <div>\n          <SectionLabel>Desempenho por disciplina</SectionLabel>',
  gamificationInjection + '          <SectionLabel>Desempenho por disciplina</SectionLabel>'
);


fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
