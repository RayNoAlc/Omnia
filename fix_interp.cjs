const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Fix the template literal missing $
code = code.replace(/\\$\{c\.disciplina\} [^\{]+ \{c\.assunto\}\|/g, '\$ \u2014 {c.assunto}|');

// Fix the remaining mojibake in JSX
// We want to replace {c.disciplina} WEIRD_CHARS {c.assunto} with {c.disciplina} — {c.assunto}
code = code.replace(/\{c\.disciplina\} [^\{]+ \{c\.assunto\}/g, '{c.disciplina} \u2014 {c.assunto}');
code = code.replace(/\{item\.disciplina\} [^\{]+ \{item\.assunto\}/g, '{item.disciplina} \u2014 {item.assunto}');
code = code.replace(/\{selectedCommitment\.disciplina\} [^\{]+ \{selectedCommitment\.assunto\}/g, '{selectedCommitment.disciplina} \u2014 {selectedCommitment.assunto}');

fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
