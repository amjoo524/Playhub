import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Gamepad2, Search, Flame, Dices, Trophy, Heart, 
  Sparkles, ArrowRight, Play, Star, Clock 
} from 'lucide-react';
import { GAMES } from '../data/games';
import { GameCategory, GameInfo } from '../types';
import { useGame } from '../context/GameContext';

const CATEGORIES: GameCategory[] = ['All', 'Arcade', 'Puzzle', 'Brain', 'Casual'];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, toggleFavorite, isFavorite, dailyChallenge } = useGame();
  
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Daily challenge completed today?
  const todayStr = new Date().toISOString().slice(0, 10);
  const isDailyCompleted = profile.dailyChallengeCompletedDate === todayStr;

  // Filter games
  const filteredGames = useMemo(() => {
    return GAMES.filter(game => {
      const matchesCategory = selectedCategory === 'All' || game.category === selectedCategory;
      const matchesSearch = 
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.tagline.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Favorite games list
  const favoriteGames = useMemo(() => {
    return GAMES.filter(g => profile.favorites.includes(g.id));
  }, [profile.favorites]);

  // Recently played games list
  const recentGames = useMemo(() => {
    return profile.recentlyPlayed
      .map(id => GAMES.find(g => g.id === id))
      .filter((g): g is GameInfo => g !== undefined);
  }, [profile.recentlyPlayed]);

  // Launch random game
  const handleRandomPlay = () => {
    const randomGame = GAMES[Math.floor(Math.random() * GAMES.length)];
    navigate(`/game/${randomGame.id}`);
  };

  const featuredGame = GAMES[0]; // Snake or 2048

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#131b2f] to-[#0a0f1d] border border-slate-800 p-8 sm:p-12 shadow-2xl">
        {/* Glow backdrop shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-cyan-400 mb-4 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Instant Play · Zero Downloads · 100% Free</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-4">
            Play Browser Games <br />
            <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
              In A Flash.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-xl leading-relaxed">
            Dive straight into classic arcade favorites, number puzzles, mind teasers, and rapid-fire challenges. Your high scores and achievements are saved locally.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/game/${featuredGame.id}`}
              className="py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-lg shadow-purple-500/25 active:scale-95 transition-all flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Play Now: {featuredGame.title}</span>
            </Link>

            <button
              onClick={handleRandomPlay}
              className="py-3.5 px-5 rounded-xl font-semibold text-slate-200 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 active:scale-95 transition-all flex items-center gap-2"
            >
              <Dices className="w-5 h-5 text-amber-400" />
              <span>Random Game</span>
            </button>
          </div>
        </div>
      </section>

      {/* Daily Challenge Spotlight Card */}
      <section className="relative rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-900 border border-amber-500/30 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl shadow-inner shrink-0">
            {dailyChallenge.game.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                Daily Challenge · Today Only
              </span>
              {isDailyCompleted && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold">
                  Completed ✓
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white mt-0.5">
              Play {dailyChallenge.game.title} & Earn +{dailyChallenge.bonusXp} Bonus XP!
            </h3>
            <p className="text-xs text-slate-400 max-w-lg mt-0.5">
              {dailyChallenge.game.tagline}. Play at least one round today to boost your level streak!
            </p>
          </div>
        </div>

        <Link
          to={`/game/${dailyChallenge.game.id}`}
          className="w-full md:w-auto py-3 px-6 rounded-xl font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-400/20 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
        >
          <Play className="w-4 h-4 fill-slate-900" />
          <span>{isDailyCompleted ? 'Play Again' : 'Take Challenge'}</span>
        </Link>
      </section>

      {/* Recently Played Section (if any) */}
      {recentGames.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Recently Played</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {recentGames.map(game => (
              <Link
                key={game.id}
                to={`/game/${game.id}`}
                className="group p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 hover:border-cyan-500/40 transition-all flex flex-col items-center text-center"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  {game.icon}
                </div>
                <h4 className="text-xs font-bold text-white truncate w-full group-hover:text-cyan-400 transition-colors">
                  {game.title}
                </h4>
                <span className="text-[10px] text-slate-500">
                  Best: {profile.highScores[game.id] || 0}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Favorites Section (if any) */}
      {favoriteGames.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>Your Favorite Games</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {favoriteGames.map(game => (
              <Link
                key={game.id}
                to={`/game/${game.id}`}
                className="group p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/90 border border-slate-800 hover:border-rose-500/40 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl group-hover:scale-110 transition-transform">
                    {game.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                      {game.title}
                    </h4>
                    <span className="text-xs text-slate-400">{game.category}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(game.id);
                  }}
                  className="p-1.5 rounded-lg text-rose-400 hover:text-white transition-colors"
                  title="Remove from favorites"
                >
                  <Heart className="w-4 h-4 fill-rose-400" />
                </button>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Game Catalog & Filter Navigation */}
      <section className="space-y-6">
        
        {/* Controls row: Category segmented buttons + Search input */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Category Tabs (Interactive Segmented Control compliant with Section 1A) */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto max-w-full no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Games Grid (10 Games) */}
        {filteredGames.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-slate-400">No games found matching "{searchQuery}".</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-3 text-xs text-cyan-400 hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredGames.map(game => {
              const best = profile.highScores[game.id] || 0;
              const isFav = isFavorite(game.id);

              return (
                <div
                  key={game.id}
                  className="group relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/90 hover:border-cyan-500/50 p-5 flex flex-col justify-between shadow-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-cyan-500/10"
                >
                  <div>
                    {/* Top row: Icon, Category unboxed text, Favorite button */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform">
                        {game.icon}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-slate-400">
                          {game.category}
                        </span>
                        <button
                          onClick={() => toggleFavorite(game.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isFav ? 'text-rose-500' : 'text-slate-500 hover:text-white'
                          }`}
                          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Title & Tagline */}
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors mb-1">
                      {game.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {game.description}
                    </p>
                  </div>

                  {/* Bottom Row: Personal Best & Play Button */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="text-xs text-slate-400">
                      <span>Best: </span>
                      <strong className="text-amber-400 font-mono font-bold">
                        {best > 0 ? best.toLocaleString() : '—'}
                      </strong>
                    </div>

                    <Link
                      to={`/game/${game.id}`}
                      className="py-2 px-3.5 rounded-xl font-bold text-xs text-white bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </section>

    </div>
  );
};
