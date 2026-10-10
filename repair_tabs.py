import re

with open("src/components/Tabs.jsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Extract showTemplates from InboxTab
showTemplatesRegex = r"\s*\{showTemplates && <RoutineTemplatesModal onClose=\{\(\) => setShowTemplates\(false\)\} onAddBlock=\{onAddBlock\} T=\{T\} \/>\}"
code = re.sub(showTemplatesRegex, "", code)

# Inject it into RotinaTab
rotinaReturnRegex = r"(return \(\n\s*<div className=\"space-y-4\">)"
code = re.sub(rotinaReturnRegex, r"\1\n      {showTemplates && <RoutineTemplatesModal onClose={() => setShowTemplates(false)} onAddBlock={onAddBlock} T={T} />}", code)

# 2. Extract Diário de Bordo from PlanosAtivos
journalHtmlRegex = r"(\s*\{/\* Diário de Bordo \(Idea 36 & 38\) \*/\}[\s\S]*?\}\s*\)\s*\}\s*</div>\s*\)\s*;\s*\})"
journalMatch = re.search(journalHtmlRegex, code)

if journalMatch:
    journalBlock = journalMatch.group(1)
    # The journalBlock ends with "})", which belongs to the map() inside PlanosAtivos!
    # Wait, my regex is a bit greedy/wrong. Let's do it manually.
