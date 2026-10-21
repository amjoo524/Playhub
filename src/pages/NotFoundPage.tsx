import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Home, RotateCcw } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center select-none">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-600 via-rose-600 to-amber-500 flex items-center justify-center text-5xl mb-6 shadow-2xl shadow-purple-500/30 animate-pulse">
        👾
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-cyan-400 text-xs font-mono font-bold mb-3 border border-slate-700">
        ERROR 404
      </div>

      <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2">
        Game Not Found
      </h1>

      <p className="text-sm text-slate-400 max-w-sm mb-8">
        Looks like this cartridge was misplaced in the arcade archives! Insert coin to return to the game catalog.
      </p>

      <Link
        to="/"
        className="py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-lg shadow-purple-500/25 active:scale-95 transition-all flex items-center gap-2"
      >
        <Home className="w-4 h-4" />
        <span>Return to Arcade</span>
      </Link>
    </div>
  );
};
