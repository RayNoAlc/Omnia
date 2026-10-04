const fs = require('fs');
const content = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const lines = content.split('\n');
const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/gu;

lines.forEach((line, index) => {
  if (emojiRegex.test(line)) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
