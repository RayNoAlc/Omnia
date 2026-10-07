const fs = require('fs');

let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// 1. AgendaTab
tabs = tabs.replace(
  /onClick=\{\(e\) => \{ e\.stopPropagation\(\); onDeleteCommitment\(item\.id\); \}\}/g,
  'onClick={(e) => { e.stopPropagation(); const ans = prompt("Para excluir permanentemente, digite o nome exato do compromisso:\\n\\n" + item.assunto); if (ans === item.assunto) { onDeleteCommitment(item.id); } else if (ans !== null) { alert("Nome incorreto. Exclusão cancelada."); } }}'
);

// 2. BibliotecaTab & DisciplinaCard (c.id)
tabs = tabs.replace(
  /onClick=\{\(e\) => \{ e\.stopPropagation\(\); if\(confirm\("Excluir compromisso\?"\)\) onDeleteCommitment\(c\.id\); \}\}/g,
  'onClick={(e) => { e.stopPropagation(); const ans = prompt("Para excluir permanentemente, digite o nome exato do compromisso:\\n\\n" + c.assunto); if (ans === c.assunto) { onDeleteCommitment(c.id); } else if (ans !== null) { alert("Nome incorreto. Exclusão cancelada."); } }}'
);

// 3. Modal
tabs = tabs.replace(
  /onClick=\{\(\) => \{ if\(confirm\("Excluir este compromisso\?"\)\) \{ onDeleteCommitment\(commitment\.id\); onClose\(\); \} \}\}/g,
  'onClick={() => { const ans = prompt("Para excluir permanentemente, digite o nome exato do compromisso:\\n\\n" + commitment.assunto); if (ans === commitment.assunto) { onDeleteCommitment(commitment.id); onClose(); } else if (ans !== null) { alert("Nome incorreto. Exclusão cancelada."); } }}'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Updated delete confirmation logic!");
