import React, { useState, useEffect, useCallback } from 'react';
import { GameInfo } from '../types';
import { GameWrapper } from '../components/GameWrapper';
import { useSound } from '../hooks/useSound';
import { getRandomTargetWord, ALL_VALID_WORDS } from '../utils/wordList';
import { Delete, CornerDownLeft, Play } from 'lucide-react';

type LetterState = 'correct' | 'present' | 'absent' | 'empty';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

export const WordGuessGame: React.FC<{ game: GameInfo }> = ({ game }) => {
  const { play } = useSound();
  const [targetWord, setTargetWord] = useState<string>(getRandomTargetWord);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [shakeRow, setShakeRow] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const resetGame = useCallback(() => {
    setTargetWord(getRandomTargetWord());
    setGuesses([]);
    setCurrentGuess('');
    setIsGameOver(false);
    setIsPaused(false);
    setHasWon(false);
    setScore(0);
    setShakeRow(false);
    setToastMessage(null);
    setHasStarted(true);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setShakeRow(true);
    setTimeout(() => setShakeRow(false), 500);
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Evaluate letters in a guess row
  const getRowLetterStates = useCallback((guess: string, target: string): LetterState[] => {
    const states: LetterState[] = Array(5).fill('absent');
    const targetArr = target.split('');
    const guessArr = guess.split('');

    // First pass: mark correct greens
    for (let i = 0; i < 5; i++) {
      if (guessArr[i] === targetArr[i]) {
        states[i] = 'correct';
        targetArr[i] = '#'; // Mark used
      }
    }

    // Second pass: mark yellow presents
    for (let i = 0; i < 5; i++) {
      if (states[i] !== 'correct') {
        const foundIdx = targetArr.indexOf(guessArr[i]);
        if (foundIdx !== -1) {
          states[i] = 'present';
          targetArr[foundIdx] = '#'; // Mark used
        }
      }
    }

    return states;
  }, []);

  // Compute keyboard letter states
  const keyStates: Record<string, LetterState> = {};
  guesses.forEach(guess => {
    const states = getRowLetterStates(guess, targetWord);
    guess.split('').forEach((letter, i) => {
      const currentState = keyStates[letter];
      const newState = states[i];
      if (currentState === 'correct') return;
      if (currentState === 'present' && newState === 'absent') return;
      keyStates[letter] = newState;
    });
  });

  // Handle typing key
  const handleKeyInput = useCallback((key: string) => {
    if (isGameOver || isPaused || !hasStarted) return;

    if (key === 'ENTER') {
      if (currentGuess.length !== 5) {
        showToast('Not enough letters');
        play('hit');
        return;
      }
      if (!ALL_VALID_WORDS.has(currentGuess)) {
        showToast('Not in word list');
        play('hit');
        return;
      }

      play('flip');
      const nextGuesses = [...guesses, currentGuess];
      setGuesses(nextGuesses);
      setCurrentGuess('');

      if (currentGuess === targetWord) {
        setHasWon(true);
        play('win');
        // Points: 600 for 1st guess down to 100 for 6th guess
        const points = Math.max(100, 700 - nextGuesses.length * 100);
        setScore(points);
        setIsGameOver(true);
      } else if (nextGuesses.length >= 6) {
        play('gameover');
        setIsGameOver(true);
      }
      return;
    }

    if (key === 'BACKSPACE') {
      if (currentGuess.length > 0) {
        setCurrentGuess(prev => prev.slice(0, -1));
        play('move');
      }
      return;
    }

    if (/^[A-Z]$/.test(key)) {
      if (currentGuess.length < 5) {
        setCurrentGuess(prev => prev + key);
        play('click');
      }
    }
  }, [isGameOver, isPaused, hasStarted, currentGuess, guesses, targetWord, play]);

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleKeyInput('ENTER');
      } else if (e.key === 'Backspace') {
        handleKeyInput('BACKSPACE');
      } else {
        const letter = e.key.toUpperCase();
        if (/^[A-Z]$/.test(letter) && letter.length === 1) {
          handleKeyInput(letter);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyInput]);

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
          ? `${guesses.length} Guesses! You unmasked the secret word "${targetWord}"!`
          : `The mystery word was "${targetWord}". Better luck next time!`
      }
      isVictory={hasWon}
    >
      <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto select-none">
        
        {/* Toast Warning */}
        {toastMessage && (
          <div className="absolute top-2 z-30 px-3 py-1.5 rounded-lg bg-white text-slate-900 text-xs font-bold shadow-lg animate-in fade-in">
            {toastMessage}
          </div>
        )}

        {/* 6x5 Word Guess Grid */}
        <div className="relative grid grid-rows-6 gap-2 mb-4">
          {Array.from({ length: 6 }).map((_, rowIdx) => {
            const isCurrentRow = rowIdx === guesses.length;
            const guess = guesses[rowIdx] || (isCurrentRow ? currentGuess : '');
            const states = guesses[rowIdx] ? getRowLetterStates(guesses[rowIdx], targetWord) : [];

            return (
              <div
                key={rowIdx}
                className={`grid grid-cols-5 gap-2 ${
                  isCurrentRow && shakeRow ? 'animate-shake' : ''
                }`}
              >
                {Array.from({ length: 5 }).map((_, colIdx) => {
                  const letter = guess[colIdx] || '';
                  const state = states[colIdx] || 'empty';

                  let cellStyle = 'bg-slate-900 border-slate-700/80 text-white';
                  if (state === 'correct') {
                    cellStyle = 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-500/20';
                  } else if (state === 'present') {
                    cellStyle = 'bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-500/20';
                  } else if (state === 'absent') {
                    cellStyle = 'bg-slate-800 border-slate-700 text-slate-400';
                  } else if (letter) {
                    cellStyle = 'bg-slate-900 border-cyan-400 text-white scale-105';
                  }

                  return (
                    <div
                      key={colIdx}
                      className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl border-2 flex items-center justify-center text-xl sm:text-2xl font-black transition-all duration-200 ${cellStyle}`}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Start Screen Overlay */}
          {!hasStarted && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-10">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="text-xl font-bold text-white mb-2">Word Hunt</h3>
              <p className="text-xs text-slate-400 mb-6 max-w-xs">
                Guess the secret 5-letter word in 6 tries! Green means correct spot, yellow means wrong spot.
              </p>
              <button
                onClick={resetGame}
                className="py-3 px-8 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-white" />
                Play Now
              </button>
            </div>
          )}
        </div>

        {/* On-Screen Virtual Keyboard */}
        <div className="flex flex-col gap-1.5 w-full max-w-sm mt-1">
          {KEYBOARD_ROWS.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5">
              {row.map(key => {
                const state = keyStates[key];
                let keyStyle = 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700';
                if (state === 'correct') keyStyle = 'bg-emerald-600 text-white border-emerald-500';
                else if (state === 'present') keyStyle = 'bg-amber-600 text-white border-amber-500';
                else if (state === 'absent') keyStyle = 'bg-slate-900 text-slate-500 border-slate-800';

                const isSpecial = key === 'ENTER' || key === 'BACKSPACE';

                return (
                  <button
                    key={key}
                    onClick={() => handleKeyInput(key)}
                    className={`h-11 sm:h-12 rounded-lg font-bold text-xs sm:text-sm border transition-all active:scale-95 flex items-center justify-center ${
                      isSpecial ? 'px-2.5 sm:px-3 text-[11px]' : 'flex-1 max-w-[34px] sm:max-w-[38px]'
                    } ${keyStyle}`}
                  >
                    {key === 'BACKSPACE' ? <Delete className="w-4 h-4" /> : key === 'ENTER' ? <CornerDownLeft className="w-4 h-4" /> : key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

      </div>
    </GameWrapper>
  );
};
