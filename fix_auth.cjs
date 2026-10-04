const fs = require('fs');
let code = fs.readFileSync('src/components/Auth.jsx', 'utf8');

const newHeader = `
        <div className="flex flex-col items-center mb-8">
          <img src="/omnia.png" alt="Omnia" className="h-16 invert opacity-90 transition-opacity mb-4" />
          <p className="text-sm text-center" style={{ color: T.inkSoft }}>
            {mode === "entrar" ? "Organize, gamifique e masterize seus estudos." : "Sua nova vida acadêmica começa aqui."}
          </p>
        </div>
`;

code = code.replace(
  /<h1 className="text-xl font-semibold tracking-tight mb-1">Vida Universit.*?<\/h1>\s*<p className="text-sm mb-6".*?>\s*\{mode === "entrar".*?\s*<\/p>/s,
  newHeader.trim()
);

fs.writeFileSync('src/components/Auth.jsx', code, 'utf8');
