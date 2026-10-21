import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Play, Medal, Calendar, User } from 'lucide-react';
import { GAMES } from '../data/games';
import { useGame } from '../context/GameContext';

export const LeaderboardPage: React.FC = () => {
  const { getLeaderboard, profile } = useGame();
  const [selectedGameId, setSelectedGameId] = useState<string>('snake');

  const selectedGame = GAMES.find(g => g.id === selectedGameId) || GAMES[0];
  const scores = getLeaderboard(selectedGameId);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4" />
            <span>Local Hall of Fame</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Game Leaderboards
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Top 10 highest personal runs stored on this browser.
          </p>
        </div>

        <Link
          to={`/game/${selectedGame.id}`}
          className="py-2.5 px-5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-lg shadow-purple-500/25 active:scale-95 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Play {selectedGame.title}</span>
        </Link>
      </div>

      {/* Game Selector Tabs (Segmented Control) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto no-scrollbar">
        {GAMES.map(game => (
          <button
            key={game.id}
            onClick={() => setSelectedGameId(game.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              selectedGameId === game.id
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>{game.icon}</span>
            <span>{game.title}</span>
          </button>
        ))}
      </div>

      {/* Leaderboard Table Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-hidden">
        
        {/* Table Header row */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="flex items-center gap-4 sm:gap-8">
            <span className="w-12 text-center">Rank</span>
            <span>Player</span>
          </div>
          <div className="flex items-center gap-6 sm:gap-12">
            <span className="hidden sm:inline">Details</span>
            <span className="w-24 text-right">Score</span>
          </div>
        </div>

        {/* Scores list */}
        {scores.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center text-3xl mb-3">
              {selectedGame.icon}
            </div>
            <h3 className="text-base font-bold text-white mb-1">No Scores Recorded Yet</h3>
            <p className="text-xs text-slate-400 mb-6 max-w-xs">
              Be the first champion to set a record in {selectedGame.title}!
            </p>
            <Link
              to={`/game/${selectedGame.id}`}
              className="py-2.5 px-6 rounded-xl font-bold text-xs text-white bg-cyan-500 hover:bg-cyan-400 transition-colors"
            >
              Play Now
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {scores.map((entry, idx) => {
              const rank = idx + 1;
              let rankBadge = <span className="font-mono text-sm font-bold text-slate-400">#{rank}</span>;
              if (rank === 1) rankBadge = <span className="text-xl">🥇</span>;
              else if (rank === 2) rankBadge = <span className="text-xl">🥈</span>;
              else if (rank === 3) rankBadge = <span className="text-xl">🥉</span>;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between py-3.5 hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-4 sm:gap-8 min-w-0">
                    <div className="w-12 flex justify-center items-center">
                      {rankBadge}
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-bold text-white truncate">
                        {entry.playerName}
                      </span>
                      {entry.date && (
                        <span className="text-[11px] text-slate-500 hidden md:inline">
                          ({entry.date})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 sm:gap-12 shrink-0">
                    <span className="text-xs text-slate-400 hidden sm:inline truncate max-w-[140px]">
                      {entry.details || 'Standard'}
                    </span>
                    <span className="w-24 text-right font-mono font-black text-cyan-400 text-base sm:text-lg tabular-nums">
                      {entry.score.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
