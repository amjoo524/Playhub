import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Award, X } from 'lucide-react';

export const AchievementToast: React.FC = () => {
  const { newAchievementToast, dismissAchievementToast } = useGame();

  useEffect(() => {
    if (!newAchievementToast) return;
    const timer = setTimeout(() => {
      dismissAchievementToast();
    }, 4500);
    return () => clearTimeout(timer);
  }, [newAchievementToast, dismissAchievementToast]);

  if (!newAchievementToast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900/95 border border-amber-500/60 rounded-xl p-4 shadow-2xl shadow-amber-500/20 backdrop-blur-md flex items-start gap-3.5 animate-in slide-in-from-bottom-5 duration-300">
      <div className="w-11 h-11 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0">
        {newAchievementToast.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>Achievement Unlocked</span>
          </div>
          <button
            onClick={dismissAchievementToast}
            className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <h4 className="text-sm font-bold text-white truncate mt-0.5">
          {newAchievementToast.title}
        </h4>
        <p className="text-xs text-amber-300/80 font-medium mt-0.5">
          +{newAchievementToast.xpReward} XP Earned
        </p>
      </div>
    </div>
  );
};
