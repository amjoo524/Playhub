import React, { useState, useEffect, useCallback } from 'react';
import { GameInfo } from '../types';
import { GameWrapper } from '../components/GameWrapper';
import { useSound } from '../hooks/useSound';
import { Clock, Eye, Layers } from 'lucide-react';

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const ALL_SYMBOLS = ['🚀', '👾', '💎', '🔥', '⚡', '🌟', '🎮', '🎯', '🦄', '🏆', '🍕', '🐱'];

export const MemoryMatchGame: React.FC<{ game: GameInfo }> = ({ game }) => {
  const { play } = useSound();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Setup game board based on difficulty
  const setupBoard = useCallback((diff: 'easy' | 'medium' | 'hard') => {
    let pairCount = 8;
    if (diff === 'easy') pairCount = 6;
    if (diff === 'hard') pairCount = 12;

    const selectedSymbols = ALL_SYMBOLS.slice(0, pairCount);
    const deck = [...selectedSymbols, ...selectedSymbols]
      .sort(() => Math.random() - 0.5)
      .map((sym, idx) => ({
        id: idx,
        symbol: sym,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(deck);
    setFlippedCards([]);
    setMoves(0);
    setSeconds(0);
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setIsLocked(false);
  }, []);

  useEffect(() => {
    setupBoard(difficulty);
  }, [difficulty, setupBoard]);

  // Timer interval
  useEffect(() => {
    if (isGameOver || isPaused || cards.length === 0) return;
    const timer = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameOver, isPaused, cards.length]);

  // Handle card click
  const handleCardClick = (cardId: number) => {
    if (isLocked || isPaused || isGameOver) return;
    const clickedCard = cards.find(c => c.id === cardId);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    play('flip');

    // Flip card
    const updatedCards = cards.map(c => (c.id === cardId ? { ...c, isFlipped: true } : c));
    setCards(updatedCards);

    const nextFlipped = [...flippedCards, cardId];
    setFlippedCards(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves(m => m + 1);
      setIsLocked(true);

      const [firstId, secondId] = nextFlipped;
      const firstCard = updatedCards.find(c => c.id === firstId)!;
      const secondCard = updatedCards.find(c => c.id === secondId)!;

      if (firstCard.symbol === secondCard.symbol) {
        // MATCH!
        setTimeout(() => {
          play('combo');
          const matchedDeck = updatedCards.map(c =>
            c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
          );
          setCards(matchedDeck);
          setFlippedCards([]);
          setIsLocked(false);

          // Check if all matched
          const allMatched = matchedDeck.every(c => c.isMatched);
          if (allMatched) {
            play('win');
            const diffBonus = difficulty === 'hard' ? 800 : difficulty === 'medium' ? 500 : 300;
            const finalScore = Math.max(100, diffBonus + matchedDeck.length * 50 - moves * 8 - seconds * 3);
            setScore(finalScore);
            setIsGameOver(true);
          }
        }, 350);
      } else {
        // NO MATCH -> Flip back after delay
        setTimeout(() => {
          setCards(cards.map(c =>
            c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
          ));
          setFlippedCards([]);
          setIsLocked(false);
        }, 850);
      }
    }
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getGridCols = () => {
    if (difficulty === 'easy') return 'grid-cols-4'; // 4x3
    if (difficulty === 'medium') return 'grid-cols-4'; // 4x4
    return 'grid-cols-6'; // 6x4
  };

  return (
    <GameWrapper
      game={game}
      score={score}
      isGameOver={isGameOver}
      isPaused={isPaused}
      onPauseToggle={() => setIsPaused(p => !p)}
      onRestart={() => setupBoard(difficulty)}
      gameOverDetails={seconds < 45 ? 'Fast Clear! Solved in under 45 seconds!' : `Cleared in ${moves} moves and ${formatTime(seconds)}!`}
      isVictory={true}
    >
      <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto select-none">
        
        {/* Controls & Difficulty Bar */}
        <div className="flex items-center justify-between w-full mb-4 px-2">
          {/* Difficulty segmented switch */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold">
            {(['easy', 'medium', 'hard'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`capitalize px-3 py-1.5 rounded-lg transition-colors ${
                  difficulty === d
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Moves & Timer HUD */}
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Moves: <strong className="text-white font-mono">{moves}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-white">{formatTime(seconds)}</span>
            </div>
          </div>
        </div>

        {/* Card Deck Grid */}
        <div className={`grid ${getGridCols()} gap-2.5 sm:gap-3 p-3 sm:p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl w-full`}>
          {cards.map(card => {
            const isRevealed = card.isFlipped || card.isMatched;
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={isRevealed || isLocked}
                className={`aspect-square rounded-xl sm:rounded-2xl text-2xl sm:text-3xl flex items-center justify-center transition-all duration-300 transform ${
                  isRevealed
                    ? card.isMatched
                      ? 'bg-gradient-to-tr from-emerald-950 to-slate-900 border border-emerald-500/50 shadow-md shadow-emerald-500/20 scale-95'
                      : 'bg-gradient-to-tr from-purple-900/90 to-slate-900 border border-purple-500/60 shadow-lg shadow-purple-500/20 scale-100 rotate-y-180'
                    : 'bg-slate-800 hover:bg-slate-700/90 border border-slate-700/80 active:scale-95 cursor-pointer shadow-md'
                }`}
                aria-label={`Card ${card.id + 1}`}
              >
                {isRevealed ? (
                  <span>{card.symbol}</span>
                ) : (
                  <span className="text-slate-600 text-base font-bold">?</span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </GameWrapper>
  );
};
