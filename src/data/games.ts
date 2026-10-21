import { GameInfo } from '../types';

export const GAMES: GameInfo[] = [
  {
    id: 'snake',
    title: 'Snake',
    category: 'Arcade',
    tagline: 'Classic arcade reflex test with increasing speed',
    description: 'Control the hungry snake, gobble up neon energy orbs, and grow longer. Dodge your own tail and walls as the speed ramps up!',
    icon: '🐍',
    color: '#22c55e',
    accentGradient: 'from-emerald-500 to-teal-700',
    controls: {
      desktop: 'Arrow keys or W/A/S/D to change direction · Space to Pause',
      mobile: 'Swipe anywhere or tap on-screen D-Pad arrows'
    },
    rules: [
      'Eat glowing green food (+10 pts) to grow your snake.',
      'Rare golden orbs appear periodically (+50 pts).',
      'Speed increases slightly with every food eaten.',
      'Game over if you collide with the wall or your own body.'
    ],
    tips: [
      'Hug the perimeter to maintain space for your growing tail.',
      'Do not make impulsive 180° turns; plan your zigzag route early.'
    ]
  },
  {
    id: '2048',
    title: '2048',
    category: 'Puzzle',
    tagline: 'Combine matching numbers to reach the legendary 2048 tile',
    description: 'Slide numbered tiles across the 4x4 grid. When two tiles with the same number touch, they merge into one with double value.',
    icon: '🔢',
    color: '#f59e0b',
    accentGradient: 'from-amber-500 to-orange-700',
    controls: {
      desktop: 'Arrow keys or W/A/S/D to slide tiles · U to Undo (1 move)',
      mobile: 'Swipe Up / Down / Left / Right on the board'
    },
    rules: [
      'Tiles slide as far as they can in the chosen direction.',
      'Two adjacent tiles of equal value merge into their sum.',
      'A new 2 or 4 tile spawns after every valid move.',
      'Reach the 2048 tile to win, or continue for the ultimate score!'
    ],
    tips: [
      'Keep your highest-value tile locked in one corner (e.g. bottom-right).',
      'Build a monotonic descending snake along the edges.'
    ]
  },
  {
    id: 'tictactoe',
    title: 'Tic Tac Toe',
    category: 'Casual',
    tagline: 'Classic 3x3 strategy against Minimax AI or a friend',
    description: 'Place your mark to align three in a row horizontally, vertically, or diagonally. Test your wits against the unbeatable Minimax AI or play locally.',
    icon: '❌',
    color: '#06b6d4',
    accentGradient: 'from-cyan-500 to-blue-700',
    controls: {
      desktop: 'Click any empty cell to place your mark',
      mobile: 'Tap any empty cell'
    },
    rules: [
      'Players take turns placing X and O on the 3x3 grid.',
      'First player to align 3 matching marks wins.',
      'If all 9 cells are filled with no 3-in-a-row, it is a draw.'
    ],
    tips: [
      'Take the center or corner on your first move.',
      'Watch out for fork opportunities to guarantee a win.'
    ]
  },
  {
    id: 'memory',
    title: 'Memory Match',
    category: 'Brain',
    tagline: 'Flip and match pairs of colorful holographic cards',
    description: 'Sharpen your photographic memory! Turn over two cards at a time to uncover matching neon game symbols in the fewest moves and fastest time.',
    icon: '🧠',
    color: '#a855f7',
    accentGradient: 'from-purple-500 to-indigo-700',
    controls: {
      desktop: 'Click cards to flip and reveal symbols',
      mobile: 'Tap cards to flip'
    },
    rules: [
      'Flip two cards at a time.',
      'If they match, they stay uncovered.',
      'If they do not match, they flip back after a brief glance.',
      'Clear the entire board as fast as possible.'
    ],
    tips: [
      'Mentally group cards by quadrants to remember locations.',
      'Focus on cards you turn over first before randomly guessing.'
    ]
  },
  {
    id: 'flappy',
    title: 'Flappy Bird',
    category: 'Arcade',
    tagline: 'Classic gravity-defying tap flight through pipes',
    description: 'Keep your bird airborne by tapping or pressing Space. Thread through tight gaps between randomized obstacles without clipping!',
    icon: '🐦',
    color: '#ec4899',
    accentGradient: 'from-amber-500 to-rose-600',
    controls: {
      desktop: 'Spacebar, Arrow Up, or Left Click to flap/jump',
      mobile: 'Tap anywhere on the screen to flap/jump'
    },
    rules: [
      'Each flap gives an upward impulse against continuous gravity.',
      'Pass between the upper and lower pipes for +1 point.',
      'Colliding with any pipe or the ground ends the run.'
    ],
    tips: [
      'Perform rhythmic, small taps rather than waiting until the last second.',
      'Anticipate pipe heights before reaching them.'
    ]
  },
  {
    id: 'tetris',
    title: 'Neon Blocks',
    category: 'Arcade',
    tagline: 'Fast-paced falling tetromino stacker with line clears',
    description: 'Stack descending geometric shapes to form solid horizontal lines without gaps. Clear lines to score points and survive increasing speeds.',
    icon: '🧱',
    color: '#8b5cf6',
    accentGradient: 'from-violet-500 to-purple-800',
    controls: {
      desktop: 'Left / Right to move · Up to Rotate · Down to Soft Drop · Space to Hard Drop',
      mobile: 'On-screen touch controls with rotate & drop buttons'
    },
    rules: [
      'Move and rotate falling tetrominoes into position.',
      'Complete horizontal rows to clear them and score.',
      'Clearing 4 lines at once (Tetris) awards huge combo bonus points.',
      'Game ends when stacked blocks reach the top boundary.'
    ],
    tips: [
      'Keep your stack flat with a 1-wide open column for the straight 4-block I-piece.',
      'Use the ghost piece outline to aim your placement before dropping.'
    ]
  },
  {
    id: 'mole',
    title: 'Cyber Whack',
    category: 'Casual',
    tagline: '30-second rapid reflex frenzy with combo multipliers',
    description: 'Robotic cyber moles are surfacing from their holographic portals! Whack them before they duck back underground. Watch out for hazard bombs!',
    icon: '🔨',
    color: '#eab308',
    accentGradient: 'from-yellow-500 to-amber-700',
    controls: {
      desktop: 'Click moles as soon as they appear · Number keys 1-9 also supported',
      mobile: 'Tap moles directly'
    },
    rules: [
      'Normal moles: +10 pts (stacks combo multiplier up to 4x).',
      'Golden moles: +50 pts and bonus time!',
      'Red Bomb bots: -20 pts and resets your combo multiplier.',
      'Game lasts 30 seconds; maximize your score before time runs out.'
    ],
    tips: [
      'Keep your eyes soft to watch the whole 3x3 grid at once.',
      'Don’t spam clicks carelessly or you will trigger a bomb!'
    ]
  },
  {
    id: 'math',
    title: 'Quick Math',
    category: 'Brain',
    tagline: 'Rapid mental arithmetic speed sprint with streak bonuses',
    description: 'Put your mental math speed to the test! Solve addition, subtraction, multiplication, and division problems against a ticking clock.',
    icon: '⚡',
    color: '#3b82f6',
    accentGradient: 'from-blue-500 to-cyan-700',
    controls: {
      desktop: 'Click answer buttons or press keys 1, 2, 3, 4',
      mobile: 'Tap the correct answer button'
    },
    rules: [
      'Choose the correct answer from 4 options before time expires.',
      'Correct answers grant points and add +2 bonus seconds.',
      'Building a consecutive streak multiplies your point gain.',
      'Wrong answer costs 3 seconds penalty!'
    ],
    tips: [
      'Check the last digit (ones place) first to eliminate wrong choices quickly.',
      'Stay calm — accuracy is worth more than panicked guessing.'
    ]
  },
  {
    id: 'wordle',
    title: 'Word Hunt',
    category: 'Puzzle',
    tagline: 'Crack the mystery 5-letter word in 6 attempts',
    description: 'Guess the hidden 5-letter word! After each guess, colored tiles show how close your letters were to the target solution.',
    icon: '📝',
    color: '#10b981',
    accentGradient: 'from-emerald-500 to-teal-800',
    controls: {
      desktop: 'Type letters using keyboard · Enter to submit · Backspace to erase',
      mobile: 'Tap on-screen virtual keyboard keys'
    },
    rules: [
      'Each guess must be a valid 5-letter English word.',
      '🟩 Green: Letter is in the word and in the correct position.',
      '🟨 Yellow: Letter is in the word but in the wrong spot.',
      '⬛ Gray: Letter is not in the word.',
      'You have 6 attempts to solve the word.'
    ],
    tips: [
      'Start with a vowel-rich word like ARISE, CRANE, or CLOUD.',
      'Avoid reusing gray letters in subsequent guesses.'
    ]
  },
  {
    id: 'minesweeper',
    title: 'Minesweeper',
    category: 'Puzzle',
    tagline: 'Strategic deduction to uncover safe tiles and flag mines',
    description: 'Use numerical clues to uncover all safe cells without detonating any hidden landmines. Toggle Flag mode to mark suspicious coordinates.',
    icon: '💣',
    color: '#ef4444',
    accentGradient: 'from-red-500 to-rose-800',
    controls: {
      desktop: 'Left Click to reveal · Right Click to place flag',
      mobile: 'Tap to reveal · Toggle Flag Mode button at the top to place flags'
    },
    rules: [
      'Numbers indicate how many mines surround that cell (including diagonals).',
      'The first click is always guaranteed 100% safe.',
      'Empty cells (0) automatically cascade reveal neighboring tiles.',
      'Win by revealing all safe squares on the board.'
    ],
    tips: [
      'Look for 1s on corners — they directly reveal the adjacent diagonal mine.',
      'Use flags liberally to track verified mine positions.'
    ]
  }
];

export function getGameById(id: string): GameInfo | undefined {
  return GAMES.find(g => g.id === id);
}

// Deterministic daily challenge game selector based on current date
export function getDailyChallengeGame(): { game: GameInfo; dateString: string; bonusXp: number } {
  const now = new Date();
  const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  // Hash the date string to select a game deterministically
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = (hash << 5) - hash + dateString.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % GAMES.length;
  return {
    game: GAMES[index],
    dateString,
    bonusXp: 500
  };
}
