const fs = require('fs');
let chat = fs.readFileSync('src/components/ChatMarkdown.jsx', 'utf8');

if (!chat.includes('import { useEffect }')) {
  chat = 'import { useEffect } from "react";\n' + chat;
  fs.writeFileSync('src/components/ChatMarkdown.jsx', chat, 'utf8');
  console.log("Fixed missing useEffect import in ChatMarkdown.jsx");
} else {
  console.log("useEffect already imported");
}
