import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, Music, Sparkles, Sliders } from "lucide-react";
import { reactiveBgm } from "../lib/reactiveBgm";
import { sfx } from "../lib/soundEffects";
import { T, TINT } from "./ui";

export function ReactiveBgmWidget({ currentTab, className = "" }) {
  const [bgmState, setBgmState] = useState(() => reactiveBgm.getState());
  const [showVolume, setShowVolume] = useState(false);

  useEffect(() => {
    return reactiveBgm.subscribe((state) => {
      setBgmState({ ...state });
    });
  }, []);

  useEffect(() => {
    if (currentTab) {
      reactiveBgm.setTab(currentTab);
    }
  }, [currentTab]);

  const handleToggle = () => {
    sfx.click();
    reactiveBgm.toggle();
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    reactiveBgm.setVolume(val);
  };

  return (
    <div
      className={`rounded-xl border p-2.5 transition-all text-xs select-none ${className}`}
      style={{
        backgroundColor: bgmState.isPlaying ? (TINT.brand || T.surfaceAlt) : T.surfaceAlt,
        borderColor: bgmState.isPlaying ? T.brand : T.border,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Play/Pause Button with Animated Soundwave */}
        <button
          onClick={handleToggle}
          className="flex items-center gap-2 text-left focus:outline-none flex-1 min-w-0"
          title={bgmState.isPlaying ? "Pausar música ambiente" : "Iniciar música ambiente reativa"}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              backgroundColor: bgmState.isPlaying ? T.brand : "rgba(255,255,255,0.06)",
              color: bgmState.isPlaying ? T.brandInk : T.ink,
            }}
          >
            {bgmState.isPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 font-bold truncate text-[11px]" style={{ color: T.ink }}>
              <Music size={11} className={bgmState.isPlaying ? "text-emerald-400 animate-pulse" : "opacity-40"} />
              <span className="truncate">{bgmState.name}</span>
            </div>
            <div className="text-[10px] truncate" style={{ color: T.inkSoft }}>
              {bgmState.isPlaying ? "Reativo à aba" : "Música Ambiente"}
            </div>
          </div>
        </button>

        {/* Volume & Equalizer icon */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {bgmState.isPlaying && (
            <div className="flex items-end gap-0.5 h-3.5 px-1 mr-0.5">
              <span className="w-0.5 bg-emerald-400 rounded-full animate-bounce h-2" style={{ animationDuration: '0.8s' }} />
              <span className="w-0.5 bg-emerald-400 rounded-full animate-bounce h-3.5" style={{ animationDuration: '0.6s' }} />
              <span className="w-0.5 bg-emerald-400 rounded-full animate-bounce h-1.5" style={{ animationDuration: '1.1s' }} />
            </div>
          )}

          <button
            onClick={() => setShowVolume(!showVolume)}
            className="p-1 rounded-md hover:opacity-80 transition-opacity"
            style={{ color: T.inkSoft }}
            title="Ajustar volume"
          >
            {bgmState.volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      </div>

      {/* Expandable Volume Slider */}
      {showVolume && (
        <div className="mt-2.5 pt-2 border-t flex items-center gap-2 px-1" style={{ borderColor: T.border }}>
          <VolumeX size={12} style={{ color: T.inkSoft }} />
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={bgmState.volume}
            onChange={handleVolumeChange}
            className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-500"
            style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
          />
          <span className="text-[10px] font-mono font-medium w-7 text-right" style={{ color: T.inkSoft }}>
            {Math.round(bgmState.volume * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
