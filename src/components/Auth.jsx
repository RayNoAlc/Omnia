import { useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { T, Card, PrimaryButton, GhostButton } from "./ui";

export default function Auth() {
  const [mode, setMode] = useState("entrar"); // "entrar" | "criar"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const inputStyle = {
    backgroundColor: T.surfaceAlt,
    border: `1px solid ${T.border}`,
    color: T.ink,
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo("Conta criada. Se a confirmação por e-mail estiver ativa no seu projeto, verifique sua caixa de entrada antes de entrar.");
      }
    } catch (err) {
      setError(err.message || "Não foi possível autenticar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4" style={{ background: `radial-gradient(1200px 600px at 15% -10%, #142723 0%, ${T.bg} 55%)`, color: T.ink }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src="/omnia.png" alt="Omnia" className="h-16 invert opacity-90 transition-opacity mb-4" />
          <p className="text-sm text-center" style={{ color: T.inkSoft }}>
            {mode === "entrar" ? "Organize, gamifique e masterize seus estudos." : "Sua nova vida acadêmica começa aqui."}
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs" style={{ color: T.inkSoft }}>E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md p-2 text-sm mt-1"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-xs" style={{ color: T.inkSoft }}>Senha</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md p-2 text-sm mt-1"
                style={inputStyle}
              />
            </div>

            {error && <p className="text-xs" style={{ color: T.critico }}>{error}</p>}
            {info && <p className="text-xs" style={{ color: T.brand }}>{info}</p>}

            <PrimaryButton className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {mode === "entrar" ? "Entrar" : "Criar conta"}
            </PrimaryButton>
          </form>
        </Card>

        <div className="mt-4 text-center">
          <GhostButton onClick={() => { setMode(mode === "entrar" ? "criar" : "entrar"); setError(null); setInfo(null); }}>
            {mode === "entrar" ? "Ainda não tenho conta" : "Já tenho conta"}
          </GhostButton>
        </div>
      </div>
    </div>
  );
}
