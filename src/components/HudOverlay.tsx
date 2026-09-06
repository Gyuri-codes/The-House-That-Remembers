import React, { useState, useEffect } from 'react';
import { Pause } from 'lucide-react';
import { GameArea } from '../types';
import { AREA_METADATA } from '../data/gameContent';

interface HudOverlayProps {
  currentArea: GameArea;
  lookTarget: { id: string; prompt: string; label: string } | null;
  subtitle: string | null;
  isJumpscare: boolean;
  jumpscareType?: string;
  isMobile: boolean;
  onOpenPause: () => void;
  reducedFlashing: boolean;
  activeHorrorEvent: string | null;
}

export const HudOverlay: React.FC<HudOverlayProps> = ({
  currentArea,
  lookTarget,
  subtitle,
  isJumpscare,
  isMobile,
  onOpenPause,
  reducedFlashing,
  activeHorrorEvent,
}) => {
  const meta = AREA_METADATA[currentArea as keyof typeof AREA_METADATA];
  const [clockTime, setClockTime] = useState('03:17:12 AM');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const secs = String(now.getSeconds()).padStart(2, '0');
      setClockTime(`03:17:${secs} AM`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="hud-overlay" className="absolute inset-0 pointer-events-none select-none z-20 overflow-hidden font-mono">
      {/* Heavy Cinematic Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.75) 75%, rgba(5,5,5,0.98) 100%)',
        }}
      />

      {/* Analog Surveillance Noise Filter */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none noise-overlay z-20 animate-film-grain" />

      {/* Subtle Analog Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] opacity-25 pointer-events-none z-10" />

      {/* Viewfinder Corner Reticles */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t border-l border-neutral-800 opacity-40 pointer-events-none z-20" />
      <div className="absolute top-4 right-4 w-12 h-12 border-t border-r border-neutral-800 opacity-40 pointer-events-none z-20" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b border-l border-neutral-800 opacity-40 pointer-events-none z-20" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b border-r border-neutral-800 opacity-40 pointer-events-none z-20" />

      {/* Horizontal Subtle Dividing Rules */}
      <div className="absolute w-full h-[1px] bg-red-950/15 top-1/4 left-0 pointer-events-none z-10" />
      <div className="absolute w-full h-[1px] bg-red-950/15 bottom-1/4 left-0 pointer-events-none z-10" />

      {/* Top Left Area & Surveillance Status */}
      <div className="absolute top-5 left-6 pointer-events-auto flex items-center gap-3 z-30">
        <button
          id="btn-pause-menu"
          onClick={onOpenPause}
          className="p-2 bg-[#080808]/90 border border-neutral-800 hover:border-red-900 text-neutral-400 hover:text-red-500 transition-colors shadow-lg active:scale-95"
          title="Pause Menu [Esc]"
        >
          <Pause className="w-3.5 h-3.5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)] animate-pulse" />
            <span className="text-[11px] font-bold tracking-[0.25em] text-red-600 uppercase font-mono">
              REC • LIVE FEED
            </span>
          </div>
          {meta && (
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xs uppercase tracking-[0.2em] text-neutral-200 font-bold font-['Cinzel']">
                {meta.name}
              </span>
              <span className="text-[10px] tracking-wider text-neutral-500 uppercase">
                // {meta.subTitle}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Top Right Live Telemetry */}
      <div className="absolute top-5 right-6 text-right pointer-events-none z-30 font-mono hidden sm:block">
        <div className="text-sm font-bold tracking-widest text-neutral-300">
          {clockTime}
        </div>
        <div className="text-[10px] text-red-500/70 uppercase tracking-widest animate-pulse">
          SIGNAL: UNSTABLE
        </div>
      </div>

      {/* Center Reticle / Tactical Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className="relative flex items-center justify-center">
          {lookTarget ? (
            <div className="relative flex items-center justify-center">
              {/* Target lock box */}
              <div className="w-6 h-6 border border-red-500/80 bg-red-950/20 rotate-45 scale-110 transition-transform shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
              <div className="absolute w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
            </div>
          ) : (
            <div className="w-1.5 h-1.5 bg-neutral-400/50 rounded-full" />
          )}
        </div>
      </div>

      {/* Contextual Interaction Prompt */}
      {lookTarget && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center gap-1.5 z-30 animate-fade-in">
          <div className="group relative px-6 py-2.5 bg-[#080808]/95 border border-red-900/80 shadow-[0_0_20px_rgba(153,27,27,0.4)] backdrop-blur-md flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-red-950 border border-red-600 text-red-300 text-[11px] font-bold font-mono">
              {isMobile ? 'TAP' : 'E'}
            </span>
            <span className="text-xs font-semibold tracking-[0.25em] text-neutral-200 uppercase font-mono">
              {lookTarget.prompt}
            </span>
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-red-600" />
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-red-600" />
          </div>
          <span className="text-[10px] text-neutral-400 tracking-widest font-mono uppercase">
            // {lookTarget.label}
          </span>
        </div>
      )}

      {/* Subtitles Overlay */}
      {subtitle && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 max-w-xl w-11/12 text-center pointer-events-none z-30">
          <div className="inline-block px-5 py-2.5 bg-black/90 border border-neutral-800 text-neutral-200 text-xs sm:text-sm italic tracking-wide backdrop-blur shadow-2xl font-serif">
            "{subtitle}"
          </div>
        </div>
      )}

      {/* Bottom Subtle Sanity Indicator */}
      <div className="absolute bottom-5 left-6 flex flex-col gap-1 w-44 pointer-events-none z-30 font-mono hidden sm:flex">
        <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-neutral-500">
          <span>Sanity Index</span>
          <span className="text-red-500 font-bold">Unstable</span>
        </div>
        <div className="h-[2px] w-full bg-neutral-900 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1/3 bg-red-700 shadow-[0_0_8px_rgba(185,28,28,0.7)]" />
        </div>
      </div>

      {/* Sudden Horror Event Visual Distortions */}
      {activeHorrorEvent === 'creature_peeking' && (
        <div className="absolute inset-0 bg-red-950/25 mix-blend-color-burn pointer-events-none animate-pulse z-40" />
      )}

      {activeHorrorEvent === 'whisper' && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(100,0,0,0.2)_100%)] pointer-events-none z-40" />
      )}

      {/* Fullscreen Jumpscare Overlay */}
      {isJumpscare && (
        <div
          className={`absolute inset-0 flex items-center justify-center z-50 pointer-events-none overflow-hidden ${
            reducedFlashing ? 'bg-red-950/90' : 'bg-black animate-ping'
          }`}
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
            <div className="w-80 h-96 max-w-full rounded-full border-4 border-red-950 bg-gradient-to-b from-neutral-950 via-neutral-900 to-black shadow-[0_0_120px_rgba(255,0,0,0.9)] flex flex-col items-center justify-center p-6 relative">
              <div className="flex gap-16 mb-8">
                <div className="w-12 h-14 bg-black rounded-full shadow-[inset_0_0_20px_#990000] border-2 border-red-700 animate-pulse flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                </div>
                <div className="w-12 h-14 bg-black rounded-full shadow-[inset_0_0_20px_#990000] border-2 border-red-700 animate-pulse flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                </div>
              </div>
              <div className="w-24 h-28 bg-black rounded-b-3xl border-2 border-red-900 shadow-[inset_0_0_25px_#660000] flex flex-col justify-end p-2">
                <div className="w-full h-2 bg-red-900/60 rounded" />
              </div>
              <div className="absolute -bottom-8 font-['Special_Elite'] text-red-600 text-3xl font-bold tracking-[0.3em] uppercase drop-shadow-[0_0_15px_rgba(255,0,0,1)]">
                SHE REMEMBERS
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

