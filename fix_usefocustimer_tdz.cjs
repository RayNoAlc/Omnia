const fs = require('fs');
let code = fs.readFileSync('src/lib/useFocusTimer.js', 'utf8');

// Match the block of state declarations
const stateVarsRegex = /const \[selectedId, setSelectedId\][\s\S]*?const channelRef = useRef\(null\);/;
const stateVarsMatch = code.match(stateVarsRegex);

if (stateVarsMatch) {
  const stateVarsStr = stateVarsMatch[0];
  code = code.replace(stateVarsStr, ''); // remove it from current position
  
  // Insert it right after the function declaration
  code = code.replace(
    /export function useFocusTimer\(\{.*?\}\) \{/,
    `$&\n  ${stateVarsStr}\n`
  );
  
  fs.writeFileSync('src/lib/useFocusTimer.js', code, 'utf8');
  console.log("Fixed TDZ bug by moving state variables to the top of the hook!");
} else {
  console.log("Could not match state variables.");
}
