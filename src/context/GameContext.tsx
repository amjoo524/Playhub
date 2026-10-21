import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserProfile, HighScore } from '../types';
import { sound } from '../utils/soundEngine';
import { fireCelebrationConfetti, fireLevelUpConfetti } from '../utils/confetti';
import { ACHIEVEMENTS } from '../utils/achievementsList';
import { GAMES, getDailyChallengeGame } from '../data/games';

export const AVATARS = [
  '👾', '🚀', '🦊', '⚡', '🎮', '🐯', '🤖', '👑', '🔥', '💎', '🦄', '🎯'
];

interface GameContextType {
  profile: UserProfile;
  soundMuted: boolean;
  toggleSound: () => void;
  recordGamePlayed: (gameId: string, score: number, details?: string) => { isNewBest: boolean; xpEarned: number; newAchievements: string[] };
  toggleFavorite: (gameId: string) => void;
  isFavorite: (gameId: string) => boolean;
  updateUsername: (username: string) => void;
  updateAvatar: (avatar: string) => void;
  levelUpInfo: { level: number; unlocked: boolean } | null;
  dismissLevelUp: () => void;
  newAchievementToast: { id: string; title: string; icon: string; xpReward: number } | null;
  dismissAchievementToast: () => void;
  getLeaderboard: (gameId: string) => HighScore[];
  claimDailyChallenge: (gameId: string) => boolean;
  dailyChallenge: ReturnType<typeof getDailyChallengeGame>;
}

const DEFAULT_PROFILE: UserProfile = {
  username: 'Player 1',
  avatar: '👾',
  totalGamesPlayed: 0,
  totalPlayTimeSeconds: 0,
  xp: 0,
  level: 1,
  streak: 1,
  lastPlayedDate: '',
  highScores: {},
  leaderboards: {},
  favorites: ['snake', '2048', 'tetris'],
  recentlyPlayed: [],
  unlockedAchievements: [],
  achievementDates: {},
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('playhub_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_PROFILE, ...parsed };
      }
    } catch {
      // fallback
    }
    return DEFAULT_PROFILE;
  });

  const [soundMuted, setSoundMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('playhub_sound_muted') === 'true';
    } catch {
      return false;
    }
  });

  const [levelUpInfo, setLevelUpInfo] = useState<{ level: number; unlocked: boolean } | null>(null);
  const [newAchievementToast, setNewAchievementToast] = useState<{ id: string; title: string; icon: string; xpReward: number } | null>(null);

  // Sync sound muted with soundEngine
  useEffect(() => {
    sound.setMuted(soundMuted);
    try {
      localStorage.setItem('playhub_sound_muted', String(soundMuted));
    } catch {}
  }, [soundMuted]);

  // Persist profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('playhub_user_profile', JSON.stringify(profile));
    } catch {}
  }, [profile]);

  // Playtime interval counter (1 second increments while tab is active)
  useEffect(() => {
    const timer = setInterval(() => {
      setProfile(prev => ({
        ...prev,
        totalPlayTimeSeconds: prev.totalPlayTimeSeconds + 1,
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate streak on mount
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setProfile(prev => {
      if (!prev.lastPlayedDate) {
        return { ...prev, streak: 1, lastPlayedDate: today };
      }
      if (prev.lastPlayedDate === today) {
        return prev;
      }
      const last = new Date(prev.lastPlayedDate);
      const curr = new Date(today);
      const diffDays = Math.floor((curr.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        return { ...prev, streak: prev.streak + 1, lastPlayedDate: today };
      } else if (diffDays > 1) {
        return { ...prev, streak: 1, lastPlayedDate: today };
      }
      return prev;
    });
  }, []);

  const toggleSound = useCallback(() => {
    setSoundMuted(prev => !prev);
  }, []);

  const updateUsername = useCallback((username: string) => {
    setProfile(prev => ({ ...prev, username: username.trim() || 'Player 1' }));
  }, []);

  const updateAvatar = useCallback((avatar: string) => {
    setProfile(prev => ({ ...prev, avatar }));
  }, []);

  const toggleFavorite = useCallback((gameId: string) => {
    setProfile(prev => {
      const exists = prev.favorites.includes(gameId);
      const newFavs = exists
        ? prev.favorites.filter(id => id !== gameId)
        : [...prev.favorites, gameId];
      return { ...prev, favorites: newFavs };
    });
  }, []);

  const isFavorite = useCallback((gameId: string) => {
    return profile.favorites.includes(gameId);
  }, [profile.favorites]);

  const dismissLevelUp = useCallback(() => {
    setLevelUpInfo(null);
  }, []);

  const dismissAchievementToast = useCallback(() => {
    setNewAchievementToast(null);
  }, []);

  const getLeaderboard = useCallback((gameId: string): HighScore[] => {
    return profile.leaderboards[gameId] || [];
  }, [profile.leaderboards]);

  const dailyChallenge = getDailyChallengeGame();

  const claimDailyChallenge = useCallback((gameId: string): boolean => {
    const today = new Date().toISOString().slice(0, 10);
    if (dailyChallenge.game.id === gameId && profile.dailyChallengeCompletedDate !== today) {
      setProfile(prev => {
        const newXp = prev.xp + dailyChallenge.bonusXp;
        const newLevel = Math.floor(Math.sqrt(newXp / 150)) + 1;
        return {
          ...prev,
          xp: newXp,
          level: newLevel,
          dailyChallengeCompletedDate: today,
        };
      });
      fireLevelUpConfetti();
      sound.play('win');
      return true;
    }
    return false;
  }, [dailyChallenge, profile.dailyChallengeCompletedDate]);

  // Main record handler called whenever a game finishes or records a score
  const recordGamePlayed = useCallback((gameId: string, score: number, details?: string) => {
    const today = new Date().toISOString().slice(0, 10);
    let isNewBest = false;
    let earnedXp = Math.max(20, Math.floor(score / 5)); // Base XP for playing + score proportion
    if (score > 0) {
      earnedXp += 30;
    }
    const newlyUnlockedAchievements: string[] = [];

    setProfile(prev => {
      const currentBest = prev.highScores[gameId] || 0;
      if (score > currentBest) {
        isNewBest = true;
      }
      const newBest = Math.max(currentBest, score);

      // Leaderboard insertion
      const currentList = prev.leaderboards[gameId] || [];
      const newEntry: HighScore = {
        score,
        date: today,
        playerName: prev.username,
        details: details || `${score} pts`
      };
      const updatedList = [...currentList, newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      // Recently played
      const updatedRecent = [gameId, ...prev.recentlyPlayed.filter(id => id !== gameId)].slice(0, 6);

      // XP & Level calculations
      const totalXp = prev.xp + earnedXp;
      const prevLevel = prev.level;
      const calculatedLevel = Math.floor(Math.sqrt(totalXp / 150)) + 1;

      // Achievements evaluation
      const unlocked = new Set(prev.unlockedAchievements);
      const achievementDates = { ...prev.achievementDates };

      const checkUnlock = (id: string) => {
        if (!unlocked.has(id)) {
          unlocked.add(id);
          achievementDates[id] = new Date().toISOString();
          newlyUnlockedAchievements.push(id);
          const ach = ACHIEVEMENTS.find(a => a.id === id);
          if (ach) {
            setNewAchievementToast(ach);
            sound.play('levelup');
          }
        }
      };

      // Check criteria
      if (score > 0) checkUnlock('first_win');
      if (gameId === 'snake' && score >= 500) checkUnlock('snake_500');
      if (gameId === 'snake' && score >= 1000) checkUnlock('snake_1000');
      if (gameId === '2048' && score >= 2048) checkUnlock('2048_tile');
      if (gameId === 'tictactoe' && details?.includes('Hard Win')) checkUnlock('tictactoe_master');
      if (gameId === 'memory' && details?.includes('Fast Clear')) checkUnlock('memory_ace');
      if (gameId === 'flappy' && score >= 15) checkUnlock('flappy_15');
      if (gameId === 'tetris' && score >= 1500) checkUnlock('tetris_lines');
      if (gameId === 'mole' && score >= 300) checkUnlock('mole_speed');
      if (gameId === 'math' && details?.includes('Streak 10')) checkUnlock('math_streak');
      if (gameId === 'wordle' && details?.includes('3 Guesses')) checkUnlock('wordle_genius');
      if (gameId === 'minesweeper' && details?.includes('Victory')) checkUnlock('minesweeper_win');

      if (prev.streak >= 3) checkUnlock('streak_3');
      if (prev.streak >= 7) checkUnlock('streak_7');
      if (calculatedLevel >= 5) checkUnlock('level_5');

      // Check if all 10 games played
      const playedGameIds = new Set([...Object.keys(prev.highScores), gameId]);
      if (GAMES.every(g => playedGameIds.has(g.id))) {
        checkUnlock('played_all');
      }

      if (calculatedLevel > prevLevel) {
        setLevelUpInfo({ level: calculatedLevel, unlocked: true });
        fireLevelUpConfetti();
        sound.play('levelup');
      } else if (isNewBest && score > 0) {
        fireCelebrationConfetti();
        sound.play('win');
      }

      return {
        ...prev,
        totalGamesPlayed: prev.totalGamesPlayed + 1,
        xp: totalXp,
        level: calculatedLevel,
        highScores: {
          ...prev.highScores,
          [gameId]: newBest,
        },
        leaderboards: {
          ...prev.leaderboards,
          [gameId]: updatedList,
        },
        recentlyPlayed: updatedRecent,
        unlockedAchievements: Array.from(unlocked),
        achievementDates,
      };
    });

    return { isNewBest, xpEarned: earnedXp, newAchievements: newlyUnlockedAchievements };
  }, []);

  return (
    <GameContext.Provider
      value={{
        profile,
        soundMuted,
        toggleSound,
        recordGamePlayed,
        toggleFavorite,
        isFavorite,
        updateUsername,
        updateAvatar,
        levelUpInfo,
        dismissLevelUp,
        newAchievementToast,
        dismissAchievementToast,
        getLeaderboard,
        claimDailyChallenge,
        dailyChallenge,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
