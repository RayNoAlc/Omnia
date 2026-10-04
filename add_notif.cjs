const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

if (!app.includes('useRef')) {
  app = app.replace('import { useState, useEffect }', 'import { useState, useEffect, useRef }');
}

const notifCode = "  /* ---------------- Notificacoes ---------------- */\n" +
"  const notifiedBlocks = useRef(new Set());\n" +
"  useEffect(() => {\n" +
"    if (!dataLoaded || routineBlocks.length === 0) return;\n" +
"    \n" +
"    if ('Notification' in window && Notification.permission === 'default') {\n" +
"      Notification.requestPermission();\n" +
"    }\n" +
"    \n" +
"    const interval = setInterval(() => {\n" +
"      if (!('Notification' in window) || Notification.permission !== 'granted') return;\n" +
"      \n" +
"      const now = new Date();\n" +
"      const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];\n" +
"      const diaAtual = dias[now.getDay()];\n" +
"      \n" +
"      const h = now.getHours();\n" +
"      const m = now.getMinutes();\n" +
"      const currentMins = h * 60 + m;\n" +
"      \n" +
"      routineBlocks.forEach(b => {\n" +
"        if (b.diaSemana !== diaAtual) return;\n" +
"        const [bH, bM] = b.horaInicio.split(':').map(Number);\n" +
"        const blockMins = bH * 60 + bM;\n" +
"        \n" +
"        const diff = blockMins - currentMins;\n" +
"        if (diff <= 10 && diff >= 0) {\n" +
"          const key = b.id + '-' + now.toDateString();\n" +
"          if (!notifiedBlocks.current.has(key)) {\n" +
"            new Notification('Omnia - Lembrete', {\n" +
"              body: b.titulo + ' começa em ' + diff + ' minutos!',\n" +
"              icon: '/omnia.png'\n" +
"            });\n" +
"            notifiedBlocks.current.add(key);\n" +
"          }\n" +
"        }\n" +
"      });\n" +
"    }, 10000);\n" +
"    \n" +
"    return () => clearInterval(interval);\n" +
"  }, [dataLoaded, routineBlocks]);\n";

app = app.replace(
  /  \/\* \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\- Autentica[\s\S]+? \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\- \*\//,
  notifCode + "\n  /* ---------------- Autenticacao ---------------- */"
);

fs.writeFileSync('src/App.jsx', app, 'utf8');
