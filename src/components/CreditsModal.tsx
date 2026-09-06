import React from 'react';
import { X, Ghost } from 'lucide-react';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div id="credits-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-lg bg-[#080808] border border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.95)] p-6 text-center">
        {/* Corner Reticles */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t border-l border-neutral-700 opacity-40 pointer-events-none" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t border-r border-neutral-700 opacity-40 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b border-l border-neutral-700 opacity-40 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b border-r border-neutral-700 opacity-40 pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-[#050505] border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-red-500 font-bold">
            ARCHIVE CREDITS // DOSSIER 626
          </span>
        </div>

        <Ghost className="w-8 h-8 text-red-600 mx-auto mb-2 opacity-80" />
        <h2 className="text-xl font-bold font-['Cinzel'] text-neutral-100 tracking-wider mb-1">
          THE HOUSE THAT REMEMBERS
        </h2>
        <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-500 mb-6">
          A Psychological First-Person Web Horror Game
        </p>

        <div className="space-y-3.5 text-xs text-neutral-400 font-serif leading-relaxed text-left bg-[#050505] p-5 border border-neutral-800/80 mb-6">
          <p>
            <strong className="text-neutral-200 font-['Cinzel'] tracking-wide">Inspiration & Heritage:</strong> Designed in homage to the experimental browser horror era (such as Doritos' legendary <em>Hotel 626</em>), focusing on direct player claustrophobia, psychological tension, environmental puzzles, and unpredictable supernatural encounters.
          </p>
          <p>
            <strong className="text-neutral-200 font-['Cinzel'] tracking-wide">Game Engine:</strong> Built with Three.js hardware-accelerated WebGL 3D rendering and procedural Web Audio API synthesis for seamless lag-free performance across both PC and mobile devices.
          </p>
          <p>
            <strong className="text-neutral-200 font-['Cinzel'] tracking-wide">Sound & Atmosphere:</strong> Features dynamic binaural whispers, accelerating heartbeat pacing, generative nursery chimes, and ambient sub-bass drone.
          </p>
        </div>

        <button
          onClick={onClose}
          className="group relative px-6 py-2.5 bg-[#080808] border border-neutral-800 hover:border-red-900 text-neutral-200 font-mono tracking-[0.25em] uppercase text-xs shadow-xl active:scale-95 transition-all"
        >
          <span>ACKNOWLEDGE</span>
          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-red-600" />
        </button>
      </div>
    </div>
  );
};

