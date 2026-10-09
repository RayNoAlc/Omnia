const fs = require('fs');
let chat = fs.readFileSync('src/components/ChatMarkdown.jsx', 'utf8');

// Inject Backlink renderer before returning
const backlinkLogic = `
  // Replace [[text]] with a custom link
  let html = DOMPurify.sanitize(marked.parse(text));
  html = html.replace(/\\[\\[(.*?)\\]\\]/g, '<a href="#" data-backlink="$1" style="color: #3b82f6; text-decoration: underline; cursor: pointer;">[[$1]]</a>');
`;

chat = chat.replace(
  /const html = DOMPurify\.sanitize\(marked\.parse\(text\)\);/,
  backlinkLogic
);

chat = chat.replace(
  /return \(\s*<div\s*className=\{\`markdown-body \$\{className\}\`\}/,
  `
  useEffect(() => {
    const handleBacklink = (e) => {
      const target = e.target.closest('a[data-backlink]');
      if (target) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('omnia-search', { detail: target.getAttribute('data-backlink') }));
      }
    };
    document.addEventListener('click', handleBacklink);
    return () => document.removeEventListener('click', handleBacklink);
  }, []);

  return (
    <div
      className={\`markdown-body \${className}\`}
`
);

fs.writeFileSync('src/components/ChatMarkdown.jsx', chat, 'utf8');
console.log("Injected Backlinks in ChatMarkdown!");
