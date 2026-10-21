# PlayHub — Free Instant Browser Games Platform

PlayHub is a modern, responsive web application offering 10 instant playable browser games with no downloads or signups required. High scores, level progress, player statistics, daily streaks, and achievements are persisted entirely in local storage.

---

## 🕹️ Included Games

1. **Snake**: Classic arcade reflex game with increasing speed, golden apples, swipe, and arrow controls.
2. **2048**: Smooth tile animations, 1-step undo, best score tracker, and keyboard/touch swipes.
3. **Tic Tac Toe**: Pass-and-play local 2-Player mode and Minimax unbeatable AI.
4. **Memory Match**: Card flip game with 3 difficulties (Easy, Medium, Hard), move counter, and timer.
5. **Cyber Bird**: Flappy-style neon arcade flyer with smooth canvas physics and pipe navigation.
6. **Neon Blocks**: Tetris-style falling tetromino game with ghost piece projection, hard drops, and line clears.
7. **Cyber Whack**: 30-second reflex whacking frenzy with combo multipliers and hazard bomb bots.
8. **Quick Math**: Rapid mental arithmetic sprint (+, -, ×, ÷) with streak bonuses and time extensions.
9. **Word Hunt**: Wordle-style 5-letter word puzzle with colored clues and an on-screen keyboard.
10. **Minesweeper**: Strategic deduction with safe first clicks, flood fill, flag mode, and 9x9 / 12x12 grids.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

The app will launch at `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
```

---

## 🎮 How to Add a New Game

Adding a new game to PlayHub is designed to be straightforward and modular:

### Step 1: Create Your Game Component
Create a new file in `src/games/YourNewGame.tsx`:
```tsx
import React, { useState } from 'react';
import { GameInfo } from '../types';
import { GameWrapper } from '../components/GameWrapper';

export const YourNewGame: React.FC<{ game: GameInfo }> = ({ game }) => {
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleRestart = () => {
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
  };

  return (
    <GameWrapper
      game={game}
      score={score}
      isGameOver={isGameOver}
      isPaused={isPaused}
      onPauseToggle={() => setIsPaused(p => !p)}
      onRestart={handleRestart}
      gameOverDetails="Great run!"
    >
      <div className="p-8 text-center">
        {/* Your canvas or interactive React game logic here */}
      </div>
    </GameWrapper>
  );
};
```

### Step 2: Register in `src/data/games.ts`
Add an entry to the `GAMES` array:
```ts
{
  id: 'your-game-id',
  title: 'Your Game Title',
  category: 'Arcade', // 'Arcade' | 'Puzzle' | 'Brain' | 'Casual'
  tagline: 'Catchy one-line summary',
  description: 'Detailed description of gameplay...',
  icon: '⚡',
  color: '#3b82f6',
  accentGradient: 'from-blue-500 to-indigo-700',
  controls: {
    desktop: 'Keyboard instructions',
    mobile: 'Touch instructions'
  },
  rules: ['Rule 1', 'Rule 2'],
  tips: ['Tip 1', 'Tip 2']
}
```

### Step 3: Wire into `src/pages/GamePage.tsx`
Add a case in `GamePage.tsx` to mount your component:
```tsx
case 'your-game-id':
  return <YourNewGame game={game} />;
```

That's it! The game will automatically appear on the Home page, Category filters, Search, Leaderboards, and Daily Challenge rotation.
