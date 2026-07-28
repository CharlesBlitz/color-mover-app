import { Gamepad2, Palette, Brain, Type, Compass, Trophy } from 'lucide-react';
import { GAMES, type GameId } from './types';

interface Props {
  onSelect: (game: GameId) => void;
  scores: Partial<Record<GameId, number>>;
}

const ICONS: Record<GameId, typeof Gamepad2> = {
  'color-collector': Palette,
  'memory-match': Brain,
  'wordle': Type,
  'maze': Compass,
};

const ACCENT_CLASSES: Record<string, { bg: string; ring: string; text: string; glow: string }> = {
  emerald: { bg: 'from-emerald-500 to-emerald-700', ring: 'ring-emerald-400/50', text: 'text-emerald-300', glow: 'shadow-emerald-500/30' },
  sky: { bg: 'from-sky-500 to-sky-700', ring: 'ring-sky-400/50', text: 'text-sky-300', glow: 'shadow-sky-500/30' },
  amber: { bg: 'from-amber-500 to-amber-700', ring: 'ring-amber-400/50', text: 'text-amber-300', glow: 'shadow-amber-500/30' },
  rose: { bg: 'from-rose-500 to-rose-700', ring: 'ring-rose-400/50', text: 'text-rose-300', glow: 'shadow-rose-500/30' },
};

export default function ArcadeHub({ onSelect, scores }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-700 to-emerald-500 flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Logo */}
      <div className="absolute top-6 right-6 z-10">
        <img
          src="/controller-icon.svg"
          alt="Controller Icon"
          className="w-14 h-14 drop-shadow-lg hover:scale-110 transition-transform duration-200"
        />
      </div>

      {/* Title */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Gamepad2 className="text-white w-10 h-10" />
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Green Arcade
          </h1>
        </div>
        <p className="text-white/70 text-lg">Pick a game and start playing</p>
      </div>

      {/* Game cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl w-full">
        {GAMES.map((game) => {
          const Icon = ICONS[game.id];
          const accent = ACCENT_CLASSES[game.accent];
          const bestScore = scores[game.id];
          return (
            <button
              key={game.id}
              onClick={() => onSelect(game.id)}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${accent.bg} p-6 text-left shadow-xl ${accent.glow} ring-1 ${accent.ring} hover:scale-[1.02] active:scale-[0.99] transition-all duration-200`}
            >
              <div className="flex items-start gap-4">
                <div className="bg-white/20 rounded-xl p-3 group-hover:bg-white/30 transition-colors">
                  <Icon className="text-white w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-1">{game.name}</h2>
                  <p className="text-white/80 text-sm leading-snug">{game.description}</p>
                </div>
              </div>

              {/* Best score */}
              <div className="mt-4 flex items-center gap-2 text-white/90">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-medium">{game.scoreLabel}:</span>
                <span className="text-sm font-bold">
                  {bestScore !== undefined ? bestScore : '—'}
                </span>
              </div>

              {/* Hover arrow */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-200">
                <div className="bg-white/20 rounded-full p-2">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-8 text-white/50 text-sm">
        Best scores are saved in your browser
      </p>
    </div>
  );
}
