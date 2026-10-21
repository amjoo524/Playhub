import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getGameById } from '../data/games';
import { SnakeGame } from '../games/SnakeGame';
import { Game2048 } from '../games/Game2048';
import { TicTacToeGame } from '../games/TicTacToeGame';
import { MemoryMatchGame } from '../games/MemoryMatchGame';
import { FlappyBirdGame } from '../games/FlappyBirdGame';
import { TetrisGame } from '../games/TetrisGame';
import { WhackAMoleGame } from '../games/WhackAMoleGame';
import { QuickMathGame } from '../games/QuickMathGame';
import { WordGuessGame } from '../games/WordGuessGame';
import { MinesweeperGame } from '../games/MinesweeperGame';

export const GamePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <Navigate to="/" replace />;
  }

  const game = getGameById(id);
  if (!game) {
    return <Navigate to="/404" replace />;
  }

  switch (game.id) {
    case 'snake':
      return <SnakeGame game={game} />;
    case '2048':
      return <Game2048 game={game} />;
    case 'tictactoe':
      return <TicTacToeGame game={game} />;
    case 'memory':
      return <MemoryMatchGame game={game} />;
    case 'flappy':
      return <FlappyBirdGame game={game} />;
    case 'tetris':
      return <TetrisGame game={game} />;
    case 'mole':
      return <WhackAMoleGame game={game} />;
    case 'math':
      return <QuickMathGame game={game} />;
    case 'wordle':
      return <WordGuessGame game={game} />;
    case 'minesweeper':
      return <MinesweeperGame game={game} />;
    default:
      return <Navigate to="/404" replace />;
  }
};
