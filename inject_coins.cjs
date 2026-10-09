const fs = require('fs');
let hook = fs.readFileSync('src/lib/useFocusTimer.js', 'utf8');

hook = hook.replace(
  /const session = \{ id: uid\(\), disciplina: selectedId, commitment_id: null, minutos: workMin, duracao_preset_min: selectedId === "livre" \? 0 : preset\.work \/ 60, interrupcoes: interruptions, date: todayISO\(\), created_at: new Date\(\)\.toISOString\(\) \};/,
  'const session = { id: uid(), disciplina: selectedId, commitment_id: null, minutos: workMin, duracao_preset_min: selectedId === "livre" ? 0 : preset.work / 60, interrupcoes: interruptions, date: todayISO(), created_at: new Date().toISOString() };\n\n          // Ganha moedas virtuais (Idea 27)\n          const c = JSON.parse(localStorage.getItem("omnia_config") || "{}");\n          c.coins = (c.coins || 0) + (workMin * 2); // 2 moedas por minuto focado\n          localStorage.setItem("omnia_config", JSON.stringify(c));\n          window.dispatchEvent(new Event("storage"));'
);

fs.writeFileSync('src/lib/useFocusTimer.js', hook, 'utf8');
console.log("Injected Coins Reward System!");
