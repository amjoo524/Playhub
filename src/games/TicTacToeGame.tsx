import React, { useState, useCallback } from 'react';
import { GameInfo } from '../types';
import { GameWrapper } from '../components/GameWrapper';
import { useSound } from '../hooks/useSound';
import { User, Bot, Users, RotateCcw } from 'lucide-react';

type Player = 'X' | 'O';
type Board = (Player | null)[];

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

function checkWinner(board: Board): { winner: Player | 'DRAW' | null; combo: number[] | null } {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combo };
    }
  }
  if (board.every(cell => cell !== null)) {
    return { winner: 'DRAW', combo: null };
  }
  return { winner: null, combo: null };
}

// Minimax algorithm for unbeatable AI
function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  aiPlayer: Player,
  humanPlayer: Player
): { score: number; bestMove?: number } {
  const result = checkWinner(board);
  if (result.winner === aiPlayer) return { score: 10 - depth };
  if (result.winner === humanPlayer) return { score: depth - 10 };
  if (result.winner === 'DRAW') return { score: 0 };

  const emptyIndices = board
    .map((val, idx) => (val === null ? idx : null))
    .filter((v): v is number => v !== null);

  if (isMaximizing) {
    let maxEval = -Infinity;
    let bestMove = emptyIndices[0];
    for (const idx of emptyIndices) {
      board[idx] = aiPlayer;
      const evaluation = minimax(board, depth + 1, false, aiPlayer, humanPlayer).score;
      board[idx] = null;
      if (evaluation > maxEval) {
        maxEval = evaluation;
        bestMove = idx;
      }
    }
    return { score: maxEval, bestMove };
  } else {
    let minEval = Infinity;
    let bestMove = emptyIndices[0];
    for (const idx of emptyIndices) {
      board[idx] = humanPlayer;
      const evaluation = minimax(board, depth + 1, true, aiPlayer, humanPlayer).score;
      board[idx] = null;
      if (evaluation < minEval) {
        minEval = evaluation;
        bestMove = idx;
      }
    }
    return { score: minEval, bestMove };
  }
}

export const TicTacToeGame: React.FC<{ game: GameInfo }> = ({ game }) => {
  const { play } = useSound();
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [turn, setTurn] = useState<Player>('X');
  const [mode, setMode] = useState<'easy' | 'hard' | 'pvp'>('hard');
  const [score, setScore] = useState<number>(0);
  const [winStreak, setWinStreak] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [winnerInfo, setWinnerInfo] = useState<{ winner: Player | 'DRAW' | null; combo: number[] | null }>({
    winner: null,
    combo: null
  });

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setTurn('X');
    setIsGameOver(false);
    setIsPaused(false);
    setWinnerInfo({ winner: null, combo: null });
  }, []);

  const makeMove = useCallback((index: number, playerToMove: Player, currentBoard: Board) => {
    if (currentBoard[index] !== null) return null;
    const newBoard = [...currentBoard];
    newBoard[index] = playerToMove;
    setBoard(newBoard);
    play('move');

    const result = checkWinner(newBoard);
    if (result.winner) {
      setWinnerInfo(result);
      setIsGameOver(true);
      if (result.winner === 'X' || (mode === 'pvp' && result.winner !== 'DRAW')) {
        play('win');
        const points = mode === 'hard' ? 150 : 100;
        setScore(s => s + points);
        setWinStreak(ws => ws + 1);
      } else if (result.winner === 'DRAW') {
        play('score');
        setScore(s => s + 30);
      } else {
        play('gameover');
        setWinStreak(0);
      }
      return newBoard;
    }

    const nextTurn = playerToMove === 'X' ? 'O' : 'X';
    setTurn(nextTurn);
    return newBoard;
  }, [mode, play]);

  // Handle cell click
  const handleCellClick = (index: number) => {
    if (board[index] || isGameOver || isPaused) return;

    if (mode === 'pvp') {
      makeMove(index, turn, board);
      return;
    }

    // Single Player vs AI (User is X, AI is O)
    if (turn !== 'X') return;
    const newBoard = makeMove(index, 'X', board);
    if (!newBoard) return;

    const outcome = checkWinner(newBoard);
    if (outcome.winner) return;

    // AI Turn with small natural delay
    setTimeout(() => {
      let aiIndex: number | undefined;
      const emptyIndices = newBoard
        .map((v, i) => (v === null ? i : null))
        .filter((v): v is number => v !== null);

      if (mode === 'easy') {
        // Random move with 30% chance of blocking
        aiIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      } else {
        // Minimax Hard Unbeatable Move
        const mm = minimax([...newBoard], 0, true, 'O', 'X');
        aiIndex = mm.bestMove ?? emptyIndices[0];
      }

      if (aiIndex !== undefined) {
        makeMove(aiIndex, 'O', newBoard);
      }
    }, 350);
  };

  const getGameOverMessage = () => {
    if (winnerInfo.winner === 'DRAW') return 'Well matched! A classic stalemate draw.';
    if (mode === 'pvp') return `Player ${winnerInfo.winner} claims victory!`;
    if (winnerInfo.winner === 'X') {
      return mode === 'hard' ? 'Hard Win! Incredible strategic victory against the Minimax AI!' : 'You won the match! Nicely played.';
    }
    return 'The AI outmaneuvered you this round. Try again!';
  };

  return (
    <GameWrapper
      game={game}
      score={score}
      isGameOver={isGameOver}
      isPaused={isPaused}
      onPauseToggle={() => setIsPaused(p => !p)}
      onRestart={resetGame}
      gameOverDetails={getGameOverMessage()}
      isVictory={winnerInfo.winner === 'X'}
    >
      <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto select-none">
        
        {/* Game Mode Selector Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl mb-4 text-xs font-semibold">
          <button
            onClick={() => { setMode('hard'); resetGame(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              mode === 'hard' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Hard AI</span>
          </button>
          <button
            onClick={() => { setMode('easy'); resetGame(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              mode === 'easy' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Easy AI</span>
          </button>
          <button
            onClick={() => { setMode('pvp'); resetGame(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              mode === 'pvp' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>2-Player</span>
          </button>
        </div>

        {/* Turn Status Indicator */}
        <div className="flex items-center justify-between w-full mb-3 px-2 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-2">
            <span>Turn:</span>
            <span className={`font-bold text-sm ${turn === 'X' ? 'text-cyan-400' : 'text-rose-400'}`}>
              Player {turn} {mode !== 'pvp' && (turn === 'X' ? '(You)' : '(AI)')}
            </span>
          </div>
          <div>
            Win Streak: <span className="font-bold text-amber-400 font-mono">{winStreak}</span>
          </div>
        </div>

        {/* 3x3 Grid Board */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl w-[300px] h-[300px] sm:w-[330px] sm:h-[330px]">
          {board.map((cell, idx) => {
            const isWinningCell = winnerInfo.combo?.includes(idx);
            return (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                disabled={cell !== null || isGameOver || (mode !== 'pvp' && turn === 'O')}
                className={`relative rounded-xl text-4xl sm:text-5xl font-black flex items-center justify-center transition-all ${
                  isWinningCell
                    ? 'bg-emerald-500/30 border-2 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/30'
                    : cell === null
                    ? 'bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 active:scale-95'
                    : 'bg-slate-800/90 border border-slate-700 cursor-default'
                }`}
                aria-label={`Cell ${idx + 1}: ${cell || 'Empty'}`}
              >
                {cell === 'X' && (
                  <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                    X
                  </span>
                )}
                {cell === 'O' && (
                  <span className="text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                    O
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </GameWrapper>
  );
};
