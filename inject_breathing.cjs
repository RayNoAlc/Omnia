const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const breathingHtml = `
export function BreathingModal({ onClose, T }) {
  const [phase, setPhase] = useState("Inspire");
  const [timeLeft, setTimeLeft] = useState(4);

  useEffect(() => {
    const phases = ["Inspire", "Segure", "Expire", "Segure (Vazio)"];
    let currentIdx = phases.indexOf(phase);
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          currentIdx = (currentIdx + 1) % 4;
          setPhase(phases[currentIdx]);
          return 4;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const scale = phase === "Inspire" ? "scale-150" : phase === "Expire" ? "scale-100" : phase === "Segure" ? "scale-150" : "scale-100";
  const opacity = phase === "Inspire" ? "opacity-100" : phase === "Expire" ? "opacity-60" : "opacity-80";

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 transition-all duration-1000" style={{ backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}>
      <div className="w-full max-w-md flex flex-col items-center justify-center p-8 rounded-2xl relative overflow-hidden" style={{ backgroundColor: T.surface, border: \`1px solid \${T.border}\` }}>
        <h2 className="text-2xl font-bold mb-12 text-center" style={{ color: T.ink }}>Box Breathing</h2>
        
        <div className="relative flex items-center justify-center w-48 h-48 mb-12">
          <div className={\`absolute inset-0 rounded-full transition-all duration-1000 ease-in-out \${scale} \${opacity}\`} style={{ backgroundColor: T.brand + '44' }}></div>
          <div className={\`absolute inset-4 rounded-full transition-all duration-1000 ease-in-out \${scale} \${opacity}\`} style={{ backgroundColor: T.brand + '88' }}></div>
          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full rounded-full shadow-lg" style={{ backgroundColor: T.brand, color: T.brandInk }}>
            <span className="text-2xl font-bold uppercase tracking-widest">{phase}</span>
            <span className="text-4xl font-mono mt-2">{timeLeft}s</span>
          </div>
        </div>

        <p className="text-center text-sm mb-8" style={{ color: T.inkSoft }}>Uma técnica militar para acalmar a ansiedade antes de provas. Foco na respiração.</p>
        <PrimaryButton onClick={onClose} className="w-full">Voltar aos Estudos</PrimaryButton>
      </div>
    </div>
  );
}
`;

tabs = tabs.replace(
  /export function MapaMentalModal/,
  breathingHtml + '\n\nexport function MapaMentalModal'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Breathing Modal!");
