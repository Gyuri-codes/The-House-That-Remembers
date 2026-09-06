export type GameArea =
  | 'menu'
  | 'intro'
  | 'area_01_entrance'
  | 'area_02_basement'
  | 'area_03_childrens_room'
  | 'area_04_recording_room'
  | 'area_05_hidden_hallway'
  | 'area_06_ritual_room'
  | 'area_07_creatures_lair'
  | 'ending';

export type EndingType = 'good' | 'normal' | 'bad' | 'secret';

export interface InventoryItem {
  id: string;
  name: string;
  category: 'key' | 'photograph' | 'note' | 'toy' | 'tape' | 'puzzle' | 'ritual' | 'evidence';
  description: string;
  lore: string;
  foundInArea: string;
}

export interface JournalEntry {
  id: string;
  category: 'objectives' | 'clues' | 'evidence' | 'characters' | 'locations' | 'mysteries';
  title: string;
  content: string;
  dateStr?: string;
  revealedAt: number;
}

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  mouseSensitivity: number;
  touchSensitivity: number;
  graphicsQuality: 'low' | 'medium' | 'high';
  brightness: number;
  subtitles: boolean;
  cameraShake: boolean;
  reducedFlashing: boolean;
}

export interface HorrorEvent {
  id: string;
  type: 'footsteps' | 'whisper' | 'lights_flicker' | 'shadow_silhouette' | 'creature_peeking' | 'mirror_glitch' | 'door_slam' | 'loud_breathing' | 'jumpscare';
  message?: string;
  intensity: number;
  durationMs: number;
}

export interface PuzzleStates {
  // Area 1: Grandfather Clock stopped at 3:17
  clockHour: number;
  clockMinute: number;
  clockSolved: boolean;
  basementDoorUnlocked: boolean;

  // Area 2: Portrait Symbols (Owl, Serpent, Moth, Key)
  portraitSymbols: {
    arthur: number; // 0..3
    beatrice: number;
    charles: number;
    evelyn: number;
  };
  portraitSolved: boolean;

  // Area 3: Music Box Sequence (1 to 4 notes)
  musicBoxPlayed: number[];
  musicBoxSolved: boolean;

  // Area 4: VHS inserted and played
  vhsInserted: boolean;
  vhsWatched: boolean;
  turnedAroundAfterVhs: boolean;

  // Area 5: Hallway impossible photos examined
  hallwayPhotosExamined: boolean;
  hallwayWhisperTriggered: boolean;

  // Area 6: Ritual Altars
  ritualPlacedItems: {
    north: string | null;
    east: string | null;
    south: string | null;
    west: string | null;
  };
  ritualSolved: boolean;

  // Area 7: Chase & Final Choice
  chaseProgress: number;
  chaseEscaped: boolean;
  sealRestored: boolean;
}

export interface SavedGameData {
  area: GameArea;
  inventory: InventoryItem[];
  journal: JournalEntry[];
  puzzles: PuzzleStates;
  secretCluesFound: string[];
  sanity: number;
  timestamp: number;
}
