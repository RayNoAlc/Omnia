const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  /\) : \(\s*\{dates\.length === 0 \? \(/,
  ') : dates.length === 0 ? ('
);

// We also need to fix the closing brace!
// My previous script replaced:
// </div>\n        )}\n\n      {openCommitment && (
// with
// </div>\n        )}\n\n      {openCommitment && (
// Wait, my previous script did:
// tabs = tabs.replace(/<\/div>\s*\}\s*\{openCommitment && \(/, '</div>\n        )}\n\n      {openCommitment && (');
// So the old closing was `</div>\n        )}\n\n      {openCommitment && (`
// Let's replace the extra `}` that was originally closing `{dates.length === 0 ? ... : ...}`.

tabs = tabs.replace(
  /<\/div>\s*\)\}\s*\{openCommitment && \(/,
  '</div>\n        )\n\n      {openCommitment && ('
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Fixed JSX ternary braces!");
