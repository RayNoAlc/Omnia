const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

const notifLogic = `
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);
`;

app = app.replace(
  /const \[initialInboxText, setInitialInboxText\] = useState\(""\);/,
  '$&\n' + notifLogic
);

fs.writeFileSync('src/App.jsx', app, 'utf8');
console.log("Injected notification request!");
