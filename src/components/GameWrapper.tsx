import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Play, Pause, RotateCcw, Maximize2, Minimize2, 
  HelpCircle, Share2, Heart, Trophy, ArrowRight, 
  Check, Volume2, VolumeX, Flame, Dices 
} from 'lucide-react';
import { GameInfo } from '../types';
import { useGame } from '../context/GameContext';
import { GAMES } from '../data/games';

interface GameWrapperProps {
  game: GameInfo;
  score: number;
  isGameOver: boolean;
  isPaused: boolean;
  onPauseToggle: () => void;
  onRestart: () => void;
  children: React.ReactNode;
  gameOverDetails?: string;
  isVictory?: boolean;
}

export const GameWrapper: React.FC<GameWrapperProps> = ({
  game,
  score,
  isGameOver,
  isPaused,
  onPauseToggle,
  onRestart,
  children,
  gameOverDetails,
  isVictory = false,
}) => {
  const { 
    profile, 
    toggleFavorite, 
    isFavorite, 
    soundMuted, 
    toggleSound,
    recordGamePlayed,
    claimDailyChallenge,
    dailyChallenge
  } = useGame();

  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [recordedResult, setRecordedResult] = useState<{ isNewBest: boolean; xpEarned: number } | null>(null);

  const bestScore = profile.highScores[game.id] || 0;
  const isFav = isFavorite(game.id);
  const isDaily = dailyChallenge.game.id === game.id;

  // Handle game over recording
  useEffect(() => {
    if (isGameOver) {
      const result = recordGamePlayed(game.id, score, gameOverDetails);
      setRecordedResult(result);
      if (isDaily && score > 0) {
        claimDailyChallenge(game.id);
      }
    } else {
      setRecordedResult(null);
    }
  }, [isGameOver, game.id, score, gameOverDetails, isDaily, recordGamePlayed, claimDailyChallenge]);

  // Fullscreen toggle
  const handleFullscreenToggle = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Share score
  const handleShare = () => {
    const text = `🕹️ I just scored ${score.toLocaleString()} on ${game.title} at PlayHub! Think you can beat me? Play now: ${window.location.href}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }).catch(() => {});
  };

  // Pick random game
  const handleRandomGame = () => {
    const otherGames = GAMES.filter(g => g.id !== game.id);
    const random = otherGames[Math.floor(Math.random() * otherGames.length)];
    navigate(`/game/${random.id}`);
  };

  const moreGames = GAMES.filter(g => g.id !== game.id).slice(0, 4);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 md:py-6">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        {/* Game Title & Category */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-900/60 to-cyan-900/60 border border-slate-700/80 flex items-center justify-center text-2xl shadow-inner">
            {game.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {game.title}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                {game.category}
              </span>
              {isDaily && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-600/50 font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  Daily +500 XP
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate max-w-md">
              {game.tagline}
            </p>
          </div>
        </div>

        {/* Action Controls & Utilities */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* Favorite Button */}
          <button
            onClick={() => toggleFavorite(game.id)}
            className={`p-2 rounded-xl border transition-colors ${
              isFav 
                ? 'bg-rose-950/50 border-rose-800/60 text-rose-400' 
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            aria-label="Toggle favorite"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-400' : ''}`} />
          </button>

          {/* How to play toggle */}
          <button
            onClick={() => setShowHowToPlay(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            title="How to play"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Guide</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-colors ${
              soundMuted
                ? 'bg-red-950/40 border-red-800/40 text-red-400'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={soundMuted ? 'Unmute' : 'Mute'}
            aria-label="Mute toggle"
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={handleFullscreenToggle}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Toggle Fullscreen"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Game Screen Container */}
      <div 
        ref={containerRef}
        className={`relative flex flex-col items-center justify-center w-full bg-slate-950 rounded-2xl border border-slate-800/90 shadow-2xl overflow-hidden transition-all ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none p-4' : 'min-h-[500px]'
        }`}
      >
        {/* In-game HUD Score Bar */}
        <div className="w-full flex items-center justify-between px-4 sm:px-6 py-2.5 bg-slate-900/90 border-b border-slate-800/80 text-xs sm:text-sm font-semibold select-none">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Score:</span>
              <span className="text-cyan-400 font-mono text-base font-bold tabular-nums">
                {score.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Best:</span>
              <span className="text-amber-400 font-mono text-base font-bold tabular-nums">
                {Math.max(score, bestScore).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isGameOver && (
              <button
                onClick={onPauseToggle}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>
            )}
            <button
              onClick={onRestart}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              title="Restart game"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Game Render Slot */}
        <div className="relative w-full flex-1 flex flex-col items-center justify-center p-4">
          {children}

          {/* Paused Overlay */}
          {isPaused && !isGameOver && (
            <div className="absolute inset-0 z-20 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center mb-4 text-cyan-400">
                <Pause className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Game Paused</h3>
              <p className="text-sm text-slate-400 mb-6 max-w-xs">
                Take a breather! When you're ready, jump right back in.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={onPauseToggle}
                  className="w-40 py-2.5 px-4 rounded-xl font-bold text-white bg-cyan-500 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Resume
                </button>
                <button
                  onClick={onRestart}
                  className="w-40 py-2.5 px-4 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restart
                </button>
              </div>
            </div>
          )}

          {/* Game Over / Victory Overlay */}
          {isGameOver && (
            <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center text-4xl mb-3 shadow-xl shadow-purple-500/30">
                {isVictory ? '👑' : '💥'}
              </div>

              {recordedResult?.isNewBest && score > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-400 text-xs font-bold mb-2 animate-bounce">
                  <Trophy className="w-3.5 h-3.5" />
                  NEW PERSONAL BEST!
                </div>
              )}

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-1">
                {isVictory ? 'Victory!' : 'Game Over'}
              </h2>

              <p className="text-sm text-slate-400 mb-4 max-w-sm">
                {gameOverDetails || (isVictory ? 'Splendid performance! You mastered this challenge.' : 'Tough break! Ready for another run?')}
              </p>

              {/* Score Display Card */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-6">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-0.5">Final Score</span>
                  <span className="text-xl font-bold font-mono text-cyan-400 tabular-nums">
                    {score.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-0.5">XP Earned</span>
                  <span className="text-xl font-bold font-mono text-purple-400 tabular-nums">
                    +{recordedResult?.xpEarned || 20} XP
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm mb-4">
                <button
                  onClick={onRestart}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </button>
                <button
                  onClick={handleShare}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center justify-center gap-2"
                  title="Share your score"
                >
                  {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedShare ? 'Copied!' : 'Share'}</span>
                </button>
              </div>

              {/* Try Another Game Button */}
              <button
                onClick={handleRandomGame}
                className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 transition-colors"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>Try Another Game</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* How to Play Accordion / Info Panel */}
      {showHowToPlay && (
        <div className="mt-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 animate-in fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>How to Play {game.title}</span>
            </h3>
            <button
              onClick={() => setShowHowToPlay(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
            <div>
              <h4 className="font-semibold text-slate-200 mb-2">Controls:</h4>
              <p className="mb-1 text-slate-400"><strong className="text-slate-300">Desktop:</strong> {game.controls.desktop}</p>
              <p className="text-slate-400"><strong className="text-slate-300">Mobile:</strong> {game.controls.mobile}</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 mb-2">Rules & Objective:</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                {game.rules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Recommended "More Games" Row */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-300 tracking-wide uppercase">
            More Games You Might Like
          </h3>
          <Link to="/" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {moreGames.map(mg => (
            <Link
              key={mg.id}
              to={`/game/${mg.id}`}
              className="group p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                {mg.icon}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                  {mg.title}
                </h4>
                <span className="text-[11px] text-slate-400 block truncate">
                  {mg.category}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};
