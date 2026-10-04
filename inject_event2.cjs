const fs = require('fs');
let code = fs.readFileSync('src/lib/useFocusTimer.js', 'utf8');

const effect = `
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('OmniaFocusStatus', { detail: { running: running && phase === 'work' } }));
      document.body.setAttribute('data-omnia-focus', running && phase === 'work' ? 'true' : 'false');
    }
  }, [running, phase]);
`;

code = code.replace(
  'const phaseEndHandled = useRef(false);',
  'const phaseEndHandled = useRef(false);\n' + effect
);

fs.writeFileSync('src/lib/useFocusTimer.js', code, 'utf8');
