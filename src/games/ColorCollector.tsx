import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Clock } from 'lucide-react';

const COLORS = [
  '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316',
  '#ec4899', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#6366f1',
];

const GAME_AREA_WIDTH = 600;
const GAME_AREA_HEIGHT = 600;
const CHARACTER_SIZE = 40;
const SCORE_ZONE_SIZE = 50;
const GAME_DURATION = 60; // seconds

interface Props {
  onBack: () => void;
  onSubmitScore: (score: number) => void;
  bestScore?: number;
}

export default function ColorCollector({ onBack, onSubmitScore, bestScore }: Props) {
  const [position, setPosition] = useState({ x: 280, y: 180 });
  const [colorIndex, setColorIndex] = useState(0);
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number } | null>(null);
  const [score, setScore] = useState(0);
  const [scoreZone, setScoreZone] = useState({ x: 0, y: 0 });
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameOver, setGameOver] = useState(false);

  const moveSpeed = 5;
  const clickMoveSpeed = 8;

  const generateRandomScoreZone = useCallback(() => {
    const maxX = GAME_AREA_WIDTH - SCORE_ZONE_SIZE;
    const maxY = GAME_AREA_HEIGHT - SCORE_ZONE_SIZE;
    setScoreZone({ x: Math.random() * maxX, y: Math.random() * maxY });
  }, []);

  useEffect(() => {
    generateRandomScoreZone();
  }, [generateRandomScoreZone]);

  const checkScoreZoneCollision = useCallback(
    (charPos: { x: number; y: number }) => {
      const charCenterX = charPos.x + CHARACTER_SIZE / 2;
      const charCenterY = charPos.y + CHARACTER_SIZE / 2;
      const zoneCenterX = scoreZone.x + SCORE_ZONE_SIZE / 2;
      const zoneCenterY = scoreZone.y + SCORE_ZONE_SIZE / 2;
      const distance = Math.sqrt(
        Math.pow(charCenterX - zoneCenterX, 2) + Math.pow(charCenterY - zoneCenterY, 2),
      );
      return distance < CHARACTER_SIZE / 2 + SCORE_ZONE_SIZE / 2;
    },
    [scoreZone],
  );

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    event.preventDefault();
    setKeys((prev) => new Set([...prev, event.code]));
    if (event.code === 'Space') {
      setColorIndex((prev) => (prev + 1) % COLORS.length);
    }
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    setKeys((prev) => {
      const newKeys = new Set(prev);
      newKeys.delete(event.code);
      return newKeys;
    });
  }, []);

  const handleGameAreaClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    const targetX = Math.max(0, Math.min(GAME_AREA_WIDTH - CHARACTER_SIZE, clickX - CHARACTER_SIZE / 2));
    const targetY = Math.max(0, Math.min(GAME_AREA_HEIGHT - CHARACTER_SIZE, clickY - CHARACTER_SIZE / 2));
    setTargetPosition({ x: targetX, y: targetY });
  }, []);

  // Movement loop
  useEffect(() => {
    if (gameOver) return;
    const moveCharacter = () => {
      setPosition((prev) => {
        let newX = prev.x;
        let newY = prev.y;

        if (targetPosition) {
          const dx = targetPosition.x - prev.x;
          const dy = targetPosition.y - prev.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < clickMoveSpeed) {
            newX = targetPosition.x;
            newY = targetPosition.y;
            setTargetPosition(null);
          } else {
            newX = prev.x + (dx / distance) * clickMoveSpeed;
            newY = prev.y + (dy / distance) * clickMoveSpeed;
          }
        } else {
          if (keys.has('ArrowLeft')) newX = Math.max(0, prev.x - moveSpeed);
          if (keys.has('ArrowRight')) newX = Math.min(GAME_AREA_WIDTH - CHARACTER_SIZE, prev.x + moveSpeed);
          if (keys.has('ArrowUp')) newY = Math.max(0, prev.y - moveSpeed);
          if (keys.has('ArrowDown')) newY = Math.min(GAME_AREA_HEIGHT - CHARACTER_SIZE, prev.y + moveSpeed);
        }

        const newPosition = { x: newX, y: newY };
        if (checkScoreZoneCollision(newPosition)) {
          setScore((s) => s + 1);
          generateRandomScoreZone();
        }
        return newPosition;
      });
    };
    const intervalId = setInterval(moveCharacter, 16);
    return () => clearInterval(intervalId);
  }, [keys, targetPosition, checkScoreZoneCollision, generateRandomScoreZone, gameOver]);

  // Keyboard listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Timer
  useEffect(() => {
    if (gameOver) return;
    if (timeLeft <= 0) {
      setGameOver(true);
      onSubmitScore(score);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameOver, score, onSubmitScore]);

  const restart = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameOver(false);
    setPosition({ x: 280, y: 180 });
    setColorIndex(0);
    setTargetPosition(null);
    generateRandomScoreZone();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-700 to-emerald-500 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-3xl flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} /> Arcade
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Color Collector</h1>
        <div className="w-24" />
      </div>

      <div className="text-center mb-4 text-white/80 text-sm space-y-1">
        <p>
          Use <span className="bg-white/20 px-2 py-0.5 rounded font-mono">Arrow Keys</span> to move,
          <span className="bg-white/20 px-2 py-0.5 rounded font-mono ml-1">Space</span> to change color,
          or click to move there
        </p>
        <p>Collect the <span className="text-yellow-300 font-semibold">golden zones</span> to score points!</p>
      </div>

      <div
        className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-2xl border-4 border-white/30 overflow-hidden"
        style={{ width: 'min(600px, 90vw)', height: 'min(600px, 90vw)' }}
        tabIndex={0}
        onClick={handleGameAreaClick}
      >
        {/* Character */}
        {!gameOver && (
          <div
            className="absolute rounded-full transition-all duration-75 shadow-lg border-2 border-white/50 cursor-pointer"
            style={{
              left: `${(position.x / GAME_AREA_WIDTH) * 100}%`,
              top: `${(position.y / GAME_AREA_HEIGHT) * 100}%`,
              width: `${(CHARACTER_SIZE / GAME_AREA_WIDTH) * 100}%`,
              height: `${(CHARACTER_SIZE / GAME_AREA_HEIGHT) * 100}%`,
              backgroundColor: COLORS[colorIndex],
              boxShadow: `0 4px 15px ${COLORS[colorIndex]}40`,
            }}
          />
        )}

        {/* Target indicator */}
        {targetPosition && !gameOver && (
          <div
            className="absolute rounded-full border-2 border-dashed border-gray-500/50 pointer-events-none"
            style={{
              left: `${(targetPosition.x / GAME_AREA_WIDTH) * 100}%`,
              top: `${(targetPosition.y / GAME_AREA_HEIGHT) * 100}%`,
              width: `${(CHARACTER_SIZE / GAME_AREA_WIDTH) * 100}%`,
              height: `${(CHARACTER_SIZE / GAME_AREA_HEIGHT) * 100}%`,
            }}
          />
        )}

        {/* Score Zone */}
        {!gameOver && (
          <div
            className="absolute rounded-lg border-4 border-yellow-400 bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-lg animate-pulse"
            style={{
              left: `${(scoreZone.x / GAME_AREA_WIDTH) * 100}%`,
              top: `${(scoreZone.y / GAME_AREA_HEIGHT) * 100}%`,
              width: `${(SCORE_ZONE_SIZE / GAME_AREA_WIDTH) * 100}%`,
              height: `${(SCORE_ZONE_SIZE / GAME_AREA_HEIGHT) * 100}%`,
              boxShadow: '0 4px 20px rgba(234, 179, 8, 0.6)',
            }}
          />
        )}

        {/* HUD */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <div className="text-gray-700 text-sm font-mono bg-white/80 px-3 py-1 rounded-lg">
            Score: {score}
          </div>
          <div className="text-gray-700 text-sm font-mono bg-white/80 px-3 py-1 rounded-lg flex items-center gap-1">
            <Clock size={14} /> {timeLeft}s
          </div>
        </div>

        <div className="absolute top-3 right-3 text-gray-700 text-sm font-mono bg-white/80 px-3 py-1 rounded-lg flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border border-gray-400"
            style={{ backgroundColor: COLORS[colorIndex] }}
          />
          {colorIndex + 1}/{COLORS.length}
        </div>

        {/* Game Over overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-2xl">
            <h2 className="text-3xl font-bold text-white mb-2">Time's Up!</h2>
            <p className="text-xl text-yellow-300 mb-1">Final Score: {score}</p>
            {bestScore !== undefined && (
              <p className="text-sm text-white/70 mb-4">Best: {bestScore}</p>
            )}
            <div className="flex gap-3 mt-2">
              <button
                onClick={restart}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
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
    </div>
  );
}
