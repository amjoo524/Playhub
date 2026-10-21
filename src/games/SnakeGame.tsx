import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameInfo } from '../types';
import { GameWrapper } from '../components/GameWrapper';
import { MobileControls } from '../components/MobileControls';
import { useSound } from '../hooks/useSound';
import { Play } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

const GRID_SIZE = 20;

export const SnakeGame: React.FC<{ game: GameInfo }> = ({ game }) => {
  const { play } = useSound();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [hasStarted, setHasStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);

  // Snake state
  const snakeRef = useRef<Point[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const dirRef = useRef<Point>({ x: 0, y: -1 });
  const nextDirRef = useRef<Point>({ x: 0, y: -1 });
  const foodRef = useRef<Point>({ x: 5, y: 5 });
  const goldenFoodRef = useRef<Point | null>(null);
  const goldenTimerRef = useRef<number>(0);
  const speedRef = useRef<number>(140);
  const lastUpdateRef = useRef<number>(0);
  const reqIdRef = useRef<number>(0);

  // Spawn food avoiding snake
  const spawnFood = useCallback((): Point => {
    while (true) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      const collides = snakeRef.current.some(segment => segment.x === x && segment.y === y);
      if (!collides) return { x, y };
    }
  }, []);

  const resetGame = useCallback(() => {
    snakeRef.current = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ];
    dirRef.current = { x: 0, y: -1 };
    nextDirRef.current = { x: 0, y: -1 };
    foodRef.current = spawnFood();
    goldenFoodRef.current = null;
    goldenTimerRef.current = 0;
    speedRef.current = 140;
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setHasStarted(true);
  }, [spawnFood]);

  const changeDirection = useCallback((dx: number, dy: number) => {
    if (!hasStarted) {
      setHasStarted(true);
    }
    // Prevent 180 degree immediate reversal
    if (dirRef.current.x + dx === 0 && dirRef.current.y + dy === 0) return;
    nextDirRef.current = { x: dx, y: dy };
    play('move');
  }, [hasStarted, play]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === ' ' && hasStarted && !isGameOver) {
        setIsPaused(p => !p);
        return;
      }
      if (isPaused || isGameOver) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          changeDirection(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          changeDirection(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          changeDirection(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          changeDirection(1, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStarted, isPaused, isGameOver, changeDirection]);

  // Touch Swipe detection
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
        if (dx > 0) changeDirection(1, 0);
        else changeDirection(-1, 0);
      } else {
        if (dy > 0) changeDirection(0, 1);
        else changeDirection(0, -1);
      }
    }
    touchStartRef.current = null;
  };

  // Main Game Loop
  useEffect(() => {
    if (!hasStarted || isPaused || isGameOver) return;

    const gameLoop = (timestamp: number) => {
      if (timestamp - lastUpdateRef.current >= speedRef.current) {
        lastUpdateRef.current = timestamp;

        dirRef.current = nextDirRef.current;
        const head = { ...snakeRef.current[0] };
        head.x += dirRef.current.x;
        head.y += dirRef.current.y;

        // Wall collision check
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          play('gameover');
          setIsGameOver(true);
          return;
        }

        // Self collision check
        if (snakeRef.current.some(s => s.x === head.x && s.y === head.y)) {
          play('gameover');
          setIsGameOver(true);
          return;
        }

        const newSnake = [head, ...snakeRef.current];

        // Check Food Collision
        if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
          play('eat');
          setScore(s => s + 10);
          foodRef.current = spawnFood();
          // Speed up slightly as snake grows
          speedRef.current = Math.max(65, speedRef.current - 2);

          // Chance to spawn golden food
          if (!goldenFoodRef.current && Math.random() < 0.25) {
            goldenFoodRef.current = spawnFood();
            goldenTimerRef.current = 45; // ~6 seconds
          }
        } else if (goldenFoodRef.current && head.x === goldenFoodRef.current.x && head.y === goldenFoodRef.current.y) {
          play('combo');
          setScore(s => s + 50);
          goldenFoodRef.current = null;
        } else {
          newSnake.pop();
        }

        // Countdown golden food timer
        if (goldenFoodRef.current) {
          goldenTimerRef.current -= 1;
          if (goldenTimerRef.current <= 0) {
            goldenFoodRef.current = null;
          }
        }

        snakeRef.current = newSnake;
      }

      // Draw frame on canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const cellSize = canvas.width / GRID_SIZE;

          // Clear background
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Subtle Grid Lines
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          for (let i = 0; i <= GRID_SIZE; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, canvas.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(canvas.width, i * cellSize);
            ctx.stroke();
          }

          // Draw regular food (glowing emerald orb)
          ctx.save();
          ctx.fillStyle = '#10b981';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(
            foodRef.current.x * cellSize + cellSize / 2,
            foodRef.current.y * cellSize + cellSize / 2,
            cellSize / 2.6,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.restore();

          // Draw golden food if active (pulsing amber)
          if (goldenFoodRef.current) {
            ctx.save();
            ctx.fillStyle = '#fbbf24';
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 18;
            ctx.beginPath();
            ctx.arc(
              goldenFoodRef.current.x * cellSize + cellSize / 2,
              goldenFoodRef.current.y * cellSize + cellSize / 2,
              cellSize / 2.3,
              0,
              Math.PI * 2
            );
            ctx.fill();
            ctx.restore();
          }

          // Draw Snake
          snakeRef.current.forEach((seg, index) => {
            ctx.save();
            if (index === 0) {
              // Snake Head (Cyan Glow)
              ctx.fillStyle = '#06b6d4';
              ctx.shadowColor = '#06b6d4';
              ctx.shadowBlur = 12;
            } else {
              // Snake Body (Cyan to Indigo gradient)
              ctx.fillStyle = '#38bdf8';
              ctx.shadowBlur = 0;
            }

            const pad = 1.5;
            ctx.beginPath();
            ctx.roundRect(
              seg.x * cellSize + pad,
              seg.y * cellSize + pad,
              cellSize - pad * 2,
              cellSize - pad * 2,
              4
            );
            ctx.fill();

            // Eye dots on head
            if (index === 0) {
              ctx.fillStyle = '#ffffff';
              const eyeRadius = cellSize * 0.12;
              let eye1X = seg.x * cellSize + cellSize * 0.3;
              let eye1Y = seg.y * cellSize + cellSize * 0.3;
              let eye2X = seg.x * cellSize + cellSize * 0.7;
              let eye2Y = seg.y * cellSize + cellSize * 0.3;

              if (dirRef.current.y === 1) {
                eye1Y = seg.y * cellSize + cellSize * 0.7;
                eye2Y = seg.y * cellSize + cellSize * 0.7;
              } else if (dirRef.current.x === -1) {
                eye1X = seg.x * cellSize + cellSize * 0.3;
                eye1Y = seg.y * cellSize + cellSize * 0.3;
                eye2X = seg.x * cellSize + cellSize * 0.3;
                eye2Y = seg.y * cellSize + cellSize * 0.7;
              } else if (dirRef.current.x === 1) {
                eye1X = seg.x * cellSize + cellSize * 0.7;
                eye1Y = seg.y * cellSize + cellSize * 0.3;
                eye2X = seg.x * cellSize + cellSize * 0.7;
                eye2Y = seg.y * cellSize + cellSize * 0.7;
              }

              ctx.beginPath();
              ctx.arc(eye1X, eye1Y, eyeRadius, 0, Math.PI * 2);
              ctx.arc(eye2X, eye2Y, eyeRadius, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          });
        }
      }

      reqIdRef.current = requestAnimationFrame(gameLoop);
    };

    reqIdRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(reqIdRef.current);
  }, [hasStarted, isPaused, isGameOver, play, spawnFood]);

  return (
    <GameWrapper
      game={game}
      score={score}
      isGameOver={isGameOver}
      isPaused={isPaused}
      onPauseToggle={() => setIsPaused(p => !p)}
      onRestart={resetGame}
      gameOverDetails={`Your cyber snake reached length ${snakeRef.current.length}!`}
    >
      <div 
        className="relative flex flex-col items-center justify-center w-full select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Canvas Display */}
        <div className="relative p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] rounded-xl block max-w-full"
          />

          {/* Start Screen Overlay */}
          {!hasStarted && (
            <div className="absolute inset-0 bg-slate-950/80 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
              <div className="text-5xl mb-3 animate-pulse">🐍</div>
              <h3 className="text-2xl font-black text-white mb-2">Ready to Slither?</h3>
              <p className="text-xs text-slate-400 mb-6 max-w-xs">
                Use Arrow keys, W/A/S/D, or swipe to steer. Eat neon orbs to grow!
              </p>
              <button
                onClick={resetGame}
                className="py-3 px-8 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-white" />
                Start Game
              </button>
            </div>
          )}
        </div>

        {/* Mobile Touch Controls */}
        <MobileControls
          onUp={() => changeDirection(0, -1)}
          onDown={() => changeDirection(0, 1)}
          onLeft={() => changeDirection(-1, 0)}
          onRight={() => changeDirection(1, 0)}
        />
      </div>
    </GameWrapper>
  );
};
