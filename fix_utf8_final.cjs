const fs = require('fs');

function fixEncoding(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Common replacements for this file
  const replacements = [
    [/Duraǜo/g, 'Duração'],
    [/Sessǜo concluda/g, 'Sessão concluída'],
    [/Essa sessǜo/g, 'Essa sessão'],
    [/Y"s Disciplina/g, '📚 Disciplina'],
    [/ǽ\?\? Essa/g, '⏱️ Essa'],
    [/ǽo'\? Total/g, '📈 Total'],
    [/Y\~Z/g, '😎'],
    [/YT'/g, '🤩'],
    [/Y/g, '😴'],
    [/Y\'/g, '😴'],
    [/Y"/g, '🔥'],
    [/Esperando vocǦ estudar/g, 'Esperando você estudar'],
    [/YO\?/g, '🌐'],
    [/Cdigo da/g, 'Código da'],
    [/Sessǜo livre/g, 'Sessão livre'],
    [/Seminǭrio/g, 'Seminário'],
    [/Crtico/g, 'Crítico'],
    [/Configuraões/g, 'Configurações']
  ];

  for (const [regex, replacement] of replacements) {
    content = content.replace(regex, replacement);
  }
  
  // There are some very badly corrupted emojis.
  // Let's just find and replace the whole lines.
  content = content.replace(/<span style={{ color: T.inkSoft }}>.*? Disciplina<\/span>/g, '<span style={{ color: T.inkSoft }}>📚 Disciplina</span>');
  content = content.replace(/<span style={{ color: T.inkSoft }}>.*? Essa sessão<\/span>/g, '<span style={{ color: T.inkSoft }}>⏱️ Essa sessão</span>');
  content = content.replace(/<span style={{ color: T.inkSoft }}>.*? Total hoje<\/span>/g, '<span style={{ color: T.inkSoft }}>📈 Total hoje</span>');

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Fixed ${file}`);
}

fixEncoding('src/components/Tabs.jsx');
fixEncoding('src/components/ui.jsx');
