const fs = require('fs');
let ui = fs.readFileSync('src/components/ui.jsx', 'utf8');

const hackerTheme = `
  hacker: {
    bg: "#000000",
    surface: "#0a0a0a",
    surfaceAlt: "#111111",
    border: "#003300",
    ink: "#00ff00",
    inkSoft: "#008800",
    brand: "#00ff00",
    brandInk: "#000000",
    critico: "#ff0000",
    importante: "#ffff00",
    normal: "#00ff00"
  },
`;

ui = ui.replace(
  /export const THEMES = \{/,
  'export const THEMES = {\n' + hackerTheme
);

fs.writeFileSync('src/components/ui.jsx', ui, 'utf8');
console.log("Injected Hacker Theme!");
