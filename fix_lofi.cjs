const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const targetStr = "{lofiOn && <iframe width=\"2\" height=\"2\" src=\"https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1\" allow=\"autoplay\" style={{ opacity: 0.01, position: 'absolute' }} />}\n";

const newStr = "{lofiOn && (\n" +
"  <div className=\"mt-6 flex justify-center\">\n" +
"    <iframe width=\"280\" height=\"157\" src=\"https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1\" title=\"Lofi Girl\" frameBorder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowFullScreen className=\"rounded-lg shadow-md\" />\n" +
"  </div>\n" +
")}\n";

tabs = tabs.replace(targetStr, newStr);
fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
