const fs = require('fs');
const content = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const used = ["LogOut", "Icon", "Moon", "BookOpen", "Briefcase", "Book", "Dumbbell", "Utensils", "Leaf", "Headphones", "Activity", "Globe", "Target", "Sparkles", "Pin", "Card", "Pencil", "PrimaryButton", "Check", "AlertCircle", "AlertTriangle", "Info", "EmptyState", "PriorityDot", "MetaHojeCard", "TypeTag", "SectionLabel", "FileText", "ImageIcon", "Mic", "Loader2", "Paperclip", "PendingReviewCard", "Suspense", "ChatMarkdown", "GhostButton", "X", "RefreshCw", "PlanosAtivos", "Trash2", "CompromissoWorkspaceModal", "Skull", "Sunrise", "Medal", "Crown", "Bird", "Flame", "Arquetipos", "OmniaWrapped", "Badges", "Heatmap", "Download", "MaterialsList", "QuizPanel", "GraduationCap", "Plus", "CompromissoWorkspaceContent", "ExportarBiblioteca", "DisciplinaCard", "Pause", "Play", "RotateCcw", "FocusPet", "Clock", "TrendingUp", "Send", "ModalShell", "SlidersHorizontal", "CalendarDays", "SonoModal", "PreferenciasModal", "CompromissoRotinaModal", "Wrench", "Palette", "Settings", "Gamepad2", "Calendar", "Key", "QAAutomatedSystem"];

let undefinedComponents = [];
for (const comp of used) {
  const isDefined = new RegExp(`(function ${comp}\\b|const ${comp}\\b|import[\\s\\S]*?\\b${comp}\\b[\\s\\S]*?from|as ${comp}\\b)`).test(content);
  if (!isDefined) {
    undefinedComponents.push(comp);
  }
}

console.log("Potentially undefined components:", undefinedComponents.join(', '));
