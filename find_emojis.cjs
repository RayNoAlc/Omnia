const fs = require('fs');
const content = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Regex to match emojis (basic range)
const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/gu;
const matches = [...new Set(content.match(emojiRegex))];

console.log("Emojis found:");
console.log(matches.join(', '));
