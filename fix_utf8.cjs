const fs = require('fs');

const replacements = {
  'â€¢': '•',
  'â€”': '—',
  'â€“': '–',
  'â€œ': '“',
  'â€': '”',
  'â€™': '’',
  'â€˜': '‘',
  'Â·': '·',
  'Ã§': 'ç',
  'Ã£': 'ã',
  'Ã¡': 'á',
  'Ã©': 'é',
  'Ã­': 'í',
  'Ã³': 'ó',
  'Ãº': 'ú',
  'Ã§Ã£o': 'ção',
  'Ãµ': 'õ',
  'Ãª': 'ê',
  'Ã¢': 'â',
  'Ã': 'Á', // careful
  'Ã‰': 'É'
};

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const [bad, good] of Object.entries(replacements)) {
    if (content.includes(bad)) {
      content = content.split(bad).join(good);
      changed = true;
    }
  }
  // Let's also fix the specific em-dash and en-dash manually
  // Actually, since I did string split join, it will work.
  // Wait, â€” has â€ in it! If I replace â€ first, it breaks â€”.
  // The object entries are not guaranteed order. Let's do it sorted by length descending.
  
  const sortedBad = Object.keys(replacements).sort((a, b) => b.length - a.length);
  
  content = fs.readFileSync(file, 'utf8');
  for (const bad of sortedBad) {
    if (content.includes(bad)) {
      content = content.split(bad).join(replacements[bad]);
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
  }
}

fixFile('src/components/Tabs.jsx');
fixFile('src/lib/aiHelpers.js');
