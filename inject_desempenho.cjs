const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const gamificationInjection = `
        {/* GAMIFICATION MODULE */}
        <Arquetipos sessions={sessions} quizAttempts={quizAttempts} professorAttempts={professorAttempts} />
        <OmniaWrapped sessions={sessions} />
        <Badges sessions={sessions} />
        <Heatmap sessions={sessions} />
        
        <div>
`;

tabs = tabs.replace(
  /<div>\s*<SectionLabel>Desempenho por disciplina<\/SectionLabel>/,
  gamificationInjection + '          <SectionLabel>Desempenho por disciplina</SectionLabel>'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
