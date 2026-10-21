import React, { useState } from 'react';
import { useGame, AVATARS } from '../context/GameContext';
import { ACHIEVEMENTS } from '../utils/achievementsList';
import { 
  User, Flame, Trophy, Clock, Sparkles, Check, 
  Edit3, Award, Star, ShieldCheck, Zap 
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { profile, updateUsername, updateAvatar } = useGame();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(profile.username);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const handleSaveName = () => {
    if (tempName.trim()) {
      updateUsername(tempName.trim());
    }
    setIsEditingName(false);
  };

  // XP Progress Calculation
  // Level L threshold = 150 * (L-1)^2, Next Level threshold = 150 * L^2
  const currentLevel = profile.level;
  const currentThreshold = 150 * Math.pow(currentLevel - 1, 2);
  const nextThreshold = 150 * Math.pow(currentLevel, 2);
  const xpInCurrentLevel = Math.max(0, profile.xp - currentThreshold);
  const xpNeededForLevel = nextThreshold - currentThreshold;
  const progressPercent = Math.min(100, Math.floor((xpInCurrentLevel / xpNeededForLevel) * 100));

  // Format play time
  const formatPlayTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m ${totalSec % 60}s`;
  };

  const unlockedCount = profile.unlockedAchievements.length;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Profile Overview Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#141b2e] to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          
          {/* Avatar with Picker Trigger */}
          <div className="relative group shrink-0">
            <button
              onClick={() => setShowAvatarPicker(p => !p)}
              className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-cyan-400 p-1 flex items-center justify-center text-5xl shadow-xl shadow-purple-500/30 hover:scale-105 transition-transform"
              title="Click to change avatar"
            >
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                {profile.avatar}
              </div>
            </button>
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-cyan-500 text-slate-950 shadow">
              <Edit3 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* User Details & Level Bar */}
          <div className="flex-1 text-center md:text-left min-w-0">
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    maxLength={20}
                    className="bg-slate-800 border border-cyan-500 rounded-xl px-3 py-1.5 text-lg font-bold text-white focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-2 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate">
                    {profile.username}
                  </h1>
                  <button
                    onClick={() => { setTempName(profile.username); setIsEditingName(true); }}
                    className="p-1 rounded-lg text-slate-500 hover:text-white transition-colors"
                    title="Edit username"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-bold self-center md:self-auto">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span>Level {profile.level}</span>
              </div>
            </div>

            {/* XP Level Progress Bar */}
            <div className="space-y-1.5 mb-6 max-w-md">
              <div className="flex justify-between text-xs text-slate-400">
                <span>XP Progress</span>
                <span className="font-mono text-cyan-400 font-bold tabular-nums">
                  {profile.xp.toLocaleString()} XP
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800/80 overflow-hidden border border-slate-700/60 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500 text-right">
                {nextThreshold - profile.xp} XP until Level {profile.level + 1}
              </div>
            </div>

            {/* Stats Metric Strip */}
            <div className="grid grid-cols-3 gap-3 max-w-lg">
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1 text-amber-400 mb-0.5">
                  <Flame className="w-4 h-4 fill-amber-400" />
                  <span className="text-xs font-semibold">Streak</span>
                </div>
                <div className="text-xl font-black text-white font-mono tabular-nums">
                  {profile.streak} <span className="text-xs text-slate-400 font-normal">days</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1 text-cyan-400 mb-0.5">
                  <Trophy className="w-4 h-4" />
                  <span className="text-xs font-semibold">Played</span>
                </div>
                <div className="text-xl font-black text-white font-mono tabular-nums">
                  {profile.totalGamesPlayed}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1 text-purple-400 mb-0.5">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-semibold">Playtime</span>
                </div>
                <div className="text-xl font-black text-white font-mono tabular-nums">
                  {formatPlayTime(profile.totalPlayTimeSeconds)}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Avatar Picker Modal Dropdown */}
        {showAvatarPicker && (
          <div className="mt-6 pt-6 border-t border-slate-800 animate-in fade-in">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Choose Avatar
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {AVATARS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => { updateAvatar(emoji); setShowAvatarPicker(false); }}
                  className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center transition-all ${
                    profile.avatar === emoji
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 scale-110'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Badges & Achievements Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Achievements & Badges</span>
            </h2>
            <p className="text-xs text-slate-400">
              {unlockedCount} of {ACHIEVEMENTS.length} unlocked ({Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)}%)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACHIEVEMENTS.map(ach => {
            const isUnlocked = profile.unlockedAchievements.includes(ach.id);
            const unlockedDate = profile.achievementDates[ach.id];

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  isUnlocked
                    ? 'bg-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-60'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                    isUnlocked
                      ? 'bg-amber-500/20 border border-amber-500/40 shadow-inner'
                      : 'bg-slate-800/60 border border-slate-700/40 grayscale'
                  }`}
                >
                  {ach.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-sm font-bold text-white truncate">
                      {ach.title}
                    </h4>
                    <span className="text-[11px] font-mono font-bold text-amber-400 shrink-0">
                      +{ach.xpReward} XP
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                    {ach.description}
                  </p>

                  <div className="mt-2 text-[10px] font-medium">
                    {isUnlocked ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Unlocked {unlockedDate ? new Date(unlockedDate).toLocaleDateString() : '✓'}
                      </span>
                    ) : (
                      <span className="text-slate-500">Locked</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
