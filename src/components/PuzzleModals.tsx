import React, { useState } from 'react';
import { X, Clock, Check, Disc, Flame } from 'lucide-react';
import { PuzzleStates, InventoryItem } from '../types';
import { horrorAudio } from '../audio/horrorAudio';

interface ClockPuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  puzzles: PuzzleStates;
  onSolve: () => void;
}

export const ClockPuzzleModal: React.FC<ClockPuzzleModalProps> = ({
  isOpen,
  onClose,
  puzzles,
  onSolve,
}) => {
  const [hour, setHour] = useState(puzzles.clockHour || 12);
  const [minute, setMinute] = useState(puzzles.clockMinute || 0);

  if (!isOpen) return null;

  const isSolved = hour === 3 && minute === 17;

  const handleHourChange = (newH: number) => {
    horrorAudio.playClockTick(false);
    const val = (newH + 12 - 1) % 12 + 1;
    setHour(val);
    if (val === 3 && minute === 17) {
      onSolve();
    }
  };

  const handleMinuteChange = (newM: number) => {
    horrorAudio.playClockTick(true);
    const val = (newM + 60) % 60;
    setMinute(val);
    if (hour === 3 && val === 17) {
      onSolve();
    }
  };

  return (
    <div id="clock-puzzle-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-md bg-[#080808] border border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.95)] p-6 text-center">
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
            MECHANISM // CHRONO INTERCEPT
          </span>
        </div>

        <Clock className="w-7 h-7 text-red-500 mx-auto mb-2" />
        <h2 className="text-xl font-bold font-['Cinzel'] text-neutral-100 tracking-wider mb-1">
          Grandfather Clock Mechanism
        </h2>
        <p className="text-xs text-neutral-400 font-serif mb-6">
          The brass escapement is frozen. Calibrate the gears to the fateful hour.
        </p>

        {/* Clock Face Display */}
        <div className="relative w-48 h-48 mx-auto rounded-full border-2 border-neutral-700 bg-[#050505] shadow-[inset_0_0_30px_rgba(0,0,0,0.9)] flex items-center justify-center mb-6">
          {/* Hour markers */}
          {[12, 3, 6, 9].map((num) => (
            <span
              key={num}
              className="absolute font-mono font-bold text-neutral-400 text-xs"
              style={{
                top: num === 12 ? '8px' : num === 6 ? 'auto' : '50%',
                bottom: num === 6 ? '8px' : 'auto',
                left: num === 9 ? '10px' : num === 3 ? 'auto' : '50%',
                right: num === 3 ? '10px' : 'auto',
                transform: (num === 12 || num === 6) ? 'translateX(-50%)' : 'translateY(-50%)',
              }}
            >
              {num === 12 ? 'XII' : num === 3 ? 'III' : num === 6 ? 'VI' : 'IX'}
            </span>
          ))}

          {/* Hour Hand */}
          <div
            className="absolute w-1 h-12 bg-red-500 origin-bottom transition-transform duration-300 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
            style={{
              bottom: '50%',
              transform: `rotate(${(hour % 12) * 30 + (minute / 60) * 30}deg)`,
            }}
          />
          {/* Minute Hand */}
          <div
            className="absolute w-0.5 h-16 bg-neutral-200 origin-bottom transition-transform duration-300"
            style={{
              bottom: '50%',
              transform: `rotate(${minute * 6}deg)`,
            }}
          />
          {/* Center Nut */}
          <div className="w-3 h-3 rounded-full bg-red-600 border border-neutral-300 z-10" />
        </div>

        {/* Digital display & Controls */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono mb-1">
              HOUR
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleHourChange(hour - 1)}
                className="w-7 h-7 bg-[#050505] border border-neutral-800 hover:border-neutral-600 text-neutral-200 active:bg-neutral-900"
              >
                -
              </button>
              <span className="w-10 text-lg font-bold font-mono text-neutral-100">
                {hour.toString().padStart(2, '0')}
              </span>
              <button
                onClick={() => handleHourChange(hour + 1)}
                className="w-7 h-7 bg-[#050505] border border-neutral-800 hover:border-neutral-600 text-neutral-200 active:bg-neutral-900"
              >
                +
              </button>
            </div>
          </div>

          <span className="text-xl font-bold text-neutral-600 mt-3">:</span>

          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono mb-1">
              MINUTE
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMinuteChange(minute - 1)}
                className="w-7 h-7 bg-[#050505] border border-neutral-800 hover:border-neutral-600 text-neutral-200 active:bg-neutral-900"
              >
                -
              </button>
              <span className="w-10 text-lg font-bold font-mono text-neutral-100">
                {minute.toString().padStart(2, '0')}
              </span>
              <button
                onClick={() => handleMinuteChange(minute + 1)}
                className="w-7 h-7 bg-[#050505] border border-neutral-800 hover:border-neutral-600 text-neutral-200 active:bg-neutral-900"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {isSolved ? (
          <div className="p-3 bg-red-950/40 border border-red-700 text-red-200 text-xs flex items-center justify-center gap-2 font-semibold font-mono animate-pulse">
            <Check className="w-4 h-4 text-red-500" />
            <span>CLICK! A hidden compartment sprang open!</span>
          </div>
        ) : (
          <p className="text-[11px] text-neutral-500 italic font-serif">
            Clue: The four children were reported missing at 3:17 in the morning.
          </p>
        )}
      </div>
    </div>
  );
};

// Portrait Symbols Puzzle (Area 2 Basement)
interface PortraitPuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  puzzles: PuzzleStates;
  onSolve: () => void;
}

export const PortraitPuzzleModal: React.FC<PortraitPuzzleModalProps> = ({
  isOpen,
  onClose,
  puzzles,
  onSolve,
}) => {
  const SYMBOLS = ['Owl', 'Serpent', 'Moth', 'Key'];
  const [symbols, setSymbols] = useState(puzzles.portraitSymbols || { arthur: 0, beatrice: 0, charles: 0, evelyn: 0 });

  if (!isOpen) return null;

  const cycleSymbol = (person: keyof typeof symbols) => {
    horrorAudio.playClockTick(false);
    const nextVal = (symbols[person] + 1) % 4;
    const updated = { ...symbols, [person]: nextVal };
    setSymbols(updated);

    if (
      updated.arthur === 0 &&
      updated.beatrice === 1 &&
      updated.charles === 2 &&
      updated.evelyn === 3
    ) {
      horrorAudio.playDoorCreak();
      onSolve();
    }
  };

  const isSolved =
    symbols.arthur === 0 &&
    symbols.beatrice === 1 &&
    symbols.charles === 2 &&
    symbols.evelyn === 3;

  return (
    <div id="portrait-puzzle-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-2xl bg-[#080808] border border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.95)] p-6">
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
            ARCHIVE ENCRYPTION // LINEAGE DIAL
          </span>
        </div>

        <h2 className="text-xl font-bold font-['Cinzel'] text-neutral-100 text-center tracking-wider mb-1">
          Blackwood Ancestral Crests
        </h2>
        <p className="text-xs text-neutral-400 font-serif text-center mb-6">
          Rotate each family portrait's brass dial to match their true symbolic crest.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { key: 'arthur' as const, name: 'Arthur', role: 'Patriarch' },
            { key: 'beatrice' as const, name: 'Beatrice', role: 'Matriarch' },
            { key: 'charles' as const, name: 'Charles', role: 'Eldest' },
            { key: 'evelyn' as const, name: 'Evelyn', role: 'Youngest' },
          ].map((item) => (
            <div
              key={item.key}
              className="flex flex-col items-center p-3.5 bg-[#050505] border border-neutral-800/80"
            >
              <div className="w-14 h-16 bg-[#080808] border border-neutral-700 mb-2 flex items-center justify-center text-xs font-mono text-red-400">
                [{item.name[0]}]
              </div>
              <span className="text-xs font-bold font-['Cinzel'] text-neutral-200 tracking-wider">
                {item.name}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-neutral-500 mb-3 font-mono">
                {item.role}
              </span>

              <button
                onClick={() => cycleSymbol(item.key)}
                className="w-full py-2 px-2 bg-[#080808] hover:bg-neutral-900 border border-neutral-800 hover:border-red-900 text-red-300 text-xs font-mono font-bold tracking-wider active:scale-95 transition-all"
              >
                {SYMBOLS[symbols[item.key]]}
              </button>
            </div>
          ))}
        </div>

        {isSolved ? (
          <div className="p-3 bg-red-950/40 border border-red-700 text-red-200 text-xs text-center font-semibold font-mono animate-pulse">
            The cellar wall shudders and slides aside, revealing a hidden passage!
          </div>
        ) : (
          <p className="text-[11px] text-neutral-500 italic text-center font-serif">
            Clue from Diary: "Owl watches in dark, Serpent coils below, Moth drawn to fire, Key guards the truth."
          </p>
        )}
      </div>
    </div>
  );
};

// Music Box Puzzle (Area 3 Children's Room)
interface MusicBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  puzzles: PuzzleStates;
  onSolve: () => void;
}

export const MusicBoxModal: React.FC<MusicBoxModalProps> = ({
  isOpen,
  onClose,
  onSolve,
}) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const target = [1, 3, 2, 4];

  if (!isOpen) return null;

  const playNote = (note: number) => {
    horrorAudio.playMusicBoxNote(note);
    const newSeq = [...sequence, note];
    setSequence(newSeq);

    const isPrefix = newSeq.every((n, i) => n === target[i]);
    if (!isPrefix) {
      setTimeout(() => {
        setSequence([]);
      }, 500);
      return;
    }

    if (newSeq.length === target.length) {
      horrorAudio.playMusicBoxLullaby(() => {
        onSolve();
      });
    }
  };

  return (
    <div id="music-box-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-md bg-[#080808] border border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.95)] p-6 text-center">
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
            ACOUSTIC // NURSERY PHONOGRAM
          </span>
        </div>

        <Disc className="w-7 h-7 text-red-500 mx-auto mb-2" />
        <h2 className="text-xl font-bold font-['Cinzel'] text-neutral-100 tracking-wider mb-1">
          Nursery Music Box
        </h2>
        <p className="text-xs text-neutral-400 font-serif mb-6">
          Play the children's 4-tone bedtime lullaby in correct sequence.
        </p>

        {/* Note indicators */}
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-9 h-9 border flex items-center justify-center font-mono font-bold text-xs ${
                sequence[idx]
                  ? 'border-red-600 bg-red-950/60 text-red-200 shadow-[0_0_12px_rgba(220,38,38,0.4)]'
                  : 'border-neutral-800 bg-[#050505] text-neutral-600'
              }`}
            >
              {sequence[idx] ? sequence[idx] : '•'}
            </div>
          ))}
        </div>

        {/* Chime chime keys */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { note: 1, label: 'Tone I', pitch: 'E' },
            { note: 2, label: 'Tone II', pitch: 'G' },
            { note: 3, label: 'Tone III', pitch: 'B' },
            { note: 4, label: 'Tone IV', pitch: 'D' },
          ].map((k) => (
            <button
              key={k.note}
              onClick={() => playNote(k.note)}
              className="py-3.5 px-2 bg-[#050505] hover:bg-neutral-900 border border-neutral-800 hover:border-red-800 active:scale-95 transition-all text-neutral-200 flex flex-col items-center"
            >
              <span className="text-xs font-mono font-bold text-red-400">{k.pitch}</span>
              <span className="text-[9px] text-neutral-500 mt-1 uppercase font-mono">{k.label}</span>
            </button>
          ))}
        </div>

        <p className="text-[11px] text-neutral-500 italic font-serif">
          Clue from nursery diary: "1 to rest, 3 to dream, 2 to wake, 4 to scream."
        </p>
      </div>
    </div>
  );
};

// Ritual Altars Modal (Area 6 Ritual Room)
interface RitualModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  puzzles: PuzzleStates;
  onPlaceItem: (direction: 'north' | 'east' | 'south' | 'west', itemId: string) => void;
  onSolve: () => void;
}

export const RitualModal: React.FC<RitualModalProps> = ({
  isOpen,
  onClose,
  inventory,
  puzzles,
  onPlaceItem,
  onSolve,
}) => {
  const [selectedAltar, setSelectedAltar] = useState<'north' | 'east' | 'south' | 'west' | null>(null);

  if (!isOpen) return null;

  const placed = puzzles.ritualPlacedItems;

  const altars: { dir: 'north' | 'east' | 'south' | 'west'; name: string; reqName: string; correctId: string }[] = [
    { dir: 'north', name: 'Northern Pillar', reqName: 'Tallow Black Candle', correctId: 'black_candle' },
    { dir: 'east', name: 'Eastern Pillar', reqName: 'Blackwood Family Pendant', correctId: 'family_pendant' },
    { dir: 'south', name: 'Southern Pillar', reqName: 'Nursery Music Box', correctId: 'music_box_cylinder' },
    { dir: 'west', name: 'Western Pillar', reqName: 'Blackwood Ancient Seal', correctId: 'blackwood_seal' },
  ];

  const handlePlace = (itemId: string) => {
    if (!selectedAltar) return;
    onPlaceItem(selectedAltar, itemId);
    horrorAudio.playItemPickup();
    setSelectedAltar(null);

    const check = { ...placed, [selectedAltar]: itemId };
    if (
      check.north === 'black_candle' &&
      check.east === 'family_pendant' &&
      check.south === 'music_box_cylinder' &&
      check.west === 'blackwood_seal'
    ) {
      horrorAudio.playJumpscareStinger();
      onSolve();
    }
  };

  const isAllCorrect =
    placed.north === 'black_candle' &&
    placed.east === 'family_pendant' &&
    placed.south === 'music_box_cylinder' &&
    placed.west === 'blackwood_seal';

  return (
    <div id="ritual-puzzle-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-2xl bg-[#080808] border border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.95)] p-6">
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
            SANCTUM CONVERGENCE // RITUAL SEAL
          </span>
        </div>

        <Flame className="w-7 h-7 text-red-600 mx-auto mb-2 animate-pulse" />
        <h2 className="text-xl font-bold font-['Cinzel'] text-neutral-100 text-center tracking-wider mb-1">
          Subterranean Binding Circle
        </h2>
        <p className="text-xs text-neutral-400 font-serif text-center mb-6">
          Offer the four relics to awaken the ancient seal.
        </p>

        {/* 4 Cardinal Altars Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {altars.map((a) => {
            const currentItem = inventory.find((i) => i.id === placed[a.dir]);
            const isCorrect = placed[a.dir] === a.correctId;

            return (
              <div
                key={a.dir}
                onClick={() => setSelectedAltar(a.dir)}
                className={`p-3.5 border cursor-pointer transition-all ${
                  selectedAltar === a.dir
                    ? 'border-red-600 bg-red-950/30 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                    : 'border-neutral-800 bg-[#050505] hover:border-neutral-700'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold font-['Cinzel'] text-neutral-200 tracking-wider uppercase">
                    {a.name}
                  </span>
                  {isCorrect && <Check className="w-3.5 h-3.5 text-red-500" />}
                </div>

                <div className="p-2.5 bg-[#080808] border border-neutral-800 text-center">
                  <span className="text-xs font-mono text-neutral-300">
                    {placed[a.dir] ? (currentItem?.name || placed[a.dir]) : '[ Empty Altar Bowl ]'}
                  </span>
                </div>
                <span className="text-[9px] uppercase tracking-wider text-neutral-500 block mt-2 font-mono">
                  Req: {a.reqName}
                </span>
              </div>
            );
          })}
        </div>

        {/* Inventory Item Picker when altar selected */}
        {selectedAltar && (
          <div className="p-4 bg-[#050505] border border-neutral-800 mb-4 animate-fade-in">
            <span className="text-xs font-mono text-neutral-300 block mb-2 uppercase tracking-wider">
              Select relic to place on {selectedAltar.toUpperCase()} altar:
            </span>
            <div className="flex flex-wrap gap-2">
              {inventory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePlace(item.id)}
                  className="px-3 py-1.5 bg-[#080808] hover:bg-neutral-900 border border-neutral-800 hover:border-red-800 text-xs font-mono text-neutral-300 active:scale-95"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {isAllCorrect ? (
          <div className="p-3 bg-red-950/80 border border-red-600 text-red-200 text-xs text-center font-semibold font-mono animate-pulse">
            THE SEAL HAS AWOKEN! THE FOUNDATION OF THE MANSION BEGINS TO TEAR APART!
          </div>
        ) : (
          <p className="text-[11px] text-neutral-500 italic text-center font-serif">
            The ritual requires: Black Candle (North), Family Pendant (East), Music Box (South), Ancient Seal (West).
          </p>
        )}
      </div>
    </div>
  );
};

