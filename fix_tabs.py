import os

tabs_to_extract = ['HojeTab', 'InboxTab', 'AgendaTab', 'DesempenhoTab', 'BibliotecaTab', 'FocoTab', 'SecretariaTab', 'RotinaTab']

with open(r'C:\Users\ryant\Downloads\Minha-vida-em-um-app\src\components\Tabs.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for tab in tabs_to_extract:
    tab_file = os.path.join(r'C:\Users\ryant\Downloads\Minha-vida-em-um-app\src\components\tabs', f'{tab}.jsx')
    with open(tab_file, 'r', encoding='utf-8') as f:
        tab_content = f.read()
    
    # Extract the signature from the bottom of tab_content
    # It looks like "export function XTab({ ... }"
    signature = tab_content.split('export function ')[1].strip()
    signature = 'export function ' + signature

    # Now find the corresponding ") {" in Tabs.jsx
    # We will search sequentially, since we know they are in order.
    # Wait, the signature might not end with ") {", it might be cut off at "}"
    # Wait, let's look at signature.
    print(f"Signature for {tab}:\n{signature[:100]}")

