const fs = require('fs');
let hook = fs.readFileSync('src/lib/useFocusTimer.js', 'utf8');

const antiDistractionLogic = `
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && running && phase === "work") {
        setInterruptions(prev => prev + 1);
        const config = JSON.parse(localStorage.getItem("omnia_config") || "{}");
        if (config.enableAntiDistraction !== false) {
          if (Notification.permission === "granted") {
            new Notification("Atenção!", { body: "Você saiu da aba durante o foco! Foco é foco.", icon: "/favicon.ico" });
          }
          const audio = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=");
          audio.play().catch(()=>{});
        }
      }
    };
    window.addEventListener("visibilitychange", handleVisibility);
    return () => window.removeEventListener("visibilitychange", handleVisibility);
  }, [running, phase]);

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);
`;

hook = hook.replace(
  /export function useFocusTimer\(\{ userId, commitments, setSessions \}\) \{/,
  'export function useFocusTimer({ userId, commitments, setSessions }) {\n' + antiDistractionLogic
);

fs.writeFileSync('src/lib/useFocusTimer.js', hook, 'utf8');
console.log("Injected Anti-Distraction!");
