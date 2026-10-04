const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// The end of the file is:
//       </section>
//
//     </div>
//   );
// }

tabs = tabs.replace(
  /      <\/section>\s*<\/div>\s*\);\s*}\s*$/,
  `      </section>\n      {isDev && <QAAutomatedSystem userId={userId} />}\n    </div>\n  );\n}`
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
