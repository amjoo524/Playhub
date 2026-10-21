import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Volume2, VolumeX, Flame, Gamepad2, Trophy, User } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const Navbar: React.FC = () => {
  const { profile, soundMuted, toggleSound } = useGame();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Games', icon: Gamepad2 },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0b0f19]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Brand Wordmark */}
        <Link 
          to="/" 
          className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
          aria-label="PlayHub Home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Play<span className="text-cyan-400">Hub</span>
          </span>
        </Link>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to || (to === '/' && location.pathname.startsWith('/game'));
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/40'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Player Utilities & Sound Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Daily Streak Indicator */}
          <Link
            to="/profile"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/40 border border-amber-800/40 rounded-lg text-amber-400 text-xs font-semibold hover:bg-amber-900/40 transition-colors whitespace-nowrap shrink-0"
            title={`${profile.streak} Day Streak!`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
            <span className="tabular-nums font-bold">{profile.streak}</span>
            <span className="hidden sm:inline text-amber-500/80 font-normal">streak</span>
          </Link>

          {/* Level Badge */}
          <Link
            to="/profile"
            className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 bg-purple-950/40 border border-purple-800/40 rounded-lg text-purple-300 text-xs font-semibold hover:bg-purple-900/40 transition-colors whitespace-nowrap shrink-0"
            title={`Level ${profile.level} (${profile.xp} XP)`}
          >
            <span>{profile.avatar}</span>
            <span className="text-purple-400 font-bold">Lv.{profile.level}</span>
          </Link>

          {/* Audio Mute/Unmute */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg border transition-colors ${
              soundMuted
                ? 'bg-red-950/40 border-red-800/40 text-red-400 hover:bg-red-900/50'
                : 'bg-slate-800/70 border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            aria-label={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
            title={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </header>
  );
};
