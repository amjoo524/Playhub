import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameInfo } from '../types';
import { GameWrapper } from '../components/GameWrapper';
import { MobileControls } from '../components/MobileControls';
import { useSound } from '../hooks/useSound';
import { RotateCcw, Undo2, Play, Sparkles } from 'lucide-react';

type Grid = number[][];

const TILE_COLORS: Record<number, { bg: string; text: string; glow?: string }> = {
  2: { bg: 'bg-slate-800', text: 'text-slate-100' },
  4: { bg: 'bg-slate-700', text: 'text-slate-100' },
  8: { bg: 'bg-amber-600', text: 'text-white', glow: 'shadow-amber-500/30' },
  16: { bg: 'bg-orange-600', text: 'text-white', glow: 'shadow-orange-500/30' },
  32: { bg: 'bg-rose-600', text: 'text-white', glow: 'shadow-rose-500/30' },
  64: { bg: 'bg-red-600', text: 'text-white', glow: 'shadow-red-500/40' },
  128: { bg: 'bg-yellow-500', text: 'text-slate-900', glow: 'shadow-yellow-400/50' },
  256: { bg: 'bg-yellow-400', text: 'text-slate-900', glow: 'shadow-yellow-300/60' },
  512: { bg: 'bg-emerald-500', text: 'text-white', glow: 'shadow-emerald-400/60' },
  1024: { bg: 'bg-cyan-500', text: 'text-white', glow: 'shadow-cyan-400/60' },
  2048: { bg: 'bg-purple-600', text: 'text-white', glow: 'shadow-purple-500/80' },
  4096: { bg: 'bg-fuchsia-600', text: 'text-white', glow: 'shadow-fuchsia-500/90' },
};

function createEmptyGrid(): Grid {
  return [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
}

function addRandomTile(grid: Grid): Grid {
  const emptyCoords: { r: number; c: number }[] = [];
  grid.forEach((row, r) => {
    row.forEach((val, c) => {
      if (val === 0) emptyCoords.push({ r, c });
    });
  });

  if (emptyCoords.length === 0) return grid;
  const { r, c } = emptyCoords[Math.floor(Math.random() * emptyCoords.length)];
  const newGrid = grid.map(row => [...row]);
  newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newGrid;
}

export const Game2048: React.FC<{ game: GameInfo }> = ({ game }) => {
  const { play } = useSound();
  const [grid, setGrid] = useState<Grid>(() => {
    let g = createEmptyGrid();
    g = addRandomTile(g);
    g = addRandomTile(g);
    return g;
  });

  const [score, setScore] = useState(0);
  const [previousState, setPreviousState] = useState<{ grid: Grid; score: number } | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasWon2048, setHasWon2048] = useState(false);

  const resetGame = useCallback(() => {
    let g = createEmptyGrid();
    g = addRandomTile(g);
    g = addRandomTile(g);
    setGrid(g);
    setScore(0);
    setPreviousState(null);
    setIsGameOver(false);
    setIsPaused(false);
    setHasWon2048(false);
    setHasStarted(true);
  }, []);

  const handleUndo = useCallback(() => {
    if (!previousState) return;
    setGrid(previousState.grid);
    setScore(previousState.score);
    setPreviousState(null);
    setIsGameOver(false);
    play('move');
  }, [previousState, play]);

  // Check game over
  const checkGameOver = useCallback((currentGrid: Grid): boolean => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentGrid[r][c] === 0) return false;
        if (r < 3 && currentGrid[r][c] === currentGrid[r + 1][c]) return false;
        if (c < 3 && currentGrid[r][c] === currentGrid[r][c + 1]) return false;
      }
    }
    return true;
  }, []);

  // Slide & Merge logic
  const move = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (isGameOver || isPaused) return;
    if (!hasStarted) setHasStarted(true);

    let rotated = grid.map(row => [...row]);
    let pointsGained = 0;
    let didMerge = false;

    // Helper: rotate matrix counter-clockwise
    const rotate = (matrix: Grid): Grid => {
      const N = matrix.length;
      const res = createEmptyGrid();
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          res[N - 1 - c][r] = matrix[r][c];
        }
      }
      return res;
    };

    // Normalize orientation so we always slide LEFT
    let rotations = 0;
    if (direction === 'UP') rotations = 1;
    else if (direction === 'RIGHT') rotations = 2;
    else if (direction === 'DOWN') rotations = 3;

    for (let i = 0; i < rotations; i++) {
      rotated = rotate(rotated);
    }

    // Slide and merge left
    const newRotated = rotated.map(row => {
      const nonZero = row.filter(val => val !== 0);
      const merged: number[] = [];
      for (let i = 0; i < nonZero.length; i++) {
        if (i < nonZero.length - 1 && nonZero[i] === nonZero[i + 1]) {
          const sum = nonZero[i] * 2;
          merged.push(sum);
          pointsGained += sum;
          didMerge = true;
          if (sum === 2048 && !hasWon2048) {
            setHasWon2048(true);
            play('win');
          }
          i++; // Skip merged partner
        } else {
          merged.push(nonZero[i]);
        }
      }
      while (merged.length < 4) {
        merged.push(0);
      }
      return merged;
    });

    // Rotate back to original orientation
    let finalGrid = newRotated;
    const reverseRotations = (4 - rotations) % 4;
    for (let i = 0; i < reverseRotations; i++) {
      finalGrid = rotate(finalGrid);
    }

    // Check if board changed
    const boardChanged = JSON.stringify(grid) !== JSON.stringify(finalGrid);
    if (boardChanged) {
      setPreviousState({ grid, score });
      const gridWithNewTile = addRandomTile(finalGrid);
      setGrid(gridWithNewTile);
      setScore(s => s + pointsGained);

      if (didMerge) {
        play('score');
      } else {
        play('move');
      }

      if (checkGameOver(gridWithNewTile)) {
        play('gameover');
        setIsGameOver(true);
      }
    }
  }, [grid, score, isGameOver, isPaused, hasStarted, hasWon2048, checkGameOver, play]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'u' || e.key === 'U') {
        handleUndo();
        return;
      }
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          move('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          move('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          move('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          move('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move, handleUndo]);

  // Swipe listener on touch devices
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || isPaused || isGameOver) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) > 25) {
      if (absX > absY) {
        if (dx > 0) move('RIGHT');
        else move('LEFT');
      } else {
        if (dy > 0) move('DOWN');
        else move('UP');
      }
    }
    touchStartRef.current = null;
  };

  // Find max tile
  let maxTile = 0;
  grid.forEach(row => row.forEach(val => { if (val > maxTile) maxTile = val; }));

  return (
    <GameWrapper
      game={game}
      score={score}
      isGameOver={isGameOver}
      isPaused={isPaused}
      onPauseToggle={() => setIsPaused(p => !p)}
      onRestart={resetGame}
      gameOverDetails={`No more legal moves! Your highest tile was ${maxTile}.`}
      isVictory={hasWon2048}
    >
      <div 
        className="flex flex-col items-center justify-center w-full select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Game Toolbar */}
        <div className="flex items-center justify-between w-full max-w-[340px] sm:max-w-[400px] mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Max Tile:</span>
            <span className="text-sm font-bold text-amber-400 font-mono">{maxTile}</span>
          </div>

          <button
            onClick={handleUndo}
            disabled={!previousState}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              previousState
                ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700 shadow-sm cursor-pointer'
                : 'bg-slate-900/40 text-slate-600 border-slate-800/40 cursor-not-allowed'
            }`}
            title="Undo last move"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
        </div>

        {/* 2048 Grid Board */}
        <div className="relative p-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-[320px] h-[320px] sm:w-[380px] sm:h-[380px]">
          <div className="grid grid-cols-4 grid-rows-4 gap-2.5 w-full h-full">
            {grid.map((row, r) =>
              row.map((val, c) => {
                const styleInfo = TILE_COLORS[val] || { bg: 'bg-fuchsia-700', text: 'text-white' };
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`relative rounded-xl flex items-center justify-center font-black transition-all duration-150 select-none ${
                      val === 0
                        ? 'bg-slate-800/50'
                        : `${styleInfo.bg} ${styleInfo.text} shadow-md ${styleInfo.glow || ''} scale-100 animate-in zoom-in-75`
                    }`}
                  >
                    {val > 0 && (
                      <span className={`tabular-nums ${val >= 1024 ? 'text-lg sm:text-xl' : val >= 128 ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'}`}>
                        {val}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Start Overlay */}
          {!hasStarted && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-10">
              <div className="text-4xl mb-2 font-black text-amber-400">2048</div>
              <h3 className="text-xl font-bold text-white mb-2">Slide & Merge</h3>
              <p className="text-xs text-slate-400 mb-6 max-w-xs">
                Use arrow keys, W/A/S/D, or swipe to slide matching numbers together!
              </p>
              <button
                onClick={resetGame}
                className="py-3 px-8 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                Play Now
              </button>
            </div>
          )}
        </div>

        {/* Mobile Touch Controls */}
        <MobileControls
          onUp={() => move('UP')}
          onDown={() => move('DOWN')}
          onLeft={() => move('LEFT')}
          onRight={() => move('RIGHT')}
        />
      </div>
    </GameWrapper>
  );
};
