const fs = require('fs');
let layout = fs.readFileSync('src/layouts/AppLayout.jsx', 'utf8');

// Remove ThemeModal Component
layout = layout.replace(/function ThemeModal[\s\S]*?\}\n\n/, '');

// Remove ThemeModal state
layout = layout.replace(/const \[isThemeModalOpen, setIsThemeModalOpen\] = useState\(false\);\n/, '');

// Remove Desktop Theme Button
layout = layout.replace(/<button onClick=\{\(\) => setIsThemeModalOpen\(true\)\}[\s\S]*?Temas & Cores\n\s*<\/button>\n/, '');

// Remove Mobile Theme Button
layout = layout.replace(/<button onClick=\{\(\) => \{ setIsThemeModalOpen\(true\); setMobileOpen\(false\); \}\}[\s\S]*?Temas\n\s*<\/button>\n/, '');

// Remove ThemeModal rendering
layout = layout.replace(/\{isThemeModalOpen && <ThemeModal onClose=\{\(\) => setIsThemeModalOpen\(false\)\} \/>\}\n\n/, '');

fs.writeFileSync('src/layouts/AppLayout.jsx', layout, 'utf8');
