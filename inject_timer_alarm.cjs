const fs = require('fs');
let code = fs.readFileSync('src/lib/useFocusTimer.js', 'utf8');

const soundInjection = `
  const handlePhaseEnd = useCallback(async () => {
    // Play a gentle ding sound
    try {
      const audio = new Audio("https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3");
      audio.volume = 0.6;
      audio.play();
    } catch(e) {}
    
    // Send OS notification
    if (Notification.permission === "granted") {
      new Notification(phase === "work" ? "Foco Concluído!" : "Pausa Concluída!", {
        body: phase === "work" ? "Hora de descansar." : "De volta ao foco!",
        icon: "/favicon.ico"
      });
    }

    if (phase === "work") {
`;

code = code.replace(
  /const handlePhaseEnd = useCallback\(async \(\) => \{\s*if \(phase === "work"\) \{/,
  soundInjection
);

fs.writeFileSync('src/lib/useFocusTimer.js', code, 'utf8');
console.log("Injected Pomodoro alarm sound and notification!");
