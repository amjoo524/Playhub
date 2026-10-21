export type GameCategory = 'All' | 'Arcade' | 'Puzzle' | 'Brain' | 'Casual';

export interface GameInfo {
  id: string;
  title: string;
  category: Exclude<GameCategory, 'All'>;
  description: string;
  tagline: string;
  icon: string;
  color: string;
  accentGradient: string;
  controls: {
    desktop: string;
    mobile: string;
  };
  rules: string[];
  tips: string[];
}

export interface HighScore {
  score: number;
  date: string;
  playerName: string;
  details?: string;
}

export interface UserProfile {
  username: string;
  avatar: string;
  totalGamesPlayed: number;
  totalPlayTimeSeconds: number; // in seconds
  xp: number;
  level: number;
  streak: number;
  lastPlayedDate: string; // YYYY-MM-DD
  highScores: Record<string, number>; // gameId -> best score
  leaderboards: Record<string, HighScore[]>; // gameId -> top 10 scores
  favorites: string[]; // gameIds
  recentlyPlayed: string[]; // gameIds
  unlockedAchievements: string[]; // achievementIds
  achievementDates: Record<string, string>; // achievementId -> ISO date
  dailyChallengeCompletedDate?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'general' | 'game' | 'streak' | 'xp';
  xpReward: number;
}
