import { InventoryItem, JournalEntry, EndingType } from '../types';

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'obj_wake_up',
    category: 'objectives',
    title: 'Escape the Mansion',
    content: 'I woke up on the floor of an unfamiliar, decaying mansion. I do not remember how I arrived. The main doors are barred from the outside. I must find another way out.',
    revealedAt: Date.now(),
  },
  {
    id: 'loc_entrance',
    category: 'locations',
    title: 'The Grand Entrance',
    content: 'A once-opulent foyer now covered in thick dust, cobwebs, and decayed wallpaper. A grandfather clock stands frozen in the corner. There is a heavy oak door leading downward.',
    revealedAt: Date.now(),
  },
  {
    id: 'mys_amnesia',
    category: 'mysteries',
    title: 'The Missing Memories',
    content: 'Why does this place feel sickeningly familiar? As if every hallway was waiting for my return.',
    revealedAt: Date.now(),
  }
];

export const INITIAL_ITEMS: Record<string, InventoryItem> = {
  iron_key: {
    id: 'iron_key',
    name: 'Heavy Iron Key',
    category: 'key',
    description: 'A tarnished iron key with a clockwork crest stamped on its bow.',
    lore: 'Found within the hidden mechanism of the grandfather clock. Fits the reinforced basement door.',
    foundInArea: 'area_01_entrance',
  },
  children_photo: {
    id: 'children_photo',
    name: 'Photograph of Four Children',
    category: 'photograph',
    description: 'A black-and-white portrait of four pale children dressed in formal Victorian clothing.',
    lore: 'Handwritten on the back: "Thomas, Clara, Oliver, and little Evelyn. September 1924. Before the walls started whispering."',
    foundInArea: 'area_01_entrance',
  },
  blackwood_journal: {
    id: 'blackwood_journal',
    name: 'Torn Diary Page',
    category: 'note',
    description: 'A page violently ripped from a journal with erratic handwriting.',
    lore: '"The clock halted at 3:17. That was the moment she stopped screaming from behind the plaster. Arthur says we must appease her with the family crests: Owl watches in the dark, Serpent coils below, Moth drawn to fire, Key guards the truth."',
    foundInArea: 'area_02_basement',
  },
  family_pendant: {
    id: 'family_pendant',
    name: 'Blackwood Family Pendant',
    category: 'ritual',
    description: 'Cold silver pendant bearing the ouroboros crest.',
    lore: 'Cold. Older than the mansion itself. The metal feels unnaturally heavy and throbs faintly against your palm.',
    foundInArea: 'area_02_basement',
  },
  music_box_cylinder: {
    id: 'music_box_cylinder',
    name: 'Nursery Music Box',
    category: 'toy',
    description: 'A small wooden music box with an intricately carved porcelain dancer whose head is missing.',
    lore: 'The children used to play a 4-note lullaby to quiet the noises in the ceiling: Note 1 (E), Note 3 (B), Note 2 (G), Note 4 (D).',
    foundInArea: 'area_03_childrens_room',
  },
  vhs_tape: {
    id: 'vhs_tape',
    name: 'Tape: "DO NOT WATCH"',
    category: 'tape',
    description: 'A worn magnetic tape labeled with frantic red marker: "DO NOT WATCH - BLACKWOOD 1989".',
    lore: 'Recovered from the false floor under the nursery beds. The cassette feels damp, as if pulled from standing water.',
    foundInArea: 'area_03_childrens_room',
  },
  black_candle: {
    id: 'black_candle',
    name: 'Tallow Black Candle',
    category: 'ritual',
    description: 'A candle made of pitch-black tallow that emits an acrid, metallic smell.',
    lore: 'Used in the binding rites described in the recording room manuscripts.',
    foundInArea: 'area_04_recording_room',
  },
  player_photo: {
    id: 'player_photo',
    name: 'Disturbing Photograph',
    category: 'photograph',
    description: 'A sepia photograph showing YOU standing in the front hall, taken in 1924.',
    lore: 'How is this possible? The face, the posture, the clothing... you were here a century ago. The house remembers you.',
    foundInArea: 'area_05_hidden_hallway',
  },
  blackwood_seal: {
    id: 'blackwood_seal',
    name: 'Blackwood Ancient Seal',
    category: 'ritual',
    description: 'A heavy lead sigil inscribed with concentric protective runes.',
    lore: 'The keystone for the ancient containment ward beneath the mansion floor.',
    foundInArea: 'area_05_hidden_hallway',
  },
  secret_manuscript: {
    id: 'secret_manuscript',
    name: 'Evelyn\'s Secret Confession',
    category: 'evidence',
    description: 'A hidden parchment sealed in blood and paraffin.',
    lore: '"I didn\'t sacrifice my brothers and sisters. I sealed myself inside the walls to anchor the ward. The entity beneath is older than humanity. If the seal breaks, it will spread to the world."',
    foundInArea: 'secret_clue',
  }
};

export const AREA_METADATA = {
  area_01_entrance: {
    name: 'Abandoned Entrance',
    subTitle: 'Ground Floor Foyer',
    hint: 'Investigate the stopped Grandfather Clock and search the tables for clues.',
  },
  area_02_basement: {
    name: 'Subterranean Basement',
    subTitle: 'Cellar & Storage',
    hint: 'Examine the Blackwood family portraits. Match each family member to their symbolic crest.',
  },
  area_03_childrens_room: {
    name: 'Children\'s Bedroom',
    subTitle: 'Second Floor Nursery',
    hint: 'Inspect the toys, children\'s beds, and mirror. Reconstruct the 4-note music box lullaby.',
  },
  area_04_recording_room: {
    name: 'Old Recording Room',
    subTitle: 'Archive & Surveillance',
    hint: 'Insert the "DO NOT WATCH" tape into the CRT TV player. Prepare yourself.',
  },
  area_05_hidden_hallway: {
    name: 'The Impossible Hallway',
    subTitle: 'Liminal Corridor',
    hint: 'The hallway defies geometry. Follow the whispers and examine the photographs on the shifting walls.',
  },
  area_06_ritual_room: {
    name: 'The Sealed Ritual Chamber',
    subTitle: 'Sub-Crypt Wards',
    hint: 'Place the 4 ritual relics onto their designated cardinal altars to awaken the seal.',
  },
  area_07_creatures_lair: {
    name: 'The Collapse & Escape Route',
    subTitle: 'Warping Foundation',
    hint: 'The Woman in the Walls is pursuing you! Run through the shifting corridors and make your final choice!',
  }
};

export const ENDINGS: Record<EndingType, { title: string; subtitle: string; description: string; epilogue: string }> = {
  good: {
    title: 'THE WARD RESTORED',
    subtitle: 'The Good Ending',
    description: 'You stood your ground amidst the collapsing chamber and locked the ancient Blackwood Seal into place. The stone groans as ancient iron gears grind shut.',
    epilogue: 'The ethereal screams of The Woman in the Walls soften into a peaceful whisper: "Thank you for holding the gate." The mansion falls silent. But as you step into the cold dawn air, you feel a faint fingernail gently scratching the inside of your own coat collar...'
  },
  normal: {
    title: 'FLIGHT INTO THE FOG',
    subtitle: 'The Normal Ending',
    description: 'You smashed through the splintered emergency doors, caring nothing for the ritual or the mystery, and sprinted blindly into the midnight woods.',
    epilogue: 'You survived. The local authorities found no record of the Blackwood estate where you claimed it was. Yet whenever you stand near a closed wall in your home, you can hear four small children laughing quietly inside the drywall...'
  },
  bad: {
    title: 'CONSUMED BY THE MANSION',
    subtitle: 'The Bad Ending',
    description: 'You hesitated in the shifting corridors. Pale, clawed hands surged from the floral wallpaper, dragging you into the suffocating plaster.',
    epilogue: 'A new black-and-white photograph hangs in the Grand Entrance gallery. Dressed in 1920s burial garments, your face stares out frozen in silent terror. The mansion has found its newest resident.'
  },
  secret: {
    title: 'THE ANCIENT GUARDIAN',
    subtitle: 'The Secret Revelation Ending',
    description: 'Having uncovered all hidden diary fragments, you realized the truth: Evelyn was never the monster. She was the sentinel protecting mankind from the eldritch horror sleeping beneath.',
    epilogue: 'You united your will with Evelyn\'s phantom spirit. The subterranean nightmare was crushed back into the abyss. You walk out not as a victim, but as the new eternal Warden of the Blackwood House.'
  }
};
