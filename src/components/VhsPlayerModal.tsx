import React, { useState, useEffect } from 'react';
import { horrorAudio } from '../audio/horrorAudio';

interface VhsPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  reducedFlashing: boolean;
}

export const VhsPlayerModal: React.FC<VhsPlayerModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [stage, setStage] = useState<number>(0);
  const [whisperPrompt, setWhisperPrompt] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStage(0);
      setWhisperPrompt(false);
      return;
    }

    const stopStatic = horrorAudio.playVhsStatic(15000);

    // Timed progression of terrifying analog footage
    const t1 = setTimeout(() => setStage(1), 1800);
    const t2 = setTimeout(() => setStage(2), 4200);
    const t3 = setTimeout(() => setStage(3), 7000);
    const t4 = setTimeout(() => setStage(4), 9800);
    const t5 = setTimeout(() => {
      setStage(5);
      stopStatic();
      horrorAudio.playWhisper('behind_you');
      setWhisperPrompt(true);
    }, 12500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      stopStatic();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTurnAround = () => {
    horrorAudio.playJumpscareStinger();
    onComplete();
  };

  return (
    <div id="vhs-player-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-in font-mono">
      {/* Heavy Vignette & Noise Filter */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 75%, rgba(5,5,5,1) 100%)',
        }}
      />
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none noise-overlay z-20 animate-film-grain" />

      {/* CRT Television Casing */}
      <div className="relative z-30 w-full max-w-3xl aspect-[4/3] bg-[#080808] border border-neutral-800 shadow-[0_0_80px_rgba(0,0,0,1)] p-4 flex flex-col justify-between overflow-hidden">
        {/* Viewfinder Corner Reticles */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t border-l border-neutral-700 opacity-40 pointer-events-none z-30" />
        <div className="absolute top-2 right-2 w-8 h-8 border-t border-r border-neutral-700 opacity-40 pointer-events-none z-30" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b border-l border-neutral-700 opacity-40 pointer-events-none z-30" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b border-r border-neutral-700 opacity-40 pointer-events-none z-30" />

        {/* CRT Screen Frame */}
        <div className="relative flex-1 bg-[#050505] overflow-hidden border border-neutral-800/80 shadow-[inset_0_0_60px_rgba(0,0,0,0.95)] flex items-center justify-center">
          {/* CRT Scanline Effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.6)_50%)] bg-[length:100%_4px] pointer-events-none z-20 opacity-70" />

          {/* Analog Glow & Curvature */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(80,20,20,0.12)_0%,rgba(0,0,0,0.9)_100%)] pointer-events-none z-20" />

          {/* VCR Header OSD */}
          <div className="absolute top-4 left-6 z-30 font-mono text-xs tracking-[0.25em] flex items-center gap-4 text-neutral-300 uppercase">
            <span className="flex items-center gap-1.5 text-red-500 font-bold">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              PLAY
            </span>
            <span className="text-neutral-500">SP 0:14:32</span>
            <span className="text-neutral-500">SEP. 17 1989</span>
          </div>

          {/* Footage Stages */}
          {stage === 0 && (
            <div className="flex flex-col items-center justify-center text-center p-6 z-10 animate-pulse">
              <span className="font-['Cinzel'] text-neutral-200 text-xl tracking-wider mb-2">
                SYNCHRONIZING MAGNETIC TAPE...
              </span>
              <span className="text-[10px] text-red-500 font-mono tracking-widest uppercase">
                BLACKWOOD ESTATE SURVEILLANCE FEED 04
              </span>
            </div>
          )}

          {stage === 1 && (
            <div className="z-10 text-center p-6 max-w-md">
              <p className="font-serif italic text-neutral-300 text-sm sm:text-base leading-relaxed tracking-wider mb-2">
                "They told us the children wandered into the woods... but we can still hear them beneath the floorboards."
              </p>
              <div className="text-[10px] font-mono text-red-500 tracking-widest uppercase">
                [Audio: Faint muffled nursery weeping]
              </div>
            </div>
          )}

          {stage === 2 && (
            <div className="z-10 text-center p-6 max-w-lg">
              <div className="w-64 h-32 mx-auto bg-[#080808] border border-neutral-800 mb-3 flex items-center justify-center relative overflow-hidden">
                {/* Vintage static silhouettes */}
                <div className="flex gap-4 opacity-60">
                  <div className="w-5 h-18 bg-neutral-400" />
                  <div className="w-4 h-14 bg-neutral-400" />
                  <div className="w-5 h-16 bg-neutral-400" />
                  <div className="w-3 h-12 bg-neutral-400" />
                </div>
                <div className="absolute inset-0 bg-red-950/40 mix-blend-overlay" />
              </div>
              <p className="font-serif italic text-neutral-300 text-xs sm:text-sm leading-relaxed">
                "Thomas. Clara. Oliver. Evelyn. Their eyes were bound with black thread."
              </p>
            </div>
          )}

          {stage === 3 && (
            <div className="z-10 text-center p-6 max-w-md">
              <p className="font-['Cinzel'] text-red-400 text-base mb-2 font-bold tracking-widest animate-pulse">
                "DO NOT ENTER THE SUBTERRANEAN WALL."
              </p>
              <p className="font-serif italic text-neutral-400 text-xs leading-relaxed">
                "The ritual requires four anchors: the tallow candle, the silver crest, the chimes of the nursery, and the ancient seal. Once placed, the door will never open from the inside."
              </p>
            </div>
          )}

          {stage === 4 && (
            <div className="z-10 text-center p-6 max-w-lg">
              <div className="text-red-600 font-['Cinzel'] font-black text-2xl sm:text-3xl tracking-[0.25em] mb-2 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)] animate-pulse">
                SHE IS WATCHING YOU
              </div>
              <p className="font-serif italic text-neutral-300 text-xs sm:text-sm">
                "The Woman in the Walls is not trapped inside the house. The house is trapped inside HER."
              </p>
            </div>
          )}

          {stage === 5 && (
            <div className="z-30 text-center p-6 flex flex-col items-center">
              <div className="font-mono text-neutral-600 text-sm tracking-widest uppercase mb-4">
                NO SIGNAL — [CHANNEL 03]
              </div>
              {whisperPrompt && (
                <div className="p-5 bg-[#080808] border border-red-800 text-white shadow-[0_0_30px_rgba(220,38,38,0.6)] animate-pulse flex flex-col items-center">
                  <span className="font-serif italic text-xs text-neutral-400 mb-1">
                    A chilling breath whispers right into your ear:
                  </span>
                  <span className="font-['Cinzel'] font-black text-2xl text-red-500 tracking-widest uppercase mb-4">
                    "Behind you."
                  </span>
                  <button
                    onClick={handleTurnAround}
                    className="group relative px-6 py-2.5 bg-red-950 border border-red-600 hover:bg-red-900 text-white font-mono tracking-[0.25em] text-xs uppercase shadow-xl active:scale-95 transition-all"
                  >
                    <span>TURN AROUND</span>
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-red-600" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* VCR Hardware panel on bottom */}
        <div className="mt-3 flex items-center justify-between px-4 py-2 bg-[#050505] border border-neutral-800/80">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
              PLAYBACK FEED ACTIVE
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1 bg-[#080808] hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-600 text-neutral-300 text-xs font-mono uppercase tracking-wider transition-colors"
            >
              EJECT [ESC]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

