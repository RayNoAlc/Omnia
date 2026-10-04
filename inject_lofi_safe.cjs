const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const startIdx = tabs.indexOf("<GhostButton onClick={encerrar}>");
if (startIdx !== -1) {
  const endIdx = tabs.indexOf("</Card>", startIdx);
  if (endIdx !== -1) {
    const block = tabs.slice(startIdx, endIdx);
    
    const toggleCode = "\n            <div className=\"flex items-center justify-center gap-2 mt-4\">\n" +
"              <GhostButton onClick={() => setLofiOn(!lofiOn)} style={{ color: lofiOn ? T.brand : T.inkSoft }}>\n" +
"                <Headphones className=\"w-4 h-4\" /> {lofiOn ? 'Lo-Fi: Ligado' : 'Lo-Fi: Desligado'}\n" +
"              </GhostButton>\n" +
"            </div>\n" +
"            {lofiOn && <iframe width=\"2\" height=\"2\" src=\"https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1\" allow=\"autoplay\" style={{ opacity: 0.01, position: 'absolute' }} />}\n";

    // Insert toggleCode before </Card>
    // but we need to insert it after the </div> that closes the flex row of buttons.
    const divEndIdx = tabs.lastIndexOf("</div>", endIdx);
    
    const before = tabs.slice(0, divEndIdx + 6);
    const after = tabs.slice(divEndIdx + 6);
    
    fs.writeFileSync('src/components/Tabs.jsx', before + toggleCode + after, 'utf8');
    console.log("Success");
  }
}
