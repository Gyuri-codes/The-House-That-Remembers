import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameArea, EndingType, InventoryItem, JournalEntry, GameSettings, PuzzleStates } from './types';
import { INITIAL_JOURNAL_ENTRIES, INITIAL_ITEMS, AREA_METADATA } from './data/gameContent';
import { horrorAudio } from './audio/horrorAudio';
import { ThreeCanvas } from './components/ThreeCanvas';
import { MobileControls } from './components/MobileControls';
import { HudOverlay } from './components/HudOverlay';
import { MainMenu } from './components/MainMenu';
import { OpeningSequence } from './components/OpeningSequence';
import { InventoryModal } from './components/InventoryModal';
import { JournalModal } from './components/JournalModal';
import { ClockPuzzleModal, PortraitPuzzleModal, MusicBoxModal, RitualModal } from './components/PuzzleModals';
import { VhsPlayerModal } from './components/VhsPlayerModal';
import { SettingsModal } from './components/SettingsModal';
import { EndingScreen } from './components/EndingScreen';
import { CreditsModal } from './components/CreditsModal';

const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.8,
  musicVolume: 0.7,
  sfxVolume: 0.85,
  mouseSensitivity: 65,
  touchSensitivity: 75,
  graphicsQuality: 'high',
  brightness: 100,
  subtitles: true,
  cameraShake: true,
  reducedFlashing: false,
};

const DEFAULT_PUZZLES: PuzzleStates = {
  clockHour: 12,
  clockMinute: 0,
  clockSolved: false,
  basementDoorUnlocked: false,
  portraitSymbols: { arthur: 0, beatrice: 0, charles: 0, evelyn: 0 },
  portraitSolved: false,
  musicBoxPlayed: [],
  musicBoxSolved: false,
  vhsInserted: false,
  vhsWatched: false,
  turnedAroundAfterVhs: false,
  hallwayPhotosExamined: false,
  hallwayWhisperTriggered: false,
  ritualPlacedItems: { north: null, east: null, south: null, west: null },
  ritualSolved: false,
  chaseProgress: 0,
  chaseEscaped: false,
  sealRestored: false,
};

const SAVE_KEY = 'house_that_remembers_save_v1';
const SETTINGS_KEY = 'house_that_remembers_settings_v1';

export default function App() {
  // Game Navigation State
  const [currentArea, setCurrentArea] = useState<GameArea>('menu');
  const [endingType, setEndingType] = useState<EndingType>('normal');
  const [hasSavedGame, setHasSavedGame] = useState(false);

  // Settings
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Player & Progression State
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>(INITIAL_JOURNAL_ENTRIES);
  const [puzzles, setPuzzles] = useState<PuzzleStates>(DEFAULT_PUZZLES);
  const [secretCluesFound, setSecretCluesFound] = useState<string[]>([]);

  // Movement & Camera Input
  const [moveVector, setMoveVector] = useState({ x: 0, y: 0 });
  const [lookDelta, setLookDelta] = useState({ x: 0, y: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [lookTarget, setLookTarget] = useState<{ id: string; prompt: string; label: string } | null>(null);

  // Horror & Atmosphere Dynamics
  const [subtitle, setSubtitle] = useState<string | null>(null);
  const [isJumpscare, setIsJumpscare] = useState(false);
  const [activeHorrorEvent, setActiveHorrorEvent] = useState<string | null>(null);
  const [triggerScare, setTriggerScare] = useState(false);

  // Active Modals
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [isClockPuzzleOpen, setIsClockPuzzleOpen] = useState(false);
  const [isPortraitPuzzleOpen, setIsPortraitPuzzleOpen] = useState(false);
  const [isMusicBoxOpen, setIsMusicBoxOpen] = useState(false);
  const [isVhsPlayerOpen, setIsVhsPlayerOpen] = useState(false);
  const [isRitualOpen, setIsRitualOpen] = useState(false);

  // Detect mobile
  const [isMobile, setIsMobile] = useState(false);

  // Check saved game on initial mount
  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) setHasSavedGame(true);
    } catch {}
  }, []);

  // Sync audio volumes with settings
  useEffect(() => {
    horrorAudio.updateVolumes(settings.masterVolume, settings.musicVolume, settings.sfxVolume);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Auto-save game progression
  const saveGame = useCallback(
    (areaToSave: GameArea) => {
      if (areaToSave === 'menu' || areaToSave === 'intro' || areaToSave === 'ending') return;
      try {
        const data = {
          area: areaToSave,
          inventory,
          journal,
          puzzles,
          secretCluesFound,
          timestamp: Date.now(),
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        setHasSavedGame(true);
      } catch {}
    },
    [inventory, journal, puzzles, secretCluesFound]
  );

  // Show temporary subtitle
  const displaySubtitle = useCallback((text: string, durationMs = 3800) => {
    setSubtitle(text);
    setTimeout(() => {
      setSubtitle((curr) => (curr === text ? null : curr));
    }, durationMs);
  }, []);

  // Trigger jumpscare
  const triggerHorrorJumpscare = useCallback(
    (type = 'default') => {
      horrorAudio.playJumpscareStinger();
      setIsJumpscare(true);
      setTriggerScare(true);

      setTimeout(() => {
        setIsJumpscare(false);
        setTriggerScare(false);
      }, 1100);
    },
    []
  );

  // Area Transition Handler
  const transitionToArea = useCallback(
    (nextArea: GameArea) => {
      setCurrentArea(nextArea);
      saveGame(nextArea);

      // Area-specific audio setup
      if (nextArea === 'area_02_basement') {
        horrorAudio.startAmbientDrone(0.55);
        displaySubtitle('The air grows heavy and damp. Water drips continuously somewhere in the dark.');
      } else if (nextArea === 'area_03_childrens_room') {
        horrorAudio.startAmbientDrone(0.45);
        displaySubtitle('A child\'s bedroom. Four beds... four empty spaces.');
      } else if (nextArea === 'area_04_recording_room') {
        horrorAudio.startAmbientDrone(0.5);
        displaySubtitle('An old surveillance suite. The CRT monitor hums with static.');
      } else if (nextArea === 'area_05_hidden_hallway') {
        horrorAudio.startAmbientDrone(0.65);
        displaySubtitle('This corridor was not here before. The wallpaper smells of fresh blood.');
      } else if (nextArea === 'area_06_ritual_room') {
        horrorAudio.startAmbientDrone(0.7);
        displaySubtitle('An ancient crypt beneath the house. The monolith glows with sealed runes.');
      } else if (nextArea === 'area_07_creatures_lair') {
        horrorAudio.startAmbientDrone(0.9);
        horrorAudio.startHeartbeat(130);
        displaySubtitle('THE MANSION IS COLLAPSING! RUN!');
      }
    },
    [displaySubtitle, saveGame]
  );

  // Add Item to Inventory helper
  const addItem = useCallback((itemKey: keyof typeof INITIAL_ITEMS) => {
    const item = INITIAL_ITEMS[itemKey];
    if (!item) return;
    setInventory((prev) => (prev.some((i) => i.id === item.id) ? prev : [...prev, item]));
    horrorAudio.playItemPickup();
  }, []);

  // Add Journal Entry helper
  const addJournalEntry = useCallback((entry: JournalEntry) => {
    setJournal((prev) => (prev.some((e) => e.id === entry.id) ? prev : [...prev, entry]));
  }, []);

  // Randomized Horror Events System
  useEffect(() => {
    if (currentArea === 'menu' || currentArea === 'intro' || currentArea === 'ending') return;

    // Random interval between 18 and 35 seconds
    const interval = setInterval(() => {
      const roll = Math.random();
      if (roll < 0.25) {
        // Random footsteps
        horrorAudio.playFootstep('wood');
        setTimeout(() => horrorAudio.playFootstep('wood'), 400);
        setTimeout(() => horrorAudio.playFootstep('wood'), 800);
        setActiveHorrorEvent('footsteps');
        if (settings.subtitles) displaySubtitle('[Faint footsteps halt directly behind you]');
      } else if (roll < 0.5) {
        // Subtle whisper
        horrorAudio.playWhisper('stay');
        setActiveHorrorEvent('whisper');
        if (settings.subtitles) displaySubtitle('"Stay with us..."');
      } else if (roll < 0.75) {
        // Lights flicker
        setActiveHorrorEvent('lights_flicker');
        horrorAudio.playScratching();
      } else {
        // Distant door slam
        horrorAudio.playDoorSlam();
        setActiveHorrorEvent('door_slam');
        if (settings.subtitles) displaySubtitle('[A heavy door slams shut in the distance]');
      }

      setTimeout(() => setActiveHorrorEvent(null), 3000);
    }, 24000);

    return () => clearInterval(interval);
  }, [currentArea, displaySubtitle, settings.subtitles]);

  // Main Interaction Router
  const handleInteract = useCallback(() => {
    if (!lookTarget) return;

    const targetId = lookTarget.id;

    // Area 1 Interactions
    if (targetId === 'grandfather_clock') {
      setIsClockPuzzleOpen(true);
    } else if (targetId === 'children_photo') {
      addItem('children_photo');
      addJournalEntry({
        id: 'clue_four_children',
        category: 'characters',
        title: 'The Blackwood Children',
        content: 'Thomas, Clara, Oliver, and Evelyn. Disappeared in September 1924.',
        revealedAt: Date.now(),
      });
      displaySubtitle('You picked up the photograph. Four children stare back with hollow expressions.');
    } else if (targetId === 'basement_door') {
      if (inventory.some((i) => i.id === 'iron_key') || puzzles.clockSolved) {
        horrorAudio.playDoorCreak();
        transitionToArea('area_02_basement');
      } else {
        horrorAudio.playDoorSlam();
        displaySubtitle('The heavy iron door is firmly padlocked. A mechanism must unlock it.');
      }
    }

    // Area 2 Interactions
    else if (targetId.startsWith('portrait_')) {
      setIsPortraitPuzzleOpen(true);
    } else if (targetId === 'blackwood_clipping') {
      addItem('blackwood_journal');
      addItem('family_pendant');
      addJournalEntry({
        id: 'clue_family_crests',
        category: 'clues',
        title: 'Blackwood Family Crests',
        content: 'Owl watches in dark (Arthur), Serpent coils below (Beatrice), Moth drawn to fire (Charles), Key guards the truth (Evelyn).',
        revealedAt: Date.now(),
      });
      displaySubtitle('You found a torn journal page and the heavy Blackwood Family Pendant!');
    } else if (targetId === 'basement_hidden_passage') {
      if (puzzles.portraitSolved) {
        horrorAudio.playDoorCreak();
        transitionToArea('area_03_childrens_room');
      } else {
        displaySubtitle('The brick wall has mechanical seams. The family portraits seem connected to it.');
      }
    }

    // Area 3 Interactions
    else if (targetId === 'nursery_music_box') {
      setIsMusicBoxOpen(true);
    } else if (targetId === 'evelyn_diary') {
      addJournalEntry({
        id: 'clue_music_notes',
        category: 'clues',
        title: 'Nursery Bedtime Lullaby',
        content: 'Note 1 (E) to rest, Note 3 (B) to dream, Note 2 (G) to wake, Note 4 (D) to scream.',
        revealedAt: Date.now(),
      });
      displaySubtitle('Diary note: "1 to rest, 3 to dream, 2 to wake, 4 to scream."');
    } else if (targetId === 'children_mirror') {
      // Mirror reflection horror event
      horrorAudio.playScratching();
      triggerHorrorJumpscare();
      displaySubtitle('Your reflection moved a half-second too late. A silhouette stood behind you!');
    } else if (targetId.startsWith('children_bed_')) {
      displaySubtitle('Old rusted spring bed. Scratch marks are deeply gouged under the wooden headboard.');
    }

    // Area 4 Interactions
    else if (targetId === 'crt_tv_player') {
      if (inventory.some((i) => i.id === 'vhs_tape') || puzzles.musicBoxSolved) {
        setIsVhsPlayerOpen(true);
      } else {
        displaySubtitle('The CRT TV is powered on, waiting for a VHS cassette to be inserted.');
      }
    } else if (targetId === 'pickup_black_candle') {
      addItem('black_candle');
      displaySubtitle('You collected the Tallow Black Candle. It smells of scorched earth.');
    }

    // Area 5 Interactions
    else if (targetId === 'hallway_player_photo') {
      addItem('player_photo');
      addItem('blackwood_seal');
      addJournalEntry({
        id: 'clue_player_memory',
        category: 'mysteries',
        title: 'The House Remembers Me',
        content: 'I found a 1924 photograph with MY own face in the frame. I have always belonged to this house.',
        revealedAt: Date.now(),
      });
      horrorAudio.playWhisper('dont_leave');
      displaySubtitle('Your hands tremble. The photo was taken 100 years ago... and it shows YOU.');
    } else if (targetId === 'crypt_door') {
      horrorAudio.playDoorCreak();
      transitionToArea('area_06_ritual_room');
    }

    // Area 6 Interactions
    else if (targetId.startsWith('altar_')) {
      setIsRitualOpen(true);
    } else if (targetId === 'monolith_seal') {
      displaySubtitle('The monolithic stone wall seals something colossal underneath the mansion.');
    }

    // Area 7 Final Choices
    else if (targetId === 'action_restore_seal') {
      // Restore Seal Ending: Check if secret clues found
      horrorAudio.stopHeartbeat();
      if (secretCluesFound.length >= 3) {
        setEndingType('secret');
      } else {
        setEndingType('good');
      }
      setCurrentArea('ending');
    } else if (targetId === 'action_escape_mansion') {
      // Flight / Normal Ending
      horrorAudio.stopHeartbeat();
      setEndingType('normal');
      setCurrentArea('ending');
    }
  }, [
    lookTarget,
    inventory,
    puzzles,
    addItem,
    addJournalEntry,
    displaySubtitle,
    transitionToArea,
    triggerHorrorJumpscare,
    secretCluesFound.length,
  ]);

  // Keyboard Event Listeners for PC controls
  useEffect(() => {
    if (currentArea === 'menu' || currentArea === 'intro' || currentArea === 'ending') return;

    const activeKeys = new Set<string>();

    const updateMovement = () => {
      let x = 0;
      let y = 0;
      if (activeKeys.has('w') || activeKeys.has('W') || activeKeys.has('ArrowUp')) y += 1;
      if (activeKeys.has('s') || activeKeys.has('S') || activeKeys.has('ArrowDown')) y -= 1;
      if (activeKeys.has('a') || activeKeys.has('A') || activeKeys.has('ArrowLeft')) x -= 1;
      if (activeKeys.has('d') || activeKeys.has('D') || activeKeys.has('ArrowRight')) x += 1;
      setMoveVector({ x, y });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when inside input or modal
      if (
        isInventoryOpen ||
        isJournalOpen ||
        isSettingsOpen ||
        isClockPuzzleOpen ||
        isPortraitPuzzleOpen ||
        isMusicBoxOpen ||
        isVhsPlayerOpen ||
        isRitualOpen
      ) {
        if (e.key === 'Escape') {
          setIsInventoryOpen(false);
          setIsJournalOpen(false);
          setIsSettingsOpen(false);
          setIsClockPuzzleOpen(false);
          setIsPortraitPuzzleOpen(false);
          setIsMusicBoxOpen(false);
          setIsVhsPlayerOpen(false);
          setIsRitualOpen(false);
        }
        return;
      }

      if (e.key === 'Shift') {
        setIsRunning(true);
      }
      if (e.key === 'e' || e.key === 'E') {
        handleInteract();
      }
      if (e.key === 'i' || e.key === 'I') {
        setIsInventoryOpen((prev) => !prev);
      }
      if (e.key === 'j' || e.key === 'J') {
        setIsJournalOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsSettingsOpen(true);
      }

      activeKeys.add(e.key);
      updateMovement();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsRunning(false);
      }
      activeKeys.delete(e.key);
      updateMovement();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    currentArea,
    handleInteract,
    isInventoryOpen,
    isJournalOpen,
    isSettingsOpen,
    isClockPuzzleOpen,
    isPortraitPuzzleOpen,
    isMusicBoxOpen,
    isVhsPlayerOpen,
    isRitualOpen,
  ]);

  // Mouse Move listener for PC look
  useEffect(() => {
    if (currentArea === 'menu' || currentArea === 'intro' || currentArea === 'ending') return;

    let isMouseDown = false;
    let lastX = 0;
    let lastY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isMouseDown = true;
        lastX = e.clientX;
        lastY = e.clientY;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement) {
        // Pointer locked mode
        setLookDelta({ x: e.movementX, y: e.movementY });
        setTimeout(() => setLookDelta({ x: 0, y: 0 }), 30);
      } else if (isMouseDown) {
        // Click and drag fallback
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        setLookDelta({ x: dx, y: dy });
        setTimeout(() => setLookDelta({ x: 0, y: 0 }), 30);
      }
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [currentArea]);

  // Handle New Game start
  const handleStartNewGame = () => {
    setInventory([]);
    setJournal(INITIAL_JOURNAL_ENTRIES);
    setPuzzles(DEFAULT_PUZZLES);
    setSecretCluesFound([]);
    setCurrentArea('intro');
  };

  // Handle Continue Game
  const handleContinueGame = () => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setCurrentArea(data.area || 'area_01_entrance');
        setInventory(data.inventory || []);
        setJournal(data.journal || INITIAL_JOURNAL_ENTRIES);
        setPuzzles(data.puzzles || DEFAULT_PUZZLES);
        setSecretCluesFound(data.secretCluesFound || []);
        horrorAudio.startAmbientDrone(0.4);
      }
    } catch {
      handleStartNewGame();
    }
  };

  return (
    <main id="app-root" className="relative w-screen h-screen overflow-hidden bg-black text-white select-none">
      {/* 1. Main Menu */}
      {currentArea === 'menu' && (
        <MainMenu
          onStartNewGame={handleStartNewGame}
          onContinueGame={handleContinueGame}
          hasSavedGame={hasSavedGame}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenCredits={() => setIsCreditsOpen(true)}
        />
      )}

      {/* 2. Opening Intro Sequence */}
      {currentArea === 'intro' && (
        <OpeningSequence
          isMobile={isMobile}
          onStandUp={() => {
            transitionToArea('area_01_entrance');
          }}
        />
      )}

      {/* 3. Main 3D First-Person Gameplay Experience */}
      {currentArea !== 'menu' && currentArea !== 'intro' && currentArea !== 'ending' && (
        <>
          <ThreeCanvas
            currentArea={currentArea}
            settings={settings}
            moveVector={moveVector}
            lookDelta={lookDelta}
            isRunning={isRunning}
            onLookAt={setLookTarget}
            triggerScare={triggerScare}
            activeHorrorEvent={activeHorrorEvent}
            onFootstep={() => {
              horrorAudio.playFootstep(currentArea === 'area_02_basement' || currentArea === 'area_06_ritual_room' ? 'concrete' : 'wood');
            }}
          />

          {/* Minimal Immersive HUD */}
          <HudOverlay
            currentArea={currentArea}
            lookTarget={lookTarget}
            subtitle={subtitle}
            isJumpscare={isJumpscare}
            isMobile={isMobile}
            onOpenPause={() => setIsSettingsOpen(true)}
            reducedFlashing={settings.reducedFlashing}
            activeHorrorEvent={activeHorrorEvent}
          />

          {/* Dedicated Touch Controls for Mobile/Tablet */}
          {isMobile && (
            <MobileControls
              onMove={setMoveVector}
              onLookDelta={(delta) => {
                setLookDelta(delta);
                setTimeout(() => setLookDelta({ x: 0, y: 0 }), 30);
              }}
              onInteract={handleInteract}
              onOpenInventory={() => setIsInventoryOpen(true)}
              onOpenJournal={() => setIsJournalOpen(true)}
              onToggleRun={() => setIsRunning((prev) => !prev)}
              isRunning={isRunning}
              interactPrompt={lookTarget ? lookTarget.prompt : null}
              touchSensitivity={settings.touchSensitivity}
            />
          )}
        </>
      )}

      {/* 4. Ending Screen */}
      {currentArea === 'ending' && (
        <EndingScreen
          ending={endingType}
          secretCluesCount={secretCluesFound.length}
          onRestart={() => setCurrentArea('menu')}
        />
      )}

      {/* Interactive In-Game Modals */}
      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        inventory={inventory}
        onUseItem={(item) => {
          displaySubtitle(`Examined: ${item.name}. ${item.description}`);
        }}
      />

      <JournalModal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        entries={journal}
      />

      {/* Clock 3:17 Puzzle Modal */}
      <ClockPuzzleModal
        isOpen={isClockPuzzleOpen}
        onClose={() => setIsClockPuzzleOpen(false)}
        puzzles={puzzles}
        onSolve={() => {
          setPuzzles((prev) => ({ ...prev, clockSolved: true, clockHour: 3, clockMinute: 17 }));
          addItem('iron_key');
          setSecretCluesFound((prev) => (prev.includes('clock') ? prev : [...prev, 'clock']));
          addJournalEntry({
            id: 'clue_clock_solved',
            category: 'clues',
            title: 'The Clock of 3:17',
            content: 'Setting the clock to 3:17 released an iron key from the hidden gears.',
            revealedAt: Date.now(),
          });
          displaySubtitle('A brass click echoes! The hidden drawer released the Heavy Iron Key!');
          setIsClockPuzzleOpen(false);
        }}
      />

      {/* Portrait Symbols Puzzle Modal */}
      <PortraitPuzzleModal
        isOpen={isPortraitPuzzleOpen}
        onClose={() => setIsPortraitPuzzleOpen(false)}
        puzzles={puzzles}
        onSolve={() => {
          setPuzzles((prev) => ({ ...prev, portraitSolved: true }));
          setSecretCluesFound((prev) => (prev.includes('portrait') ? prev : [...prev, 'portrait']));
          addJournalEntry({
            id: 'clue_portraits_aligned',
            category: 'evidence',
            title: 'Blackwood Vault Passage',
            content: 'Matching the four heraldic symbols shifted the stone wall, revealing the hidden passage.',
            revealedAt: Date.now(),
          });
          displaySubtitle('With a deep rumble, the cellar brick wall grinds open!');
          setIsPortraitPuzzleOpen(false);
        }}
      />

      {/* Music Box Puzzle Modal */}
      <MusicBoxModal
        isOpen={isMusicBoxOpen}
        onClose={() => setIsMusicBoxOpen(false)}
        puzzles={puzzles}
        onSolve={() => {
          setPuzzles((prev) => ({ ...prev, musicBoxSolved: true }));
          addItem('vhs_tape');
          addItem('music_box_cylinder');
          setSecretCluesFound((prev) => (prev.includes('music_box') ? prev : [...prev, 'music_box']));
          addJournalEntry({
            id: 'clue_music_solved',
            category: 'clues',
            title: 'The Forbidden Tape',
            content: 'The music box played its final note. The drawer popped open containing a cassette: "DO NOT WATCH".',
            revealedAt: Date.now(),
          });
          displaySubtitle('The music box finishes its eerie lullaby. You collected the VHS tape: "DO NOT WATCH"!');
          setIsMusicBoxOpen(false);
          transitionToArea('area_04_recording_room');
        }}
      />

      {/* VHS Player Modal */}
      <VhsPlayerModal
        isOpen={isVhsPlayerOpen}
        onClose={() => setIsVhsPlayerOpen(false)}
        onComplete={() => {
          setIsVhsPlayerOpen(false);
          triggerHorrorJumpscare('woman_screaming');
          setPuzzles((prev) => ({ ...prev, vhsWatched: true, turnedAroundAfterVhs: true }));
          displaySubtitle('A terrifying shadow lunged from the doorway and vanished down an impossible hallway!');
          transitionToArea('area_05_hidden_hallway');
        }}
        reducedFlashing={settings.reducedFlashing}
      />

      {/* Ritual Altars Placement Modal */}
      <RitualModal
        isOpen={isRitualOpen}
        onClose={() => setIsRitualOpen(false)}
        inventory={inventory}
        puzzles={puzzles}
        onPlaceItem={(dir, itemId) => {
          setPuzzles((prev) => ({
            ...prev,
            ritualPlacedItems: { ...prev.ritualPlacedItems, [dir]: itemId },
          }));
        }}
        onSolve={() => {
          setPuzzles((prev) => ({ ...prev, ritualSolved: true }));
          setIsRitualOpen(false);
          triggerHorrorJumpscare('ritual_awaken');
          displaySubtitle('THE SEALS SHATTER! THE WOMAN IN THE WALLS EMERGES!');
          transitionToArea('area_07_creatures_lair');
        }}
      />

      {/* Settings / Pause Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        isPauseMode={currentArea !== 'menu' && currentArea !== 'intro' && currentArea !== 'ending'}
        onReturnToMenu={() => {
          setIsSettingsOpen(false);
          setCurrentArea('menu');
        }}
      />

      {/* Credits Modal */}
      <CreditsModal
        isOpen={isCreditsOpen}
        onClose={() => setIsCreditsOpen(false)}
      />
    </main>
  );
}
