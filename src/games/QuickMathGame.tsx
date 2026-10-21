import React, { useState, useEffect, useCallback } from 'react';
import { GameInfo } from '../types';
import { GameWrapper } from '../components/GameWrapper';
import { useSound } from '../hooks/useSound';
import { Clock, Zap, Flame, Play } from 'lucide-react';

interface Question {
  text: string;
  options: number[];
  answer: number;
}

function generateQuestion(): Question {
  const operations = ['+', '-', '*', '/'];
  const op = operations[Math.floor(Math.random() * operations.length)];

  let num1 = 0;
  let num2 = 0;
  let answer = 0;

  switch (op) {
    case '+':
      num1 = Math.floor(Math.random() * 45) + 5;
      num2 = Math.floor(Math.random() * 45) + 5;
      answer = num1 + num2;
      break;
    case '-':
      num1 = Math.floor(Math.random() * 50) + 20;
      num2 = Math.floor(Math.random() * (num1 - 5)) + 5;
      answer = num1 - num2;
      break;
    case '*':
      num1 = Math.floor(Math.random() * 12) + 2;
      num2 = Math.floor(Math.random() * 12) + 2;
      answer = num1 * num2;
      break;
    case '/':
      num2 = Math.floor(Math.random() * 11) + 2;
      answer = Math.floor(Math.random() * 12) + 1;
      num1 = num2 * answer;
      break;
  }

  // Generate 3 plausible distractors
  const distractors = new Set<number>();
  while (distractors.size < 3) {
    const offset = (Math.floor(Math.random() * 6) + 1) * (Math.random() < 0.5 ? 1 : -1);
    const candidate = answer + offset;
    if (candidate !== answer && candidate >= 0) {
      distractors.add(candidate);
    }
  }

  const options = [answer, ...Array.from(distractors)].sort(() => Math.random() - 0.5);

  return {
    text: `${num1} ${op === '*' ? '×' : op === '/' ? '÷' : op} ${num2}`,
    options,
    answer,
  };
}

export const QuickMathGame: React.FC<{ game: GameInfo }> = ({ game }) => {
  const { play } = useSound();
  const [currentQuestion, setCurrentQuestion] = useState<Question>(generateQuestion);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<{ val: number; isCorrect: boolean } | null>(null);

  const resetGame = useCallback(() => {
    setCurrentQuestion(generateQuestion());
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(45);
    setIsGameOver(false);
    setIsPaused(false);
    setHasStarted(true);
    setSelectedAnswer(null);
  }, []);

  // 1-second interval timer
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

  // Answer selection handler
  const handleAnswer = useCallback((chosen: number) => {
    if (isGameOver || isPaused || !hasStarted || selectedAnswer !== null) return;

    const isCorrect = chosen === currentQuestion.answer;
    setSelectedAnswer({ val: chosen, isCorrect });

    if (isCorrect) {
      play('score');
      const multiplier = Math.min(4, Math.floor(streak / 3) + 1);
      const points = 20 * multiplier;
      setScore(s => s + points);
      setStreak(s => {
        const next = s + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
      setTimeLeft(t => Math.min(60, t + 2)); // +2s reward
    } else {
      play('hit');
      setStreak(0);
      setTimeLeft(t => Math.max(0, t - 3)); // 3s penalty
    }

    setTimeout(() => {
      setCurrentQuestion(generateQuestion());
      setSelectedAnswer(null);
    }, 350);
  }, [isGameOver, isPaused, hasStarted, selectedAnswer, currentQuestion.answer, streak, maxStreak, play]);

  // Number key shortcuts 1, 2, 3, 4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const idx = ['1', '2', '3', '4'].indexOf(e.key);
      if (idx !== -1 && currentQuestion.options[idx] !== undefined) {
        handleAnswer(currentQuestion.options[idx]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion.options, handleAnswer]);

  return (
    <GameWrapper
      game={game}
      score={score}
      isGameOver={isGameOver}
      isPaused={isPaused}
      onPauseToggle={() => setIsPaused(p => !p)}
      onRestart={resetGame}
      gameOverDetails={`Final calculation score: ${score} points with a ${maxStreak} answers streak!`}
      isVictory={score >= 350}
    >
      <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto select-none">
        
        {/* HUD Info */}
        <div className="flex items-center justify-between w-full mb-4 px-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Time:</span>
            <span className="text-white font-mono text-sm tabular-nums">{timeLeft}s</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
            <span className="text-slate-400">Streak:</span>
            <span className="text-orange-400 font-mono text-sm font-bold">{streak}</span>
          </div>
        </div>

        {/* Question Display Card */}
        <div className="relative w-full p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col items-center justify-center min-h-[300px]">
          
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3">
            Solve Fast!
          </div>

          <div className="text-5xl font-black text-white font-mono tracking-tight mb-8 drop-shadow-md">
            {currentQuestion.text} = ?
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {currentQuestion.options.map((option, idx) => {
              let btnStyle = 'bg-slate-800/90 hover:bg-slate-700 text-white border-slate-700';

              if (selectedAnswer) {
                if (option === currentQuestion.answer) {
                  btnStyle = 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/30 scale-105';
                } else if (selectedAnswer.val === option && !selectedAnswer.isCorrect) {
                  btnStyle = 'bg-rose-600 text-white border-rose-400 scale-95';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  disabled={selectedAnswer !== null}
                  className={`py-3.5 px-4 rounded-xl text-xl font-bold font-mono border transition-all active:scale-95 flex items-center justify-between ${btnStyle}`}
                >
                  <span className="text-xs text-slate-400 font-normal">[{idx + 1}]</span>
                  <span>{option}</span>
                  <div className="w-3" />
                </button>
              );
            })}
          </div>

          {/* Start Screen Overlay */}
          {!hasStarted && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-10">
              <div className="text-5xl mb-3">⚡</div>
              <h3 className="text-2xl font-black text-white mb-2">Quick Math Sprint</h3>
              <p className="text-xs text-slate-400 mb-6 max-w-xs">
                Solve as many arithmetic equations as you can before time expires. Streaks multiply your score!
              </p>
              <button
                onClick={resetGame}
                className="py-3 px-8 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-white" />
                Start Challenge
              </button>
            </div>
          )}
        </div>

      </div>
    </GameWrapper>
  );
};
