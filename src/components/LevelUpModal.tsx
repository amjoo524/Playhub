import React from 'react';
import { useGame } from '../context/GameContext';
import { Sparkles, Trophy, X } from 'lucide-react';

export const LevelUpModal: React.FC = () => {
  const { levelUpInfo, dismissLevelUp, profile } = useGame();

  if (!levelUpInfo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 via-[#131b2e] to-slate-900 border border-purple-500/50 rounded-2xl p-6 text-center shadow-2xl shadow-purple-500/20">
        <button
          onClick={dismissLevelUp}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-amber-400 flex items-center justify-center text-4xl shadow-lg shadow-purple-500/40 animate-bounce">
          {profile.avatar}
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>LEVEL UP!</span>
        </div>

        <h3 className="text-2xl font-black text-white tracking-tight mb-1">
          Rank {levelUpInfo.level} Achieved!
        </h3>
        <p className="text-sm text-slate-300 mb-6">
          Congratulations, {profile.username}! Your arcade prowess is ascending. Keep playing to unlock more badges and perks.
        </p>

        <button
          onClick={dismissLevelUp}
          className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-lg shadow-purple-500/30 transition-all transform active:scale-95"
        >
          Continue Playing
        </button>
      </div>
    </div>
  );
};
