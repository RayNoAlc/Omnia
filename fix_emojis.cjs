const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Replace the line that starts with 'const TIPO_ROTINA_ICONE = ' entirely until the semicolon.
tabs = tabs.replace(/const TIPO_ROTINA_ICONE = \{[\s\S]*?\};/, 'const TIPO_ROTINA_ICONE = { sono: "🌙", aula: "🎓", trabalho: "💼", estudo: "📚", academia: "🏋️", refeicao: "🍽️", livre: "🍃", lazer: "🎮", esporte: "⚽", pessoal: "👤", consulta: "🩺", evento: "🎉" };');

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
