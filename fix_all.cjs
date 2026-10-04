const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

code = code.replace(/\{c\.prazo \? formatDateBR\(c\.prazo\) : \"Sem data\"\} [^\w]+ \{TIPO_LABELS\[c\.tipo\]\}/g, '{c.prazo ? formatDateBR(c.prazo) : \"Sem data\"} — {TIPO_LABELS[c.tipo]}');

code = code.replace(/\{formatDateBR\(c\.prazo\)\} [^\w]+ \{weekdayShort\(c\.prazo\)\}/g, '{formatDateBR(c.prazo)} • {weekdayShort(c.prazo)}');

// Also the hover state issue
// Let's replace: <button key={c.id} onClick={onGoAgenda} className="w-full text-left transition-transform hover:scale-[1.02]">
// with <button key={c.id} onClick={onGoAgenda} className="w-full text-left rounded-lg outline-none focus:outline-none transition-transform hover:scale-[1.02]">
code = code.replace(/<button key=\{c\.id\} onClick=\{onGoAgenda\} className="w-full text-left transition-transform hover:scale-\[1\.02\]">/g, '<button key={c.id} onClick={onGoAgenda} className="w-full text-left rounded-lg outline-none focus:outline-none transition-transform hover:scale-[1.02] overflow-hidden bg-transparent">');

fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
