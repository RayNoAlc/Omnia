import { useState, useEffect, useRef, useCallback } from "react";
import { todayISO } from "./utils";
import { addSession as dbAddSession } from "./db";
import { supabase } from "./supabaseClient";
import { sfx } from "./soundEffects";

export const PRESETS = [
  { label: "25 / 5", work: 25 * 60, rest: 5 * 60 },
  { label: "50 / 10", work: 50 * 60, rest: 10 * 60 },
  { label: "90 / 20", work: 90 * 60, rest: 20 * 60 },
];

/**
 * Estado do Modo Foco mantido no App (não dentro da aba), para que o
 * timer continue correndo quando o usuário navega para outra aba.
 *
 * Usa horário-alvo absoluto (endsAt) em vez de decrementar um contador:
 * isso evita que o cronômetro "atrase" quando o navegador reduz a
 * frequência dos timers em abas em segundo plano.
 */
export function useFocusTimer({ userId, commitments, setSessions }) {
  const [selectedId, setSelectedId] = useState("livre");
  const [presetIdx, setPresetIdx] = useState(0);
  const [customMin, setCustomMin] = useState(30);
  const [useCustom, setUseCustom] = useState(false);
  const [phase, setPhase] = useState("idle"); // "idle" | "work" | "rest"
  const [running, setRunning] = useState(false);
  const [endsAt, setEndsAt] = useState(null); // timestamp em ms
  const [pausedRemaining, setPausedRemaining] = useState(0); // segundos restantes quando pausado
  const [remaining, setRemaining] = useState(0);
  const [interruptions, setInterruptions] = useState(0);
  const [ciclosConsecutivos, setCiclosConsecutivos] = useState(0);
  const [ultimaSessao, setUltimaSessao] = useState(null);
  const phaseEndHandled = useRef(false);
  const [roomId, setRoomId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const channelRef = useRef(null);


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

  

  useEffect(() => {
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, []);

  const [members, setMembers] = useState([]);
  const stateRef = useRef({});
  stateRef.current = { phase, running, endsAt, pausedRemaining, customMin, presetIdx, useCustom };

  const joinRoom = useCallback((id, host = false, userInfo = {}) => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    const cleanId = String(id || '').trim().toUpperCase();
    if (!cleanId) return;

    setRoomId(cleanId);
    setIsHost(host);
    const channel = supabase.channel(`room_${cleanId}`, {
      config: {
        broadcast: { ack: false },
        presence: { key: userInfo.id || Math.random().toString(36).slice(2) }
      }
    });
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const list = [];
        Object.values(presenceState).forEach((presences) => {
          presences.forEach((p) => list.push(p));
        });
        setMembers(list);
      })
      .on('broadcast', { event: 'focus_sync' }, ({ payload }) => {
        if (!host && payload) {
          if (payload.phase !== undefined) setPhase(payload.phase);
          if (payload.running !== undefined) setRunning(payload.running);
          if (payload.endsAt !== undefined) setEndsAt(payload.endsAt);
          if (payload.pausedRemaining !== undefined) setPausedRemaining(payload.pausedRemaining);
          if (payload.customMin !== undefined) setCustomMin(payload.customMin);
          if (payload.presetIdx !== undefined) setPresetIdx(payload.presetIdx);
          if (payload.useCustom !== undefined) setUseCustom(payload.useCustom);
        }
      })
      .on('broadcast', { event: 'request_sync' }, () => {
        if (host && channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'focus_sync',
            payload: stateRef.current,
          });
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            name: userInfo.name || (host ? 'Anfitrião' : 'Colega'),
            skin: userInfo.skin || 'none',
            isHost: host,
            joinedAt: new Date().toISOString(),
          });
          if (!host) {
            channel.send({
              type: 'broadcast',
              event: 'request_sync',
              payload: {},
            });
          }
        }
      });
    
    channelRef.current = channel;
  }, [setPhase, setRunning, setEndsAt, setPausedRemaining, setCustomMin, setPresetIdx, setUseCustom]);

  const leaveRoom = useCallback(() => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    channelRef.current = null;
    setRoomId(null);
    setIsHost(false);
    setMembers([]);
  }, []);

  const broadcast = useCallback((newState) => {
    if (channelRef.current && isHost) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'focus_sync',
        payload: {
          phase, running, endsAt, pausedRemaining, customMin, presetIdx, useCustom,
          ...newState
        }
      });
    }
  }, [isHost, phase, running, endsAt, pausedRemaining, customMin, presetIdx, useCustom]);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('OmniaFocusStatus', { detail: { running: running && phase === 'work' } }));
      document.body.setAttribute('data-omnia-focus', running && phase === 'work' ? 'true' : 'false');
    }
  }, [running, phase]);


  const selectedCommitment = selectedId === "livre" ? null : commitments.find((c) => c.id === selectedId) || null;
  const disciplinaSessao = selectedCommitment ? selectedCommitment.disciplina : "Livre";
  const workSeconds = useCustom ? customMin * 60 : PRESETS[presetIdx].work;
  const restSeconds = useCustom ? 5 * 60 : PRESETS[presetIdx].rest;

  
  const handlePhaseEnd = useCallback(async () => {
    // Tocar sino de conclusão harmônico e relaxante
    sfx.timerFinish();
    
    // Send OS notification
    if (Notification.permission === "granted") {
      new Notification(phase === "work" ? "Foco Concluído!" : "Pausa Concluída!", {
        body: phase === "work" ? "Hora de descansar." : "De volta ao foco!",
        icon: "/favicon.ico"
      });
    }

    if (phase === "work") {

      const minutosSessao = Math.round(workSeconds / 60);
      try {
        const saved = await dbAddSession(userId, {
          disciplina: disciplinaSessao,
          commitmentId: selectedCommitment?.id || null,
          minutos: minutosSessao,
          duracaoPresetMin: minutosSessao,
          interrupcoes: interruptions,
          date: todayISO(),
        });
        setSessions((prev) => [saved, ...prev]);
      } catch {
        // falha ao salvar não deve travar a transição para a pausa
      }
      setInterruptions(0);
      setCiclosConsecutivos((n) => n + 1);
      setUltimaSessao({ disciplina: disciplinaSessao, minutos: minutosSessao });

      // Recompensa de Moedas de Estudo por foco concluído
      try {
        const rawCfg = localStorage.getItem("omnia_config");
        const cfg = rawCfg ? JSON.parse(rawCfg) : {};
        const coinsEarned = 25;
        const currentCoins = typeof cfg.coins === "number" ? cfg.coins : 350;
        cfg.coins = currentCoins + coinsEarned;
        localStorage.setItem("omnia_config", JSON.stringify(cfg));
        window.dispatchEvent(new Event("storage"));
      } catch (err) {
        console.warn("Erro ao creditar moedas:", err);
      }

      setPhase("rest");
      setEndsAt(Date.now() + restSeconds * 1000);
      setRemaining(restSeconds);
    } else {
      setPhase("idle");
      setRunning(false);
      setEndsAt(null);
      setRemaining(0);
    }
  }, [phase, workSeconds, restSeconds, userId, disciplinaSessao, selectedCommitment, interruptions, setSessions]);

  useEffect(() => {
    if (!running || !endsAt) return;
    phaseEndHandled.current = false;

    function tick() {
      const restante = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
      setRemaining(restante);
      if (restante === 0 && !phaseEndHandled.current) {
        phaseEndHandled.current = true;
        handlePhaseEnd();
      }
    }
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [running, endsAt, handlePhaseEnd]);

  function iniciar() {
    sfx.timerStart();
    setPhase("work");
    const e = Date.now() + workSeconds * 1000;
    setEndsAt(e);
    setRunning(true);
    broadcast({ phase: "work", endsAt: e, running: true });
  }
  function pausar() {
    sfx.timerPause();
    const rem = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
    setPausedRemaining(rem);
    setRunning(false);
    setEndsAt(null);
    broadcast({ running: false, endsAt: null, pausedRemaining: rem });
  }
  function continuar() {
    sfx.timerStart();
    const e = Date.now() + pausedRemaining * 1000;
    setEndsAt(e);
    setRunning(true);
    broadcast({ endsAt: e, running: true, phase });
  }
  function reiniciarCiclo() {
    sfx.click();
    const base = phase === "rest" ? restSeconds : workSeconds;
    setRunning(false);
    setEndsAt(null);
    setPausedRemaining(base);
    setRemaining(base);
    setInterruptions(0);
    broadcast({ running: false, endsAt: null, pausedRemaining: base, remaining: base, phase });
  }
  function encerrar() {
    sfx.click();
    setRunning(false);
    setPhase("idle");
    setEndsAt(null);
    setRemaining(0);
    setPausedRemaining(0);
    setInterruptions(0);
    setCiclosConsecutivos(0);
    setUltimaSessao(null);
    broadcast({ running: false, phase: "idle", endsAt: null, remaining: 0, pausedRemaining: 0 });
  }

  return {
    selectedId, setSelectedId, presetIdx, setPresetIdx, customMin, setCustomMin,
    useCustom, setUseCustom, phase, running, remaining, ciclosConsecutivos, ultimaSessao,
    selectedCommitment, workSeconds,
    iniciar, pausar, continuar, reiniciarCiclo, encerrar, roomId, isHost, joinRoom, leaveRoom, broadcast, members,
  };
}
