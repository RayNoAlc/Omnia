const fs = require('fs');
let layout = fs.readFileSync('src/layouts/AppLayout.jsx', 'utf8');

if (!layout.includes('beforeinstallprompt')) {
  // Inject useEffect and state
  layout = layout.replace(
    'import React, { useState } from "react";',
    'import React, { useState, useEffect } from "react";'
  );
  
  if (!layout.includes('Download')) {
    layout = layout.replace('LogOut, Menu, Palette, X', 'LogOut, Menu, Palette, X, Download');
  }
  
  const pwaLogic = "const [deferredPrompt, setDeferredPrompt] = useState(null);\n" +
"  useEffect(() => {\n" +
"    const handler = (e) => {\n" +
"      e.preventDefault();\n" +
"      setDeferredPrompt(e);\n" +
"    };\n" +
"    window.addEventListener('beforeinstallprompt', handler);\n" +
"    return () => window.removeEventListener('beforeinstallprompt', handler);\n" +
"  }, []);\n\n" +
"  const handleInstallPwa = async () => {\n" +
"    if (!deferredPrompt) return;\n" +
"    deferredPrompt.prompt();\n" +
"    const { outcome } = await deferredPrompt.userChoice;\n" +
"    if (outcome === 'accepted') setDeferredPrompt(null);\n" +
"  };\n\n";

  layout = layout.replace(
    'const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);',
    'const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);\n  ' + pwaLogic
  );
  
  // Inject Desktop Button
  const desktopBtn = "{deferredPrompt && (\n" +
"              <button onClick={handleInstallPwa} className=\"w-full flex items-center gap-2 px-3 py-2 mb-2 text-sm font-bold rounded-lg hover:bg-opacity-80 transition-colors\" style={{ backgroundColor: T.brand, color: '#fff' }}>\n" +
"                <Download className=\"w-4 h-4\" /> Instalar App\n" +
"              </button>\n" +
"            )}\n" +
"            <button onClick={() => setIsThemeModalOpen(true)}";
  layout = layout.replace('<button onClick={() => setIsThemeModalOpen(true)}', desktopBtn);

  // Inject Mobile Button
  const mobileBtn = "{deferredPrompt && (\n" +
"              <button onClick={handleInstallPwa} className=\"w-full flex items-center justify-center gap-2 px-4 py-3 mb-2 text-base font-bold rounded-xl shadow-lg\" style={{ backgroundColor: T.brand, color: '#fff' }}>\n" +
"                 <Download className=\"w-5 h-5\" /> Baixar App\n" +
"              </button>\n" +
"            )}\n" +
"            <button onClick={() => { setIsThemeModalOpen(true);";
  layout = layout.replace('<button onClick={() => { setIsThemeModalOpen(true);', mobileBtn);
}

fs.writeFileSync('src/layouts/AppLayout.jsx', layout, 'utf8');
