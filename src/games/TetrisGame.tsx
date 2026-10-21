import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameInfo } from '../types';
import { GameWrapper } from '../components/GameWrapper';
import { MobileControls } from '../components/MobileControls';
import { useSound } from '../hooks/useSound';
import { Play } from 'lucide-react';

const COLS = 10;
const ROWS = 20;

// Tetromino definitions
const SHAPES: Record<string, { shape: number[][]; color: string }> = {
  I: { shape: [[1, 1, 1, 1]], color: '#06b6d4' },
  O: { shape: [[1, 1], [1, 1]], color: '#fbbf24' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#a855f7' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#22c55e' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#ef4444' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#3b82f6' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#f97316' },
};

const TETROMINO_KEYS = Object.keys(SHAPES);

function getRandomTetromino() {
  const key = TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)];
  return {
    type: key,
    shape: SHAPES[key].shape,
    color: SHAPES[key].color,
  };
}

function createEmptyMatrix(): (string | null)[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

export const TetrisGame: React.FC<{ game: GameInfo }> = ({ game }) => {
  const { play } = useSound();
  const [board, setBoard] = useState<(string | null)[][]>(createEmptyMatrix);
  const [currentPiece, setCurrentPiece] = useState(getRandomTetromino);
  const [nextPiece, setNextPiece] = useState(getRandomTetromino);
  const [pos, setPos] = useState({ x: 3, y: 0 });
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [hasStarted, setHasStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Check collision helper
  const checkCollision = useCallback(
    (pieceShape: number[][], offset: { x: number; y: number }, currentBoard: (string | null)[][]): boolean => {
      for (let r = 0; r < pieceShape.length; r++) {
        for (let c = 0; c < pieceShape[r].length; c++) {
          if (pieceShape[r][c]) {
            const newX = offset.x + c;
            const newY = offset.y + r;
            if (newX < 0 || newX >= COLS || newY >= ROWS) {
              return true;
            }
            if (newY >= 0 && currentBoard[newY][newX] !== null) {
              return true;
            }
          }
        }
      }
      return false;
    },
    []
  );

  const resetGame = useCallback(() => {
    setBoard(createEmptyMatrix());
    setCurrentPiece(getRandomTetromino());
    setNextPiece(getRandomTetromino());
    setPos({ x: 3, y: 0 });
    setScore(0);
    setLines(0);
    setLevel(1);
    setIsGameOver(false);
    setIsPaused(false);
    setHasStarted(true);
  }, []);

  // Lock piece and clear lines
  const lockPiece = useCallback(() => {
    setBoard(prevBoard => {
      const newBoard = prevBoard.map(row => [...row]);
      for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
          if (currentPiece.shape[r][c]) {
            const targetY = pos.y + r;
            const targetX = pos.x + c;
            if (targetY >= 0 && targetY < ROWS && targetX >= 0 && targetX < COLS) {
              newBoard[targetY][targetX] = currentPiece.color;
            }
          }
        }
      }

      // Check completed lines
      let cleared = 0;
      const filteredBoard = newBoard.filter(row => {
        const isFull = row.every(cell => cell !== null);
        if (isFull) cleared++;
        return !isFull;
      });

      if (cleared > 0) {
        if (cleared === 4) {
          play('combo');
        } else {
          play('score');
        }

        const emptyRows = Array.from({ length: cleared }, () => Array(COLS).fill(null));
        const finalBoard = [...emptyRows, ...filteredBoard];

        const linePoints = [0, 100, 300, 500, 800][cleared] * level;
        setScore(s => s + linePoints);
        setLines(l => {
          const newLines = l + cleared;
          setLevel(Math.floor(newLines / 10) + 1);
          return newLines;
        });

        return finalBoard;
      }

      return newBoard;
    });

    // Spawn next piece
    const next = nextPiece;
    const nextNext = getRandomTetromino();
    setCurrentPiece(next);
    setNextPiece(nextNext);
    setPos({ x: 3, y: 0 });

    // Check game over
    if (checkCollision(next.shape, { x: 3, y: 0 }, board)) {
      play('gameover');
      setIsGameOver(true);
    }
  }, [currentPiece, pos, board, level, nextPiece, checkCollision, play]);

  // Movement handlers
  const moveHorizontal = useCallback(
    (dir: number) => {
      if (isGameOver || isPaused || !hasStarted) return;
      const newPos = { ...pos, x: pos.x + dir };
      if (!checkCollision(currentPiece.shape, newPos, board)) {
        setPos(newPos);
        play('move');
      }
    },
    [isGameOver, isPaused, hasStarted, pos, currentPiece.shape, board, checkCollision, play]
  );

  const rotatePiece = useCallback(() => {
    if (isGameOver || isPaused || !hasStarted) return;
    const original = currentPiece.shape;
    const rows = original.length;
    const cols = original[0].length;
    const rotated: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        rotated[c][rows - 1 - r] = original[r][c];
      }
    }

    // Try rotation, then basic wall kick left/right
    if (!checkCollision(rotated, pos, board)) {
      setCurrentPiece(p => ({ ...p, shape: rotated }));
      play('rotate');
    } else if (!checkCollision(rotated, { ...pos, x: pos.x - 1 }, board)) {
      setPos(p => ({ ...p, x: p.x - 1 }));
      setCurrentPiece(p => ({ ...p, shape: rotated }));
      play('rotate');
    } else if (!checkCollision(rotated, { ...pos, x: pos.x + 1 }, board)) {
      setPos(p => ({ ...p, x: p.x + 1 }));
      setCurrentPiece(p => ({ ...p, shape: rotated }));
      play('rotate');
    }
  }, [isGameOver, isPaused, hasStarted, currentPiece.shape, pos, board, checkCollision, play]);

  const drop = useCallback(() => {
    if (isGameOver || isPaused || !hasStarted) return;
    const newPos = { ...pos, y: pos.y + 1 };
    if (!checkCollision(currentPiece.shape, newPos, board)) {
      setPos(newPos);
    } else {
      lockPiece();
    }
  }, [isGameOver, isPaused, hasStarted, pos, currentPiece.shape, board, checkCollision, lockPiece]);

  const hardDrop = useCallback(() => {
    if (isGameOver || isPaused || !hasStarted) return;
    let targetY = pos.y;
    while (!checkCollision(currentPiece.shape, { x: pos.x, y: targetY + 1 }, board)) {
      targetY++;
    }
    setPos({ x: pos.x, y: targetY });
    setScore(s => s + (targetY - pos.y) * 2);
    play('hit');
    setTimeout(() => {
      lockPiece();
    }, 50);
  }, [isGameOver, isPaused, hasStarted, pos, currentPiece.shape, board, checkCollision, lockPiece, play]);

  // Tick interval for falling piece
  useEffect(() => {
    if (!hasStarted || isPaused || isGameOver) return;
    const speed = Math.max(120, 800 - (level - 1) * 70);
    const interval = setInterval(drop, speed);
    return () => clearInterval(interval);
  }, [hasStarted, isPaused, isGameOver, level, drop]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
      }
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          moveHorizontal(-1);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          moveHorizontal(1);
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          rotatePiece();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          drop();
          break;
        case ' ':
          hardDrop();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveHorizontal, rotatePiece, drop, hardDrop]);

  // Calculate Ghost Piece position
  let ghostY = pos.y;
  while (!checkCollision(currentPiece.shape, { x: pos.x, y: ghostY + 1 }, board)) {
    ghostY++;
  }

  return (
    <GameWrapper
      game={game}
      score={score}
      isGameOver={isGameOver}
      isPaused={isPaused}
      onPauseToggle={() => setIsPaused(p => !p)}
      onRestart={resetGame}
      gameOverDetails={`Cleared ${lines} lines and reached Level ${level}!`}
    >
      <div className="flex flex-col items-center justify-center w-full select-none">
        
        <div className="flex items-start gap-4 mb-2">
          {/* Main Tetris Grid */}
          <div className="relative p-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
            <div className="grid grid-cols-10 grid-rows-20 gap-0.5 bg-slate-950 p-1 rounded-xl w-[220px] h-[440px] sm:w-[260px] sm:h-[520px]">
              {Array.from({ length: ROWS }).map((_, r) =>
                Array.from({ length: COLS }).map((_, c) => {
                  let cellColor = board[r][c];
                  let isCurrent = false;
                  let isGhost = false;

                  // Check if piece is here
                  const pieceR = r - pos.y;
                  const pieceC = c - pos.x;
                  if (
                    pieceR >= 0 &&
                    pieceR < currentPiece.shape.length &&
                    pieceC >= 0 &&
                    pieceC < currentPiece.shape[0].length &&
                    currentPiece.shape[pieceR][pieceC]
                  ) {
                    isCurrent = true;
                    cellColor = currentPiece.color;
                  }

                  // Check ghost
                  const ghostR = r - ghostY;
                  if (
                    !isCurrent &&
                    ghostR >= 0 &&
                    ghostR < currentPiece.shape.length &&
                    pieceC >= 0 &&
                    pieceC < currentPiece.shape[0].length &&
                    currentPiece.shape[ghostR][pieceC]
                  ) {
                    isGhost = true;
                  }

                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`rounded-xs transition-colors duration-75 ${
                        cellColor
                          ? 'shadow-sm'
                          : isGhost
                          ? 'border border-cyan-500/30 bg-cyan-950/20'
                          : 'bg-slate-900/40 border border-slate-900/60'
                      }`}
                      style={{
                        backgroundColor: cellColor || undefined,
                      }}
                    />
                  );
                })
              )}
            </div>

            {/* Start Overlay */}
            {!hasStarted && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-10">
                <div className="text-4xl mb-3">🧱</div>
                <h3 className="text-xl font-bold text-white mb-2">Neon Blocks</h3>
                <p className="text-xs text-slate-400 mb-6 max-w-[180px]">
                  Rotate, slide, and drop blocks to clear full horizontal rows!
                </p>
                <button
                  onClick={resetGame}
                  className="py-2.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Play
                </button>
              </div>
            )}
          </div>

          {/* Side Panel: Next Piece, Level, Lines */}
          <div className="flex flex-col gap-3 w-24 sm:w-28 text-xs font-semibold">
            {/* Next Piece Card */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <span className="text-[11px] text-slate-400 block mb-2">Next</span>
              <div className="grid grid-cols-4 grid-rows-2 gap-1 w-16 h-8 mx-auto items-center justify-center">
                {nextPiece.shape.map((row, r) =>
                  row.map((val, c) => (
                    <div
                      key={`${r}-${c}`}
                      className={`w-3.5 h-3.5 rounded-xs ${val ? 'shadow-sm' : 'opacity-0'}`}
                      style={{ backgroundColor: val ? nextPiece.color : 'transparent' }}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Level Card */}
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block">Level</span>
              <span className="text-base font-bold font-mono text-cyan-400">{level}</span>
            </div>

            {/* Lines Card */}
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block">Lines</span>
              <span className="text-base font-bold font-mono text-purple-400">{lines}</span>
            </div>

            {/* Quick Hard Drop Button */}
            <button
              onClick={hardDrop}
              className="py-2 px-2 bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 text-white font-bold rounded-xl border border-slate-700 shadow transition-all active:scale-95"
            >
              Hard Drop
            </button>
          </div>
        </div>

        {/* Mobile Touch Controls */}
        <MobileControls
          onUp={rotatePiece}
          onDown={drop}
          onLeft={() => moveHorizontal(-1)}
          onRight={() => moveHorizontal(1)}
          onAction={hardDrop}
          actionLabel="Drop"
          showAction={true}
        />
      </div>
    </GameWrapper>
  );
};
