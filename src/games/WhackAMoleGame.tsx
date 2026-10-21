import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameInfo } from '../types';
import { GameWrapper } from '../components/GameWrapper';
import { useSound } from '../hooks/useSound';
import { Clock, Zap, Play } from 'lucide-react';

type MoleType = 'NORMAL' | 'GOLDEN' | 'BOMB' | null;

interface MoleHole {
  id: number;
  type: MoleType;
  whacked: boolean;
}

export const WhackAMoleGame: React.FC<{ game: GameInfo }> = ({ game }) => {
  const { play } = useSound();
  const [holes, setHoles] = useState<MoleHole[]>(() =>
    Array.from({ length: 9 }, (_, i) => ({ id: i, type: null, whacked: false }))
  );

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [combo, setCombo] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [floatingPoints, setFloatingPoints] = useState<{ id: number; text: string; x: number; y: number }[]>([]);

  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetGame = useCallback(() => {
    setHoles(Array.from({ length: 9 }, (_, i) => ({ id: i, type: null, whacked: false })));
    setScore(0);
    setTimeLeft(30);
    setCombo(1);
    setIsGameOver(false);
    setIsPaused(false);
    setHasStarted(true);
    setFloatingPoints([]);
  }, []);

  // 1-second countdown clock
  useEffect(() => {
    if (!hasStarted || isPaused || isGameOver) return;
    if (timeLeft <= 0) {
      play('win');
      setIsGameOver(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, isPaused, isGameOver, timeLeft, play]);

  // Mole spawner loop
  useEffect(() => {
    if (!hasStarted || isPaused || isGameOver) return;

    const spawnMole = () => {
      const emptyHoles = holes.map((h, i) => (h.type === null ? i : null)).filter((v): v is number => v !== null);
      if (emptyHoles.length > 0) {
        const chosenHole = emptyHoles[Math.floor(Math.random() * emptyHoles.length)];
        const rand = Math.random();
        let moleType: MoleType = 'NORMAL';
        if (rand < 0.18) moleType = 'GOLDEN';
        else if (rand < 0.35) moleType = 'BOMB';

        setHoles(prev =>
          prev.map(h => (h.id === chosenHole ? { ...h, type: moleType, whacked: false } : h))
        );

        // Disappear after interval if not whacked
        const stayDuration = moleType === 'GOLDEN' ? 700 : 900;
        setTimeout(() => {
          setHoles(prev =>
            prev.map(h => (h.id === chosenHole && !h.whacked ? { ...h, type: null } : h))
          );
        }, stayDuration);
      }

      const nextDelay = Math.floor(Math.random() * 300) + 400;
      spawnTimerRef.current = setTimeout(spawnMole, nextDelay);
    };

    spawnTimerRef.current = setTimeout(spawnMole, 400);

    return () => {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    };
  }, [hasStarted, isPaused, isGameOver, holes]);

  // Whack handler
  const whack = (holeId: number) => {
    if (isPaused || isGameOver || !hasStarted) return;
    const hole = holes.find(h => h.id === holeId);
    if (!hole || !hole.type || hole.whacked) return;

    // Mark whacked
    setHoles(prev => prev.map(h => (h.id === holeId ? { ...h, whacked: true } : h)));

    if (hole.type === 'NORMAL') {
      play('hit');
      const pts = 10 * combo;
      setScore(s => s + pts);
      setCombo(c => Math.min(4, c + 1));
      triggerFloating(`+${pts}`, holeId);
    } else if (hole.type === 'GOLDEN') {
      play('combo');
      const pts = 50 * combo;
      setScore(s => s + pts);
      setTimeLeft(t => Math.min(45, t + 2));
      triggerFloating(`+${pts} & +2s!`, holeId);
    } else if (hole.type === 'BOMB') {
      play('gameover');
      setScore(s => Math.max(0, s - 25));
      setCombo(1);
      triggerFloating(`-25 Bomb!`, holeId);
    }

    // Clear hole shortly
    setTimeout(() => {
      setHoles(prev => prev.map(h => (h.id === holeId ? { ...h, type: null, whacked: false } : h)));
    }, 200);
  };

  const triggerFloating = (text: string, holeId: number) => {
    const id = Date.now() + Math.random();
    setFloatingPoints(prev => [...prev, { id, text, x: holeId % 3, y: Math.floor(holeId / 3) }]);
    setTimeout(() => {
      setFloatingPoints(prev => prev.filter(p => p.id !== id));
    }, 800);
  };

  return (
    <GameWrapper
      game={game}
      score={score}
      isGameOver={isGameOver}
      isPaused={isPaused}
      onPauseToggle={() => setIsPaused(p => !p)}
      onRestart={resetGame}
      gameOverDetails={`Time is up! You whacked your way to ${score} points with ${combo}x max combo!`}
      isVictory={score >= 300}
    >
      <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto select-none">
        
        {/* HUD row: Timer & Combo */}
        <div className="flex items-center justify-between w-full mb-3 px-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Time:</span>
            <span className="text-white font-mono text-sm tabular-nums">{timeLeft}s</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Combo:</span>
            <span className="text-cyan-400 font-mono text-sm font-bold">{combo}x</span>
          </div>
        </div>

        {/* 3x3 Mole Holes Grid */}
        <div className="relative grid grid-cols-3 gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-[320px] h-[320px] sm:w-[360px] sm:h-[360px]">
          {holes.map(hole => {
            return (
              <button
                key={hole.id}
                onClick={() => whack(hole.id)}
                className="relative rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800/80 shadow-inner flex items-center justify-center overflow-hidden active:scale-95 transition-transform"
                aria-label={`Hole ${hole.id + 1}`}
              >
                {/* Hole ring */}
                <div className="absolute inset-x-2 bottom-2 h-4 rounded-full bg-slate-950/80 border border-slate-800" />

                {/* Mole Sprite */}
                {hole.type && (
                  <div
                    className={`relative z-10 flex flex-col items-center transition-all duration-150 transform ${
                      hole.whacked ? 'scale-75 translate-y-4 opacity-50' : 'scale-100 translate-y-0 animate-in slide-in-from-bottom-6'
                    }`}
                  >
                    <span className="text-4xl sm:text-5xl drop-shadow-lg">
                      {hole.type === 'NORMAL' && '🤖'}
                      {hole.type === 'GOLDEN' && '👑'}
                      {hole.type === 'BOMB' && '💣'}
                    </span>
                  </div>
                )}
              </button>
            );
          })}

          {/* Floating point indicators */}
          {floatingPoints.map(fp => (
            <div
              key={fp.id}
              className="absolute z-20 pointer-events-none text-sm font-black text-amber-400 drop-shadow-md animate-bounce"
              style={{
                left: `${fp.x * 33 + 12}%`,
                top: `${fp.y * 33 + 10}%`,
              }}
            >
              {fp.text}
            </div>
          ))}

          {/* Start Overlay */}
          {!hasStarted && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="text-5xl mb-3">🔨</div>
              <h3 className="text-xl font-bold text-white mb-2">Cyber Whack</h3>
              <p className="text-xs text-slate-400 mb-6 max-w-xs">
                Whack the cyber bots as fast as you can in 30 seconds! Avoid red bomb bots!
              </p>
              <button
                onClick={resetGame}
                className="py-3 px-8 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-white" />
                Start Whacking
              </button>
            </div>
          )}
        </div>

      </div>
    </GameWrapper>
  );
};
