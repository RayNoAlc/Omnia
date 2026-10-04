const fs = require('fs');
let layout = fs.readFileSync('src/layouts/AppLayout.jsx', 'utf8');

layout = layout.replace(
  "</button>\n        </div>\n  \n        {/* Mobile Menu Overlay */}",
  "</button>\n        </div>\n      </div>\n  \n        {/* Mobile Menu Overlay */}"
);

fs.writeFileSync('src/layouts/AppLayout.jsx', layout, 'utf8');
