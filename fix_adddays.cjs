const fs = require('fs');
let code = fs.readFileSync('src/lib/utils.js', 'utf8');

code = code.replace(
  /export function addDays\(iso, n\) \{[\s\S]*?\}/,
  `export function addDays(iso, n) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}`
);

fs.writeFileSync('src/lib/utils.js', code, 'utf8');
console.log("Fixed addDays timezone logic!");
