import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Settings, Info, Headphones } from 'lucide-react';
import { horrorAudio } from '../audio/horrorAudio';

interface MainMenuProps {
  onStartNewGame: () => void;
  onContinueGame: () => void;
  hasSavedGame: boolean;
  onOpenSettings: () => void;
  onOpenCredits: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartNewGame,
  onContinueGame,
  hasSavedGame,
  onOpenSettings,
  onOpenCredits,
}) => {
  const [womanVisible, setWomanVisible] = useState(true);
  const [lightningFlash, setLightningFlash] = useState(false);
  const [clockTime, setClockTime] = useState('03:17:02 AM');

  // Eerie hallway creature vanishing mechanic & digital clock
  useEffect(() => {
    horrorAudio.startAmbientDrone(0.4);

    const interval = setInterval(() => {
      // Periodic lightning flash
      setLightningFlash(true);
      horrorAudio.playScratching();
      setTimeout(() => setLightningFlash(false), 120);

      // Randomly hide or show silhouette of the woman
      setWomanVisible((prev) => !prev);
    }, 4500);

    const clockInterval = setInterval(() => {
      const now = new Date();
      const secs = String(now.getSeconds()).padStart(2, '0');
      setClockTime(`03:17:${secs} AM`);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(clockInterval);
    };
  }, []);

  return (
    <div id="main-menu" className="relative w-full h-full flex flex-col justify-between p-6 bg-[#050505] text-[#d1d1d1] font-mono select-none overflow-hidden">
      {/* Heavy Cinematic Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-40"
        style={{
          background: 'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 70%, rgba(5,5,5,1) 100%)',
        }}
      />

      {/* Analog Surveillance Noise Filter */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none noise-overlay z-50 animate-film-grain" />

      {/* Dynamic Lightning Flash Overlay */}
      {lightningFlash && (
        <div className="absolute inset-0 bg-neutral-200/15 mix-blend-screen pointer-events-none z-30" />
      )}

      {/* Viewfinder Corner Reticles */}
      <div className="absolute top-6 left-6 w-16 h-16 border-t border-l border-neutral-800 opacity-40 pointer-events-none z-40" />
      <div className="absolute top-6 right-6 w-16 h-16 border-t border-r border-neutral-800 opacity-40 pointer-events-none z-40" />
      <div className="absolute bottom-6 left-6 w-16 h-16 border-b border-l border-neutral-800 opacity-40 pointer-events-none z-40" />
      <div className="absolute bottom-6 right-6 w-16 h-16 border-b border-r border-neutral-800 opacity-40 pointer-events-none z-40" />

      {/* Faint Background Watermarks */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full z-0 opacity-[0.04] pointer-events-none overflow-hidden">
        <div className="absolute top-[12%] left-[10%] text-[180px] leading-none text-red-950 font-serif rotate-12 select-none">
          REMEMBERS
        </div>
        <div className="absolute bottom-[18%] right-[8%] text-[140px] leading-none text-red-950 font-serif -rotate-6 select-none">
          626
        </div>
        <div className="absolute top-1/2 right-1/4 w-[350px] h-[500px] bg-gradient-to-t from-red-950 to-transparent blur-3xl rounded-full opacity-30" />
      </div>

      {/* Hallway Cinematic Canvas Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(35,10,10,0.35)_0%,rgba(5,5,5,0.92)_70%,rgba(5,5,5,1)_100%)]" />

        {/* Hallway walls perspective lines */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to bottom right, transparent 48%, rgba(255,255,255,0.15) 50%, transparent 52%),
              linear-gradient(to bottom left, transparent 48%, rgba(255,255,255,0.15) 50%, transparent 52%)
            `,
            backgroundSize: '100% 100%',
          }}
        />

        {/* The Woman in the Walls silhouette */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-opacity duration-1000 ${
            womanVisible ? 'opacity-80' : 'opacity-0'
          }`}
        >
          <div className="w-10 h-12 bg-neutral-900 rounded-full border border-neutral-800 shadow-[0_0_20px_rgba(255,255,255,0.08)] relative">
            <div className="absolute top-5 left-2 w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_8px_red] animate-pulse" />
            <div className="absolute top-5 right-2 w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_8px_red] animate-pulse" />
          </div>
          <div className="w-16 h-36 bg-gradient-to-b from-neutral-900 to-[#050505] rounded-b-2xl border-t border-neutral-800 opacity-90" />
        </div>

        {/* Scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-30 pointer-events-none" />
      </div>

      {/* TOP BAR: Surveillance Status & Telemetry */}
      <div className="relative z-30 flex justify-between items-start w-full px-2 pt-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)] animate-pulse" />
            <span className="text-xs font-bold tracking-[0.25em] text-red-600 uppercase font-mono">
              RECORDING • CAM-01
            </span>
          </div>
          <span className="text-[10px] tracking-wider text-neutral-500 uppercase font-mono">
            Blackwood Mansion • Corridor Wing 626
          </span>
        </div>

        {/* Headphone Experience Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#080808]/90 border border-neutral-800 text-neutral-400 text-xs shadow-lg backdrop-blur-md">
          <Headphones className="w-3.5 h-3.5 text-red-500" />
          <span className="font-serif italic tracking-wide text-[11px]">
            Dark room & headphones recommended
          </span>
        </div>

        <div className="text-right font-mono">
          <div className="text-base sm:text-lg font-bold tracking-widest text-neutral-300">
            {clockTime}
          </div>
          <div className="text-[10px] text-red-500/70 uppercase tracking-wider animate-pulse">
            SIGNAL: UNSTABLE
          </div>
        </div>
      </div>

      {/* Horizontal Film Divider Lines */}
      <div className="absolute w-full h-[1px] bg-red-950/20 top-1/4 left-0 pointer-events-none z-20" />
      <div className="absolute w-full h-[1px] bg-red-950/20 bottom-1/4 left-0 pointer-events-none z-20" />

      {/* CENTER: High-Impact Typography & Action Menu */}
      <div className="relative z-30 flex flex-col items-center justify-center my-auto text-center px-4">
        {/* Artistic Layered Display Title */}
        <div className="relative group mb-3">
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black leading-none tracking-[-0.03em] text-transparent bg-clip-text bg-gradient-to-b from-neutral-200 via-neutral-500 to-neutral-800 filter blur-[0.3px] relative z-20 font-['Cinzel'] uppercase">
            THE HOUSE
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-500 via-red-700 to-red-950">
              REMEMBERS
            </span>
          </h1>

          {/* Ghost Layer Behind */}
          <div className="absolute -top-1 -left-1 text-4xl sm:text-6xl md:text-8xl font-black leading-none tracking-[-0.03em] text-red-900/10 -z-10 translate-x-1 translate-y-1 font-['Cinzel'] uppercase select-none">
            THE HOUSE
            <br />
            REMEMBERS
          </div>
        </div>

        <p className="text-xs sm:text-sm text-neutral-400 font-serif italic max-w-md mb-8 tracking-wide">
          "The mansion was thought to be empty... but it remembers every soul who ever entered."
        </p>

        {/* Minimalist Brutalist Buttons */}
        <div className="flex flex-col items-center gap-3 w-full max-w-xs sm:max-w-sm">
          {/* New Game Button */}
          <button
            id="btn-new-game"
            onClick={onStartNewGame}
            className="group relative w-full px-8 py-3.5 bg-[#080808]/90 border border-neutral-800 hover:border-red-900 transition-all flex items-center justify-center active:scale-95 shadow-xl"
          >
            <span className="text-sm sm:text-base tracking-[0.35em] font-light text-neutral-200 group-hover:text-red-500 transition-colors uppercase font-mono flex items-center gap-2">
              <Play className="w-3.5 h-3.5 text-red-500 fill-red-500" />
              <span>ENTER THE HOUSE</span>
            </span>
            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Continue Game Button */}
          {hasSavedGame && (
            <button
              id="btn-continue-game"
              onClick={onContinueGame}
              className="group relative w-full px-8 py-3 bg-[#080808]/70 border border-neutral-900 hover:border-neutral-700 transition-all flex items-center justify-center active:scale-95"
            >
              <span className="text-xs sm:text-sm tracking-[0.35em] font-light text-neutral-400 group-hover:text-neutral-200 transition-colors uppercase font-mono flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5 text-neutral-500 group-hover:text-amber-400" />
                <span>RESUME MEMORY</span>
              </span>
              <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}

          {/* Settings & Credits Grid */}
          <div className="grid grid-cols-2 gap-3 w-full mt-1">
            <button
              id="btn-settings"
              onClick={onOpenSettings}
              className="group relative py-2.5 px-4 bg-[#080808]/70 border border-neutral-900 hover:border-neutral-700 transition-all flex items-center justify-center gap-2"
            >
              <Settings className="w-3 h-3 text-neutral-500 group-hover:text-neutral-300" />
              <span className="text-[11px] tracking-[0.25em] font-light text-neutral-400 group-hover:text-neutral-200 font-mono uppercase">
                SETTINGS
              </span>
            </button>

            <button
              id="btn-credits"
              onClick={onOpenCredits}
              className="group relative py-2.5 px-4 bg-[#080808]/70 border border-neutral-900 hover:border-neutral-700 transition-all flex items-center justify-center gap-2"
            >
              <Info className="w-3 h-3 text-neutral-500 group-hover:text-neutral-300" />
              <span className="text-[11px] tracking-[0.25em] font-light text-neutral-400 group-hover:text-neutral-200 font-mono uppercase">
                RECORDS
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM: Sanity Bar & Surveillance Telemetry */}
      <div className="relative z-30 w-full flex flex-col sm:flex-row items-end justify-between gap-4 px-2 pb-2">
        {/* Telemetry & Sanity Monitor */}
        <div className="flex flex-col gap-2 w-full sm:w-72 font-mono">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-neutral-400">
            <span>Sanity Monitor</span>
            <span className="text-red-500 font-bold animate-pulse">Critical</span>
          </div>

          <div className="h-[2px] w-full bg-neutral-900 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-1/4 bg-red-700 shadow-[0_0_8px_rgba(185,28,28,0.7)]" />
          </div>

          <div className="flex gap-4 text-[10px] text-neutral-600">
            <span>FPS: 60</span>
            <span>LATENCY: 14MS</span>
            <span>BPM: 132</span>
          </div>
        </div>

        {/* Sinister Cryptic Quote */}
        <div className="text-[11px] tracking-tight text-neutral-500 italic font-serif max-w-xs text-right opacity-70">
          "The door only opens when you stop looking at it."
        </div>
      </div>
    </div>
  );
};

