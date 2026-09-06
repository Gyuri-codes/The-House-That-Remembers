import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { horrorAudio } from '../audio/horrorAudio';

interface OpeningSequenceProps {
  isMobile: boolean;
  onStandUp: () => void;
}

export const OpeningSequence: React.FC<OpeningSequenceProps> = ({
  isMobile,
  onStandUp,
}) => {
  const [phase, setPhase] = useState<'black' | 'whisper' | 'fade_in' | 'prompt'>('black');

  useEffect(() => {
    // Sequence timing as mandated in PDF:
    // 1. Black screen, no HUD, environmental audio
    horrorAudio.startAmbientDrone(0.3);

    const t1 = setTimeout(() => {
      // 2. Distant child whispers: "You came back."
      setPhase('whisper');
      horrorAudio.playWhisper('you_came_back');
    }, 2000);

    const t2 = setTimeout(() => {
      // 3. Screen slowly fades in, player lying on floor
      setPhase('fade_in');
    }, 4500);

    const t3 = setTimeout(() => {
      // 4. Prompt appears: E — Stand Up / INTERACT — Stand Up
      setPhase('prompt');
    }, 6500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const handleAction = () => {
    horrorAudio.playDoorCreak();
    onStandUp();
  };

  // Keyboard shortcut listener for 'E'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'e' || e.key === 'E') && phase === 'prompt') {
        handleAction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  return (
    <div id="opening-sequence" className="fixed inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center p-6 select-none overflow-hidden font-mono">
      {/* Heavy Vignette & Noise Filter */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 75%, rgba(5,5,5,1) 100%)',
        }}
      />
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none noise-overlay z-20 animate-film-grain" />

      {/* Viewfinder Corner Reticles */}
      <div className="absolute top-6 left-6 w-14 h-14 border-t border-l border-neutral-800 opacity-30 pointer-events-none z-30" />
      <div className="absolute top-6 right-6 w-14 h-14 border-t border-r border-neutral-800 opacity-30 pointer-events-none z-30" />
      <div className="absolute bottom-6 left-6 w-14 h-14 border-b border-l border-neutral-800 opacity-30 pointer-events-none z-30" />
      <div className="absolute bottom-6 right-6 w-14 h-14 border-b border-r border-neutral-800 opacity-30 pointer-events-none z-30" />

      {/* Black screen with child whisper text */}
      {phase === 'whisper' && (
        <div className="text-center animate-fade-in relative z-30">
          <p className="font-serif italic text-neutral-300 text-xl md:text-2xl tracking-[0.25em] drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            "You came back."
          </p>
          <span className="text-[10px] text-red-700 font-mono uppercase tracking-[0.3em] mt-3 block">
            // VOICE IDENTIFIED: CORRIDOR RESIDENT
          </span>
        </div>
      )}

      {/* Fade-in view of being on the floor */}
      {(phase === 'fade_in' || phase === 'prompt') && (
        <div className="relative w-full h-full flex flex-col items-center justify-center animate-fade-in transition-opacity duration-1000 z-30">
          {/* Floor perspective radial */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(35,10,10,0.35)_0%,rgba(5,5,5,0.95)_70%)]" />

          {/* Doorway in distance */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-48 border border-neutral-800 bg-neutral-950 shadow-[0_0_40px_rgba(0,0,0,1)] rounded-t-sm flex items-center justify-center mb-5">
              <div className="w-1.5 h-1.5 bg-red-600/70 rounded-full shadow-[0_0_8px_red] animate-pulse" />
            </div>

            <p className="font-serif italic text-neutral-400 text-sm md:text-base text-center max-w-md mb-8 tracking-wide">
              Your eyes flutter open. Cold wooden floorboards press against your cheek. The mansion is silent.
            </p>

            {/* Stand Up Prompt */}
            {phase === 'prompt' && (
              <button
                id="btn-stand-up"
                onClick={handleAction}
                className="group relative px-8 py-3.5 bg-[#080808]/90 border border-neutral-800 hover:border-red-900 transition-all flex items-center justify-center active:scale-95 shadow-2xl"
              >
                <span className="text-xs sm:text-sm tracking-[0.35em] font-light text-neutral-200 group-hover:text-red-500 transition-colors uppercase font-mono flex items-center gap-2">
                  <Eye className="w-4 h-4 text-red-500" />
                  <span>{isMobile ? 'INTERACT — STAND UP' : 'E — STAND UP'}</span>
                </span>
                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

