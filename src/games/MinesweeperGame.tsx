import React, { useState, useEffect, useCallback } from 'react';
import { GameInfo } from '../types';
import { GameWrapper } from '../components/GameWrapper';
import { useSound } from '../hooks/useSound';
import { Flag, Bomb, Clock, Play } from 'lucide-react';

interface Cell {
  r: number;
  c: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

const NUMBER_COLORS = [
  '',
  'text-blue-400',
  'text-emerald-400',
  'text-rose-400',
  'text-purple-400',
  'text-amber-400',
  'text-cyan-400',
  'text-pink-400',
  'text-red-500',
];

export const MinesweeperGame: React.FC<{ game: GameInfo }> = ({ game }) => {
  const { play } = useSound();
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate'>('beginner');
  const [rows, setRows] = useState(9);
  const [cols, setCols] = useState(9);
  const [totalMines, setTotalMines] = useState(10);

  const [grid, setGrid] = useState<Cell[][]>([]);
  const [firstClickDone, setFirstClickDone] = useState(false);
  const [flagMode, setFlagMode] = useState(false); // For mobile friendly flagging
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [score, setScore] = useState(0);

  // Initialize empty grid
  const initBoard = useCallback((rCount: number, cCount: number) => {
    const newGrid: Cell[][] = [];
    for (let r = 0; r < rCount; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < cCount; c++) {
        row.push({
          r,
          c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        });
      }
      newGrid.push(row);
    }
    return newGrid;
  }, []);

  const resetGame = useCallback(() => {
    const r = difficulty === 'beginner' ? 9 : 12;
    const c = difficulty === 'beginner' ? 9 : 12;
    const m = difficulty === 'beginner' ? 10 : 22;

    setRows(r);
    setCols(c);
    setTotalMines(m);
    setGrid(initBoard(r, c));
    setFirstClickDone(false);
    setIsGameOver(false);
    setIsPaused(false);
    setHasWon(false);
    setSeconds(0);
    setScore(0);
  }, [difficulty, initBoard]);

  useEffect(() => {
    resetGame();
  }, [difficulty, resetGame]);

  // Timer interval
  useEffect(() => {
    if (!firstClickDone || isPaused || isGameOver) return;
    const timer = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [firstClickDone, isPaused, isGameOver]);

  // Populate mines ensuring first clicked cell and its neighbors are SAFE
  const populateMines = (initialGrid: Cell[][], safeR: number, safeC: number) => {
    const board = initialGrid.map(row => row.map(cell => ({ ...cell })));
    let placed = 0;

    while (placed < totalMines) {
      const randR = Math.floor(Math.random() * rows);
      const randC = Math.floor(Math.random() * cols);

      // Must not be the safe cell or immediate neighbor
      const isNearSafe = Math.abs(randR - safeR) <= 1 && Math.abs(randC - safeC) <= 1;

      if (!board[randR][randC].isMine && !isNearSafe) {
        board[randR][randC].isMine = true;
        placed++;
      }
    }

    // Compute neighbor mine counts
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!board[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
                count++;
              }
            }
          }
          board[r][c].neighborMines = count;
        }
      }
    }

    return board;
  };

  // Flood reveal empty cells
  const floodReveal = (board: Cell[][], startR: number, startC: number) => {
    const queue: [number, number][] = [[startR, startC]];
    board[startR][startC].isRevealed = true;

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      if (board[r][c].neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              const neighbor = board[nr][nc];
              if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
                neighbor.isRevealed = true;
                if (neighbor.neighborMines === 0) {
                  queue.push([nr, nc]);
                }
              }
            }
          }
        }
      }
    }
  };

  // Toggle flag
  const toggleFlag = (r: number, c: number) => {
    if (isGameOver || isPaused || grid[r][c].isRevealed) return;
    play('flag');
    setGrid(prev => {
      const updated = prev.map(row => row.map(cell => ({ ...cell })));
      updated[r][c].isFlagged = !updated[r][c].isFlagged;
      return updated;
    });
  };

  // Handle cell click (reveal or flag depending on flagMode)
  const handleCellClick = (r: number, c: number) => {
    if (isGameOver || isPaused) return;

    if (flagMode) {
      toggleFlag(r, c);
      return;
    }

    const currentCell = grid[r][c];
    if (currentCell.isFlagged || currentCell.isRevealed) return;

    let activeGrid = grid;
    if (!firstClickDone) {
      activeGrid = populateMines(grid, r, c);
      setFirstClickDone(true);
    }

    const cell = activeGrid[r][c];

    // Detonated Mine!
    if (cell.isMine) {
      play('hit');
      // Reveal all mines
      const revealedAll = activeGrid.map(row =>
        row.map(c => (c.isMine ? { ...c, isRevealed: true } : c))
      );
      setGrid(revealedAll);
      setIsGameOver(true);
      return;
    }

    // Safe reveal
    play('click');
    const updated = activeGrid.map(row => row.map(c => ({ ...c })));
    floodReveal(updated, r, c);
    setGrid(updated);

    // Check Victory condition: all non-mine cells revealed
    let nonMinesRemaining = 0;
    for (let rowIdx = 0; rowIdx < rows; rowIdx++) {
      for (let colIdx = 0; colIdx < cols; colIdx++) {
        if (!updated[rowIdx][colIdx].isMine && !updated[rowIdx][colIdx].isRevealed) {
          nonMinesRemaining++;
        }
      }
    }

    if (nonMinesRemaining === 0) {
      setHasWon(true);
      play('win');
      const basePoints = difficulty === 'intermediate' ? 800 : 400;
      const finalScore = Math.max(100, basePoints - seconds * 2);
      setScore(finalScore);
      setIsGameOver(true);
    }
  };

  const flaggedCount = grid.flat().filter(c => c.isFlagged).length;
  const remainingMines = Math.max(0, totalMines - flaggedCount);

  return (
    <GameWrapper
      game={game}
      score={score}
      isGameOver={isGameOver}
      isPaused={isPaused}
      onPauseToggle={() => setIsPaused(p => !p)}
      onRestart={resetGame}
      gameOverDetails={
        hasWon
          ? `Victory! All hidden mines were skillfully isolated in ${seconds}s!`
          : 'Boom! You detonated a cyber mine. Sweep carefully next time!'
      }
      isVictory={hasWon}
    >
      <div className="flex flex-col items-center justify-center w-full max-w-sm sm:max-w-md mx-auto select-none">
        
        {/* Top Control Bar: Difficulty, Mine count, Flag toggle, Timer */}
        <div className="flex items-center justify-between w-full mb-3 px-1 text-xs font-semibold">
          {/* Difficulty toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setDifficulty('beginner')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                difficulty === 'beginner' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              9x9
            </button>
            <button
              onClick={() => setDifficulty('intermediate')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                difficulty === 'intermediate' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              12x12
            </button>
          </div>

          {/* Mine count & Timer */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-rose-400">
              <Bomb className="w-3.5 h-3.5" />
              <span className="font-mono text-sm font-bold tabular-nums">{remainingMines}</span>
            </div>
            <div className="flex items-center gap-1 text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono text-sm tabular-nums">{seconds}s</span>
            </div>
          </div>

          {/* Flag Mode Toggle button for touch devices */}
          <button
            onClick={() => setFlagMode(f => !f)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-all ${
              flagMode
                ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-500/30'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle Flagging Mode"
          >
            <Flag className={`w-3.5 h-3.5 ${flagMode ? 'fill-white' : ''}`} />
            <span>{flagMode ? 'Flagging' : 'Digging'}</span>
          </button>
        </div>

        {/* Minesweeper Grid */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
          <div
            className="grid gap-1 bg-slate-950 p-1.5 rounded-xl"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            }}
          >
            {grid.map(row =>
              row.map(cell => {
                let cellContent = null;
                let bgStyle = 'bg-slate-800 hover:bg-slate-700/80 border-slate-700';

                if (cell.isRevealed) {
                  if (cell.isMine) {
                    bgStyle = 'bg-rose-900/90 border-rose-600 text-white';
                    cellContent = <Bomb className="w-4 h-4 text-rose-300" />;
                  } else {
                    bgStyle = 'bg-slate-900/90 border-slate-900';
                    if (cell.neighborMines > 0) {
                      cellContent = (
                        <span className={`font-black font-mono text-sm sm:text-base ${NUMBER_COLORS[cell.neighborMines]}`}>
                          {cell.neighborMines}
                        </span>
                      );
                    }
                  }
                } else if (cell.isFlagged) {
                  bgStyle = 'bg-slate-800 border-rose-500/60';
                  cellContent = <Flag className="w-4 h-4 text-rose-400 fill-rose-400" />;
                }

                return (
                  <button
                    key={`${cell.r}-${cell.c}`}
                    onClick={() => handleCellClick(cell.r, cell.c)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      toggleFlag(cell.r, cell.c);
                    }}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center transition-all duration-75 active:scale-95 ${bgStyle}`}
                    aria-label={`Cell at ${cell.r}, ${cell.c}`}
                  >
                    {cellContent}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Mobile helper tip */}
        <p className="text-[11px] text-slate-500 mt-2 text-center">
          Tap "Flagging" button above to switch between digging safe squares and marking mines.
        </p>

      </div>
    </GameWrapper>
  );
};
