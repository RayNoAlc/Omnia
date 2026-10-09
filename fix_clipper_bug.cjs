const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

// Find the real InboxTab render
app = app.replace(
  /<InboxTab userId=\{userId\} onSubmit=\{handleInboxSubmit\} loading=\{inboxLoading\} error=\{inboxError\}/,
  '<InboxTab userId={userId} initialInboxText={initialInboxText} setInitialInboxText={setInitialInboxText} onSubmit={handleInboxSubmit} loading={inboxLoading} error={inboxError}'
);

fs.writeFileSync('src/App.jsx', app, 'utf8');
console.log("Fixed Web Clipper InboxTab props!");
