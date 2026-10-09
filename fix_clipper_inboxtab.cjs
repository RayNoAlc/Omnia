const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Fix signature
tabs = tabs.replace(
  /export function InboxTab\(\{ userId, onSubmit, loading, error, pendingReview, setPendingReview, onConfirm, onSaveNote, setMaterials \}\) \{/,
  'export function InboxTab({ userId, onSubmit, loading, error, pendingReview, setPendingReview, onConfirm, onSaveNote, setMaterials, initialInboxText, setInitialInboxText }) {'
);

// Fix state initialization and effect
tabs = tabs.replace(
  /const \[text, setText\] = useState\(""\);/,
  'const [text, setText] = useState(initialInboxText || "");\n  useEffect(() => { if (initialInboxText) { setText(initialInboxText); if (setInitialInboxText) setInitialInboxText(""); } }, [initialInboxText, setInitialInboxText]);'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Fixed InboxTab Web Clipper prop ingestion!");
