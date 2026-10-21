import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Heart, Sparkles } from 'lucide-react';
import { GAMES } from '../data/games';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-[#080c14] py-10 px-4 sm:px-6 lg:px-8 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand & Mission */}
        <div className="flex flex-col items-center md:items-start gap-1.5 text-center md:text-left">
          <div className="flex items-center gap-2 text-white font-bold tracking-tight">
            <Gamepad2 className="w-5 h-5 text-cyan-400" />
            <span>PlayHub Arcade</span>
          </div>
          <p className="text-xs text-slate-500 max-w-sm">
            Instant free browser games with zero downloads or accounts. High scores saved locally on your device.
          </p>
        </div>

        {/* Quick Games Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
          {GAMES.slice(0, 5).map(g => (
            <Link
              key={g.id}
              to={`/game/${g.id}`}
              className="text-slate-400 hover:text-cyan-400 transition-colors"
            >
              {g.title}
            </Link>
          ))}
          <span className="text-slate-700 hidden sm:inline">|</span>
          <Link to="/leaderboard" className="text-slate-400 hover:text-cyan-400 transition-colors">
            Leaderboards
          </Link>
          <Link to="/profile" className="text-slate-400 hover:text-cyan-400 transition-colors">
            Achievements
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <span>Built for gamers everywhere</span>
          <span>·</span>
          <span>Free & Open Play</span>
        </div>

      </div>
    </footer>
  );
};
