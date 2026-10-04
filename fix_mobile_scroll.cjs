const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Fix the overflow issue preventing mobile scrolling
tabs = tabs.replace(
  /style=\{\{ borderRadius: "12px", overflow: "hidden", padding: "16px", backgroundColor: "#0B1120" \}\}/g,
  'style={{ borderRadius: "12px", padding: "16px", backgroundColor: "#0B1120" }}'
);

// We can also make the min-width larger on mobile so blocks aren't too squished
// "min-w-[700px]" -> "min-w-[800px] md:min-w-[700px]"
tabs = tabs.replace(
  /<div className="min-w-\[700px\]">/g,
  '<div className="min-w-[800px] md:min-w-[700px]">'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
