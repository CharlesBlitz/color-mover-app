import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, RotateCcw, Clock, Target } from 'lucide-react';

const SYMBOLS = [
  { icon: '🎮', color: '#ef4444' },
  { icon: '🎯', color: '#3b82f6' },
  { icon: '🎨', color: '#22c55e' },
  { icon: '⚡', color: '#eab308' },
  { icon: '🌟', color: '#a855f7' },
  { icon: '🔥', color: '#f97316' },
  { icon: '💎', color: '#06b6d4' },
  { icon: '🌈', color: '#ec4899' },
];

interface Card {
  id: number;
  symbolIndex: number;
  flipped: boolean;
  matched: boolean;
}

function createDeck(): Card[] {
  const pairs = [...SYMBOLS, ...SYMBOLS];
  const shuffled = pairs
    .map((_, i) => ({ sort: Math.random(), value: i }))
    .sort((a, b) => a.sort - b.sort)
    .map((entry, idx) => ({
      id: idx,
      symbolIndex: entry.value % SYMBOLS.length,
      flipped: false,
      matched: false,
    }));
  return shuffled;
}

interface Props {
  onBack: () => void;
  onSubmitScore: (moves: number) => void;
  bestScore?: number;
}

export default function MemoryMatch({ onBack, onSubmitScore, bestScore }: Props) {
  const [cards, setCards] = useState<Card[]>(createDeck);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const lockRef = useRef(false);

  const allMatched = cards.length > 0 && cards.every((c) => c.matched);

  // Timer
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const interval = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [gameStarted, gameOver]);

  // Check game over
  useEffect(() => {
    if (allMatched && !gameOver) {
      setGameOver(true);
      onSubmitScore(moves);
    }
  }, [allMatched, gameOver, moves, onSubmitScore]);

  const handleCardClick = useCallback(
    (index: number) => {
      if (lockRef.current) return;
      if (cards[index].flipped || cards[index].matched) return;
      if (flippedIndices.includes(index)) return;

      if (!gameStarted) setGameStarted(true);

      const newFlipped = [...flippedIndices, index];
      setFlippedIndices(newFlipped);

      // Flip the card
      setCards((prev) =>
        prev.map((c, i) => (i === index ? { ...c, flipped: true } : c)),
      );

      if (newFlipped.length === 2) {
        lockRef.current = true;
        setMoves((m) => m + 1);

        const [first, second] = newFlipped;
        if (cards[first].symbolIndex === cards[second].symbolIndex) {
          // Match
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c, i) =>
                i === first || i === second ? { ...c, matched: true } : c,
              ),
            );
            setFlippedIndices([]);
            lockRef.current = false;
          }, 500);
        } else {
          // No match
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c, i) =>
                i === first || i === second ? { ...c, flipped: false } : c,
              ),
            );
            setFlippedIndices([]);
            lockRef.current = false;
          }, 900);
        }
      }
    },
    [cards, flippedIndices, gameStarted],
  );

  const restart = () => {
    setCards(createDeck());
    setFlippedIndices([]);
    setMoves(0);
    setTime(0);
    setGameStarted(false);
    setGameOver(false);
    lockRef.current = false;
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900 via-sky-700 to-sky-500 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-3xl flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} /> Arcade
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Memory Match</h1>
        <div className="w-24" />
      </div>

      <div className="flex gap-6 mb-6 text-white">
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
          <Target size={18} /> Moves: {moves}
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
          <Clock size={18} /> {formatTime(time)}
        </div>
      </div>

      <div className="relative">
        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          {cards.map((card, index) => {
            const symbol = SYMBOLS[card.symbolIndex];
            const isShown = card.flipped || card.matched;
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(index)}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl perspective-[600px]"
                style={{ perspective: 600 }}
                disabled={card.matched || gameOver}
              >
                <div
                  className="relative w-full h-full transition-transform duration-500"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isShown ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* Back */}
                  <div
                    className="absolute inset-0 rounded-xl flex items-center justify-center border-2 border-white/30"
                    style={{
                      backfaceVisibility: 'hidden',
                      background: 'linear-gradient(135deg, #0c4a6e, #075985)',
                    }}
                  >
                    <span className="text-white/40 text-2xl">?</span>
                  </div>
                  {/* Front */}
                  <div
                    className="absolute inset-0 rounded-xl flex items-center justify-center border-2"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      backgroundColor: card.matched ? `${symbol.color}30` : '#fff',
                      borderColor: symbol.color,
                    }}
                  >
                    <span className="text-3xl sm:text-4xl">{symbol.icon}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {gameOver && (
          <div className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center">
            <h2 className="text-3xl font-bold text-white mb-2">You Win!</h2>
            <p className="text-xl text-sky-300 mb-1">Moves: {moves}</p>
            <p className="text-lg text-white/80 mb-1">Time: {formatTime(time)}</p>
            {bestScore !== undefined && (
              <p className="text-sm text-white/60 mb-4">Best: {bestScore} moves</p>
            )}
            <div className="flex gap-3 mt-2">
              <button
                onClick={restart}
                className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
              >
                <RotateCcw size={18} /> Play Again
              </button>
              <button
                onClick={onBack}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
              >
                <ArrowLeft size={18} /> Arcade
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-white/70 text-sm text-center max-w-md">
        Flip cards to find matching pairs. Match all 8 pairs in the fewest moves!
      </p>
    </div>
  );
}
