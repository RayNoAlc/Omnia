import os
import re

tabs_to_extract = ['HojeTab', 'InboxTab', 'AgendaTab', 'DesempenhoTab', 'BibliotecaTab', 'FocoTab', 'SecretariaTab', 'RotinaTab']

with open(r'C:\Users\ryant\Downloads\Minha-vida-em-um-app\src\components\Tabs.jsx', 'r', encoding='utf-8') as f:
    tabs_code = f.read()

signatures = {}
for tab in tabs_to_extract:
    tab_file = os.path.join(r'C:\Users\ryant\Downloads\Minha-vida-em-um-app\src\components\tabs', f'{tab}.jsx')
    with open(tab_file, 'r', encoding='utf-8') as f:
        content = f.read()
    sig = content.split('export function ')[1].strip()
    signatures[tab] = 'export function ' + sig

# Split by \n) {
parts = tabs_code.split('\n) {')
if len(parts) != 9:
    print(f"Error: Found {len(parts) - 1} occurrences of '\\n) {{', expected 8.")
    exit(1)

new_tabs_code = parts[0]
tab_bodies = []

for i in range(1, 9):
    code_remainder = parts[i]
    brace_count = 1
    idx = 0
    while brace_count > 0 and idx < len(code_remainder):
        if code_remainder[idx] == '{':
            brace_count += 1
        elif code_remainder[idx] == '}':
            brace_count -= 1
        idx += 1
    
    body = code_remainder[:idx]
    tab_bodies.append(body)
    
    new_tabs_code += code_remainder[idx:]

with open(r'C:\Users\ryant\Downloads\Minha-vida-em-um-app\src\components\Tabs.jsx', 'w', encoding='utf-8') as f:
    f.write(new_tabs_code)

for i, tab in enumerate(tabs_to_extract):
    sig = signatures[tab]
    body = tab_bodies[i]
    
    tab_file = os.path.join(r'C:\Users\ryant\Downloads\Minha-vida-em-um-app\src\components\tabs', f'{tab}.jsx')
    with open(tab_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content.replace(sig, sig + "\n) {" + body)
    
    with open(tab_file, 'w', encoding='utf-8') as f:
        f.write(new_content)

print("Extraction complete.")
