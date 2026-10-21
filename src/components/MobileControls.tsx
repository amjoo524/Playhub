import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCw, Play } from 'lucide-react';

interface MobileControlsProps {
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  showAction?: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onUp,
  onDown,
  onLeft,
  onRight,
  onAction,
  actionLabel = 'Action',
  showAction = false,
}) => {
  return (
    <div className="flex md:hidden items-center justify-around w-full max-w-sm mx-auto mt-4 px-4 py-3 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-sm select-none">
      {/* Directional Pad */}
      <div className="grid grid-cols-3 gap-1.5 w-36 h-36">
        <div />
        <button
          type="button"
          onPointerDown={(e) => { e.preventDefault(); onUp?.(); }}
          className="flex items-center justify-center bg-slate-800/90 hover:bg-slate-700 active:bg-cyan-500 text-white rounded-xl shadow-md border border-slate-700 active:scale-95 transition-all touch-manipulation"
          aria-label="Up"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <div />

        <button
          type="button"
          onPointerDown={(e) => { e.preventDefault(); onLeft?.(); }}
          className="flex items-center justify-center bg-slate-800/90 hover:bg-slate-700 active:bg-cyan-500 text-white rounded-xl shadow-md border border-slate-700 active:scale-95 transition-all touch-manipulation"
          aria-label="Left"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-slate-700" />
        </div>
        <button
          type="button"
          onPointerDown={(e) => { e.preventDefault(); onRight?.(); }}
          className="flex items-center justify-center bg-slate-800/90 hover:bg-slate-700 active:bg-cyan-500 text-white rounded-xl shadow-md border border-slate-700 active:scale-95 transition-all touch-manipulation"
          aria-label="Right"
        >
          <ArrowRight className="w-6 h-6" />
        </button>

        <div />
        <button
          type="button"
          onPointerDown={(e) => { e.preventDefault(); onDown?.(); }}
          className="flex items-center justify-center bg-slate-800/90 hover:bg-slate-700 active:bg-cyan-500 text-white rounded-xl shadow-md border border-slate-700 active:scale-95 transition-all touch-manipulation"
          aria-label="Down"
        >
          <ArrowDown className="w-6 h-6" />
        </button>
        <div />
      </div>

      {/* Action Button (e.g. Rotate, Drop, Flap) */}
      {showAction && onAction && (
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); onAction(); }}
            className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-cyan-600 to-purple-600 active:from-cyan-400 active:to-purple-400 text-white font-bold flex flex-col items-center justify-center shadow-lg shadow-cyan-500/30 border border-cyan-400/30 active:scale-95 transition-all touch-manipulation"
            aria-label={actionLabel}
          >
            <RotateCw className="w-6 h-6 mb-1" />
            <span className="text-[10px] uppercase tracking-wider">{actionLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
};
