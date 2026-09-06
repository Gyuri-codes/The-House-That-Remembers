import React, { useEffect } from 'react';
import { RotateCcw, Award, CheckCircle, Skull, ShieldCheck } from 'lucide-react';
import { EndingType } from '../types';
import { ENDINGS } from '../data/gameContent';
import { horrorAudio } from '../audio/horrorAudio';

interface EndingScreenProps {
  ending: EndingType;
  secretCluesCount: number;
  onRestart: () => void;
}

export const EndingScreen: React.FC<EndingScreenProps> = ({
  ending,
  secretCluesCount,
  onRestart,
}) => {
  const endingData = ENDINGS[ending] || ENDINGS.normal;

  useEffect(() => {
    if (ending === 'bad') {
      horrorAudio.startAmbientDrone(0.7);
      horrorAudio.startHeartbeat(110);
    } else {
      horrorAudio.startAmbientDrone(0.2);
    }

    return () => {
      horrorAudio.stopHeartbeat();
    };
  }, [ending]);

  const getEndingIcon = () => {
    switch (ending) {
      case 'good':
        return <ShieldCheck className="w-8 h-8 text-neutral-200" />;
      case 'secret':
        return <Award className="w-8 h-8 text-red-400" />;
      case 'bad':
        return <Skull className="w-8 h-8 text-red-600 animate-pulse" />;
      default:
        return <CheckCircle className="w-8 h-8 text-neutral-400" />;
    }
  };

  return (
    <div id="ending-screen" className="fixed inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center p-6 text-center select-none overflow-y-auto font-mono animate-fade-in">
      {/* Heavy Vignette & Noise Filter */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 75%, rgba(5,5,5,1) 100%)',
        }}
      />
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none noise-overlay z-20 animate-film-grain" />

      {/* Viewfinder Corner Reticles */}
      <div className="absolute top-6 left-6 w-14 h-14 border-t border-l border-neutral-800 opacity-40 pointer-events-none z-30" />
      <div className="absolute top-6 right-6 w-14 h-14 border-t border-r border-neutral-800 opacity-40 pointer-events-none z-30" />
      <div className="absolute bottom-6 left-6 w-14 h-14 border-b border-l border-neutral-800 opacity-40 pointer-events-none z-30" />
      <div className="absolute bottom-6 right-6 w-14 h-14 border-b border-r border-neutral-800 opacity-40 pointer-events-none z-30" />

      <div className="relative z-30 max-w-2xl w-full flex flex-col items-center my-auto py-8">
        <div className="p-3 bg-[#080808] border border-neutral-800 shadow-2xl mb-4">
          {getEndingIcon()}
        </div>

        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-red-500 font-bold">
            {endingData.subtitle} // RECORD ARCHIVED
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-['Cinzel'] tracking-[0.05em] text-transparent bg-clip-text bg-gradient-to-b from-neutral-200 via-neutral-400 to-neutral-700 uppercase mb-6">
          {endingData.title}
        </h1>

        <div className="p-6 bg-[#080808] border border-neutral-800 text-left mb-6 shadow-2xl space-y-4 w-full">
          <p className="text-xs sm:text-sm text-neutral-300 font-serif leading-relaxed">
            {endingData.description}
          </p>
          <div className="pt-4 border-t border-neutral-900">
            <p className="text-xs text-neutral-400 italic font-serif leading-relaxed">
              "{endingData.epilogue}"
            </p>
          </div>
        </div>

        {/* Ending Stats */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-md mb-8">
          <div className="p-3 bg-[#080808] border border-neutral-800/80">
            <span className="text-[9px] uppercase font-mono tracking-widest text-neutral-500 block">
              Fragments Recovered
            </span>
            <span className="text-base font-bold font-mono text-neutral-200">
              {secretCluesCount} / 4
            </span>
          </div>

          <div className="p-3 bg-[#080808] border border-neutral-800/80">
            <span className="text-[9px] uppercase font-mono tracking-widest text-neutral-500 block">
              Entity Status
            </span>
            <span className="text-base font-bold font-mono text-red-500">
              Remembers
            </span>
          </div>
        </div>

        {/* Return Button */}
        <button
          onClick={onRestart}
          className="group relative px-8 py-3.5 bg-[#080808] border border-neutral-800 hover:border-red-900 text-neutral-200 font-mono tracking-[0.35em] uppercase text-xs shadow-xl active:scale-95 transition-all flex items-center gap-3"
        >
          <RotateCcw className="w-3.5 h-3.5 text-red-500" />
          <span>RETURN TO MAIN MENU</span>
          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-red-600" />
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-red-600" />
        </button>
      </div>
    </div>
  );
};

