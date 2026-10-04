const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Modify RotinaTab
tabs = tabs.replace('export function RotinaTab({ routine, routineBlocks, routineExceptions, setRoutine, setRoutineBlocks, setRoutineExceptions }) {', 'export function RotinaTab({ config, routine, routineBlocks, routineExceptions, setRoutine, setRoutineBlocks, setRoutineExceptions }) {');

tabs = tabs.replace(
  '<button onClick={exportarGrade} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-opacity-80 transition-colors" style={{ backgroundColor: T.brand, color: \'#fff\' }}>',
  '{config?.enablePdf !== false && <button onClick={exportarGrade} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-opacity-80 transition-colors" style={{ backgroundColor: T.brand, color: \'#fff\' }}>'
);
tabs = tabs.replace(
  '<Download className="w-4 h-4" /> Gerar PDF\n            </button>',
  '<Download className="w-4 h-4" /> Gerar PDF\n            </button>}'
);

tabs = tabs.replace(
  '<button onClick={exportarCalendario} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-opacity-80 transition-colors" style={{ backgroundColor: T.importante, color: \'#fff\' }}>',
  '{config?.enableCalendar !== false && <button onClick={exportarCalendario} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-opacity-80 transition-colors" style={{ backgroundColor: T.importante, color: \'#fff\' }}>'
);
tabs = tabs.replace(
  '<Calendar className="w-4 h-4" /> Sincronizar Calendário\n            </button>',
  '<Calendar className="w-4 h-4" /> Sincronizar Calendário\n            </button>}'
);

// Modify FocoTab
tabs = tabs.replace('export function FocoTab({ timer, setTimer, sessions, setSessions, studyBlocks, setStudyBlocks, userId }) {', 'export function FocoTab({ config, timer, setTimer, sessions, setSessions, studyBlocks, setStudyBlocks, userId }) {');

const lofiStart = '{/* Modo Imersivo / Lo-Fi */}';
tabs = tabs.replace(
  lofiStart,
  '{config?.enableLofi !== false && (' + lofiStart
);
const lofiEndStr = '</iframe>\n              </div>\n            )}\n          </div>\n        </div>';
tabs = tabs.replace(
  lofiEndStr,
  lofiEndStr + ')}'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
