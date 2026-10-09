const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
  /<meta name="viewport" content="width=device-width, initial-scale=1.0" \/>/,
  '$&\n    <meta name="theme-color" content="#141C2F" />\n    <meta name="description" content="Minha Vida em um App - Seu gerenciador de rotina definitivo" />\n    <link rel="icon" type="image/png" href="/omnia.png" />'
);

fs.writeFileSync('index.html', html, 'utf8');
console.log("Injected meta tags!");
