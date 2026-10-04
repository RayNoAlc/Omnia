const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const regexUseState = /const \[messages, setMessages\] = useState\(\[\s*\{\s*role: "assistant",\s*text: ".*?"\s*\},?\s*\]\);/;
const replacementUseState = `const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem("secretariaMessages");
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [
      { role: "assistant", text: "Oi! Além de responder perguntas, agora também consigo mexer na sua rotina — pode pedir pra criar, mudar ou cancelar um compromisso." },
    ];
  });

  useEffect(() => {
    sessionStorage.setItem("secretariaMessages", JSON.stringify(messages));
  }, [messages]);`;

code = code.replace(regexUseState, replacementUseState);

fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
