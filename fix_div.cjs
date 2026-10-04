const fs = require('fs');
let layout = fs.readFileSync('src/layouts/AppLayout.jsx', 'utf8');

layout = layout.replace(
  "{mobileOpen ? <X className=\"w-6 h-6\" /> : <Menu className=\"w-6 h-6\" />}\n          </button>\n        </div>\n\n        {/* Mobile Menu Overlay */}",
  "{mobileOpen ? <X className=\"w-6 h-6\" /> : <Menu className=\"w-6 h-6\" />}\n          </button>\n        </div>\n      </div>\n\n        {/* Mobile Menu Overlay */}"
);

fs.writeFileSync('src/layouts/AppLayout.jsx', layout, 'utf8');
