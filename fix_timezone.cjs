const fs = require('fs');
let code = fs.readFileSync('src/lib/utils.js', 'utf8');

code = code.replace(
  /export function todayISO\(\) \{\s*return new Date\(\)\.toISOString\(\)\.slice\(0, 10\);\s*\}/,
  `export function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}`
);

fs.writeFileSync('src/lib/utils.js', code, 'utf8');
console.log("Fixed todayISO to use local timezone!");
