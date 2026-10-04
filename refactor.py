import os
import re

file_path = r'C:\Users\ryant\Downloads\Minha-vida-em-um-app\src\components\Tabs.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

tabs_to_extract = ['HojeTab', 'InboxTab', 'AgendaTab', 'DesempenhoTab', 'BibliotecaTab', 'FocoTab', 'SecretariaTab', 'RotinaTab']

# Find all function and const declarations to export them from Tabs.jsx
# We will do a generic replacement:
# function MetaHojeCard -> export function MetaHojeCard
# const TIPO_ROTINA_ICONE -> export const TIPO_ROTINA_ICONE
# etc., but only for top-level definitions.

exports_needed = []

# We will use regex to find the Tab functions and extract them.
# A function might span multiple lines. We need to parse matching braces.
def extract_function(func_name, code):
    pattern = r'export\s+function\s+' + func_name + r'\s*\('
    match = re.search(pattern, code)
    if not match:
        return None, code
    
    start_idx = match.start()
    # Find the opening brace
    brace_start = code.find('{', start_idx)
    if brace_start == -1:
        return None, code
        
    brace_count = 1
    idx = brace_start + 1
    while brace_count > 0 and idx < len(code):
        if code[idx] == '{':
            brace_count += 1
        elif code[idx] == '}':
            brace_count -= 1
        idx += 1
        
    func_code = code[start_idx:idx]
    
    # Remove it from the original code
    new_code = code[:start_idx] + code[idx:]
    return func_code, new_code

new_tabs_code = {}
current_code = content

for tab in tabs_to_extract:
    func_code, current_code = extract_function(tab, current_code)
    if func_code:
        new_tabs_code[tab] = func_code

# Now, current_code contains Tabs.jsx WITHOUT the tab components.
# We need to make sure all other top-level functions/consts are exported so tabs can import them.
# Let's find all top-level functions and consts.
top_level_funcs = re.findall(r'^function\s+([A-Z]\w+)\s*\(', current_code, re.MULTILINE)
top_level_consts = re.findall(r'^const\s+([A-Z_]+)\s*=', current_code, re.MULTILINE)

# Add export to top-level functions and consts
for func in top_level_funcs:
    current_code = re.sub(r'^function\s+' + func + r'\s*\(', f'export function {func}(', current_code, flags=re.MULTILINE)

for const in top_level_consts:
    current_code = re.sub(r'^const\s+' + const + r'\s*=', f'export const {const} =', current_code, flags=re.MULTILINE)

# Export all the Tab components from Tabs.jsx
export_statements = "\n"
for tab in tabs_to_extract:
    export_statements += f"export {{ {tab} }} from './tabs/{tab}';\n"

current_code += export_statements

# Write Tabs.jsx
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(current_code)

# Now, create the individual tab files.
imports_header = '''import { useState, useEffect, useRef, lazy, Suspense } from "react";
import {
  Send, Play, Pause, RotateCcw, Check, X, Loader2, AlertCircle,
  Plus, Trash2, Clock, Sparkles, GraduationCap, RefreshCw,
  AlertTriangle, Info, LogOut, FileText, Image as ImageIcon, Mic, Paperclip, Download,
  Moon, SlidersHorizontal, Pencil, Target,
} from "lucide-react";
import {
  T, TINT, TIPO_LABELS, PRIORIDADE_META, PERIODO_LABELS, TABS,
  PriorityDot, TypeTag, Card, SectionLabel, EmptyState, PrimaryButton, GhostButton,
} from "../ui";
import { uid, todayISO, formatDateBR, weekdayShort, addDays, computeInterruptionInsight, fileToBase64, hexToRgba, getWeekRange, getEffectiveRoutineItemsForDate, planoRecomendadoHoje, computeAvisos, getSemestre } from "../../lib/utils";
import { aiGenerateSummary, aiGenerateQuiz, aiEvaluateProfessor } from "../../lib/aiHelpers";
import { callVision, callAudioTranscription, callAIWithTools } from "../../lib/ai";
import { ROUTINE_TOOLS, executeRoutineTool } from "../../lib/routineTools";
import { PRESETS } from "../../lib/useFocusTimer";
const ChatMarkdown = lazy(() => import("../ChatMarkdown").then((m) => ({ default: m.ChatMarkdown })));
import {
  addQuizAttempt, addProfessorAttempt,
  upsertSummary, addSession as dbAddSession,
  uploadMaterialFile, addMaterial, getMaterialSignedUrl, deleteMaterial,
  addNote, deleteNote,
} from "../../lib/db";
'''

# Identify what to import from Tabs.jsx for each file
tabs_export_list = top_level_funcs + top_level_consts
tabs_imports_str = f"import {{ {', '.join(tabs_export_list)} }} from '../Tabs';\n\n" if tabs_export_list else ""

os.makedirs(r'C:\Users\ryant\Downloads\Minha-vida-em-um-app\src\components\tabs', exist_ok=True)

for tab, func_code in new_tabs_code.items():
    tab_file_path = os.path.join(r'C:\Users\ryant\Downloads\Minha-vida-em-um-app\src\components\tabs', f'{tab}.jsx')
    with open(tab_file_path, 'w', encoding='utf-8') as f:
        f.write(imports_header)
        f.write(tabs_imports_str)
        f.write(func_code)

print("Refactoring complete.")
