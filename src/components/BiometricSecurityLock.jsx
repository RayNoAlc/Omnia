import React, { useState, useEffect } from "react";
import { Lock, Fingerprint, KeyRound, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { authenticateBiometrics, verifySecurityPin, isBiometricsAvailable } from "../lib/biometrics";
import { sfx } from "../lib/soundEffects";

export function BiometricSecurityLock({ onUnlock, T }) {
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [pinMode, setPinMode] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    isBiometricsAvailable().then(setHasBiometrics);
  }, []);

  const handleBiometricAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const ok = await authenticateBiometrics();
      if (ok) {
        sfx.complete?.();
        onUnlock();
      } else {
        setError("Autenticação não reconhecida. Tente novamente ou use o PIN.");
      }
    } catch (err) {
      console.warn("Erro biometria:", err);
      setError("Biometria cancelada ou não configurada. Use seu PIN.");
      setPinMode(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = (e) => {
    e?.preventDefault();
    if (verifySecurityPin(pinInput)) {
      sfx.complete?.();
      onUnlock();
    } else {
      sfx.bump?.() || sfx.click?.();
      setError("PIN incorreto. Tente novamente.");
      setPinInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-sm p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/90 text-center shadow-2xl flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4 text-blue-400">
          <Fingerprint size={36} className="animate-pulse" />
        </div>

        <h3 className="text-xl font-bold text-white mb-1">Omnia Seguro</h3>
        <p className="text-xs text-slate-400 mb-6">
          Seus estudos e anotações estão protegidos por biometria.
        </p>

        {error && (
          <div className="w-full p-2.5 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 text-left">
            <AlertCircle size={14} className="shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {!pinMode ? (
          <div className="w-full space-y-3">
            <button
              type="button"
              disabled={loading}
              onClick={handleBiometricAuth}
              className="w-full py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <Fingerprint size={18} />
                  <span>Desbloquear com Biometria</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => { sfx.click?.(); setPinMode(true); setError(null); }}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <KeyRound size={14} />
              <span>Usar PIN de Segurança</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handlePinSubmit} className="w-full space-y-3">
            <input
              type="password"
              maxLength={8}
              autoFocus
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Digite seu PIN (Ex: 1234)"
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-center text-lg font-mono tracking-widest outline-none focus:border-blue-500 transition-colors"
            />

            <button
              type="submit"
              disabled={!pinInput}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <ShieldCheck size={15} />
              <span>Desbloquear</span>
            </button>

            {hasBiometrics && (
              <button
                type="button"
                onClick={() => { sfx.click?.(); setPinMode(false); setError(null); }}
                className="w-full text-xs text-slate-400 hover:text-white transition-colors"
              >
                Voltar para Biometria
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
