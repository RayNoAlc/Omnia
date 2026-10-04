import { useState, useEffect, useRef, useCallback } from "react";
import { todayISO } from "./utils";
import { addSession as dbAddSession } from "./db";
import { supabase } from "./supabaseClient";

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
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, []);

  const joinRoom = useCallback((id, host = false) => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    setRoomId(id);
    setIsHost(host);
    const channel = supabase.channel(`room_${id}`, { config: { broadcast: { ack: false } } });
    
    channel.on('broadcast', { event: 'focus_sync' }, ({ payload }) => {
      if (!host) {
        setPhase(payload.phase);
        setRunning(payload.running);
        setEndsAt(payload.endsAt);
        setPausedRemaining(payload.pausedRemaining);
        setCustomMin(payload.customMin);
        setPresetIdx(payload.presetIdx);
        setUseCustom(payload.useCustom);
      }
    }).subscribe();
    
    channelRef.current = channel;
  }, [setPhase, setRunning, setEndsAt, setPausedRemaining, setCustomMin, setPresetIdx, setUseCustom]);

  const leaveRoom = useCallback(() => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    channelRef.current = null;
    setRoomId(null);
    setIsHost(false);
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
    setPhase("work");
    const e = Date.now() + workSeconds * 1000;
    setEndsAt(e);
    setRunning(true);
    broadcast({ phase: "work", endsAt: e, running: true });
  }
  function pausar() {
    setPausedRemaining(Math.max(0, Math.round((endsAt - Date.now()) / 1000)));
    setRunning(false);
    setEndsAt(null);
  }
  function continuar() {
    const e = Date.now() + pausedRemaining * 1000;
    setEndsAt(e);
    setRunning(true);
    broadcast({ endsAt: e, running: true });
  }
  function reiniciarCiclo() {
    const base = phase === "rest" ? restSeconds : workSeconds;
    setRunning(false);
    setEndsAt(null);
    setPausedRemaining(base);
    setRemaining(base);
    setInterruptions(0);
  }
  function encerrar() {
    setRunning(false);
    setPhase("idle");
    setEndsAt(null);
    setRemaining(0);
    setPausedRemaining(0);
    setInterruptions(0);
    setCiclosConsecutivos(0);
    setUltimaSessao(null);
  }

  return {
    selectedId, setSelectedId, presetIdx, setPresetIdx, customMin, setCustomMin,
    useCustom, setUseCustom, phase, running, remaining, ciclosConsecutivos, ultimaSessao,
    selectedCommitment, workSeconds,
    iniciar, pausar, continuar, reiniciarCiclo, encerrar, roomId, isHost, joinRoom, leaveRoom, broadcast,
  };
}
