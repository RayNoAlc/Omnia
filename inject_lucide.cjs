const fs = require('fs');
let file = 'src/components/Tabs.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Import
if (!content.includes('lucide-react')) {
  content = content.replace(
    /import \{ useState[^\}]+\} from "react";/,
    `$&
import {
  Moon, BookOpen, Briefcase, Book, Dumbbell, Utensils, Leaf, Headphones, Trophy,
  Gamepad2, Calendar, FileText, Key, Check, Flame, Pencil, TrendingUp, Target,
  CheckCircle, Globe, Wrench, Sparkles, Bird, Crown, Skull, Sunrise, Activity, Medal, Pin, Clock
} from 'lucide-react';`
  );
}

// 2. Routine Icons
content = content.replace(
  /const TIPO_ROTINA_ICONE = \{[^\}]+\};/,
  `const getRoutineIcon = (type) => {
  const props = { size: 20, strokeWidth: 1.5, className: "opacity-80" };
  switch(type) {
    case "sono": return <Moon {...props} />;
    case "aula": return <BookOpen {...props} />;
    case "trabalho": return <Briefcase {...props} />;
    case "estudo": return <Book {...props} />;
    case "academia": return <Dumbbell {...props} />;
    case "refeicao": return <Utensils {...props} />;
    case "livre": return <Leaf {...props} />;
    case "lazer": return <Headphones {...props} />;
    case "esporte": return <Activity {...props} />;
    case "pessoal": return <Globe {...props} />;
    case "consulta": return <Target {...props} />;
    case "evento": return <Sparkles {...props} />;
    default: return <Pin {...props} />;
  }
};`
);
content = content.replace(
  /\{TIPO_ROTINA_ICONE\[item\.tipo\] \|\| "[^"]+"\}/g,
  "{getRoutineIcon(item.tipo)}"
);

// 3. Badges
content = content.replace(/"🧟"/g, '<Skull size={24} />');
content = content.replace(/"🌅"/g, '<Sunrise size={24} />');
content = content.replace(/"🥉"/g, '<Medal size={24} />');
content = content.replace(/"🥇"/g, '<Crown size={24} />');

// 4. Archetypes
content = content.replace(/'O Coruja 🦉'/g, '<span className="flex items-center gap-2">O Coruja <Bird size={16} /></span>');
content = content.replace(/'O Maratonista 🏃'/g, '<span className="flex items-center gap-2">O Maratonista <Activity size={16} /></span>');
content = content.replace(/'O Estrategista ♟️'/g, '<span className="flex items-center gap-2">O Estrategista <Target size={16} /></span>');

// 5. General Replacements
content = content.replace(/✨ Ver Meu Omnia Wrapped/g, '<span className="flex items-center gap-2 justify-center"><Sparkles size={16}/> Ver Meu Omnia Wrapped</span>');
content = content.replace(/✨ Nível/g, '<Sparkles size={16} className="inline mr-1 -mt-1"/> Nível');
content = content.replace(/🔥 \{streak\}/g, '<Flame size={20} className="inline mr-1 -mt-1"/> {streak}');
content = content.replace(/\{petName \|\| "Coruja Omnia"\} ✏️/g, '{petName || "Coruja Omnia"} <Pencil size={14} className="inline ml-1 opacity-50"/>');
content = content.replace(/📚 Disciplina/g, '<Book size={14} className="inline mr-1 -mt-0.5" /> Disciplina');
content = content.replace(/⏱️ Essa sessão/g, '<Clock size={14} className="inline mr-1 -mt-0.5" /> Essa sessão');
content = content.replace(/📈 Total hoje/g, '<TrendingUp size={14} className="inline mr-1 -mt-0.5" /> Total hoje');
content = content.replace(/🎯 Meta/g, '<Target size={14} className="inline mr-1 -mt-0.5" /> Meta');
content = content.replace(/>✅</g, '><CheckCircle size={14} className="inline ml-1" /><');
content = content.replace(/🌐 Modo Multiplayer/g, '<Globe size={18} className="inline mr-2 -mt-0.5" /> Modo Multiplayer');
content = content.replace(/🛠️ Painel do Desenvolvedor \(QA\)/g, '<Wrench size={20} className="inline mr-2 -mt-1" /> Painel do Desenvolvedor (QA)');
content = content.replace(/🎮 Gamificação Completa/g, '<Gamepad2 size={20} className="inline mr-2 -mt-1" /> Gamificação Completa');
content = content.replace(/🎧 Modo Imersivo Lo-Fi/g, '<Headphones size={20} className="inline mr-2 -mt-1" /> Modo Imersivo Lo-Fi');
content = content.replace(/📅 Sincronizar Calendário \(Google\/Apple\)/g, '<Calendar size={20} className="inline mr-2 -mt-1" /> Sincronizar Calendário (Google/Apple)');
content = content.replace(/📄 Gerar PDF da Rotina/g, '<FileText size={20} className="inline mr-2 -mt-1" /> Gerar PDF da Rotina');
content = content.replace(/🔑 Inteligência Artificial/g, '<Key size={20} className="inline mr-2 -mt-1" /> Inteligência Artificial');
content = content.replace(/✓ Chave pessoal configurada/g, '<Check size={14} className="inline mr-1 -mt-0.5" /> Chave pessoal configurada');

fs.writeFileSync(file, content, 'utf8');
console.log("Lucide icons injected into Tabs.jsx");
