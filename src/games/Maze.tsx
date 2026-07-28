import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Clock, Footprints } from 'lucide-react';

const GRID_SIZE = 15;
const CELL_SIZE = 28; // px in logical grid

type Cell = 'wall' | 'path';

function generateMaze(): Cell[][] {
  // Start all walls
  const grid: Cell[][] = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => 'wall' as Cell),
  );

  // Recursive backtracker (iterative)
  const stack: [number, number][] = [[1, 1]];
  grid[1][1] = 'path';

  while (stack.length > 0) {
    const [cx, cy] = stack[stack.length - 1];
    const neighbors: [number, number][] = [];

    // Check 2-cell-distant neighbors
    const dirs = [
      [0, -2], [0, 2], [-2, 0], [2, 0],
    ];
    for (const [dx, dy] of dirs) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx > 0 && nx < GRID_SIZE - 1 && ny > 0 && ny < GRID_SIZE - 1 && grid[ny][nx] === 'wall') {
        neighbors.push([nx, ny]);
      }
    }

    if (neighbors.length === 0) {
      stack.pop();
    } else {
      const [nx, ny] = neighbors[Math.floor(Math.random() * neighbors.length)];
      // Carve through the wall between
      grid[ny][nx] = 'path';
      grid[(cy + ny) / 2][(cx + nx) / 2] = 'path';
      stack.push([nx, ny]);
    }
  }

  // Ensure exit is open
  grid[GRID_SIZE - 2][GRID_SIZE - 2] = 'path';
  // Make sure there's a path to exit — open neighbors if needed
  if (grid[GRID_SIZE - 3][GRID_SIZE - 2] === 'wall' && grid[GRID_SIZE - 2][GRID_SIZE - 3] === 'wall') {
    grid[GRID_SIZE - 3][GRID_SIZE - 2] = 'path';
  }

  return grid;
}

interface Props {
  onBack: () => void;
  onSubmitScore: (timeSeconds: number) => void;
  bestScore?: number;
}

export default function Maze({ onBack, onSubmitScore, bestScore }: Props) {
  const [maze, setMaze] = useState<Cell[][]>(generateMaze);
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [time, setTime] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const goal = { x: GRID_SIZE - 2, y: GRID_SIZE - 2 };

  // Timer
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const interval = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [gameStarted, gameOver]);

  // Check win
  useEffect(() => {
    if (player.x === goal.x && player.y === goal.y && !gameOver) {
      setGameOver(true);
      onSubmitScore(time);
    }
  }, [player, goal, gameOver, time, onSubmitScore]);

  const move = useCallback(
    (dx: number, dy: number) => {
      if (gameOver) return;
      const nx = player.x + dx;
      const ny = player.y + dy;
      if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) return;
      if (maze[ny][nx] === 'wall') return;
      if (!gameStarted) setGameStarted(true);
      setPlayer({ x: nx, y: ny });
      setMoves((m) => m + 1);
    },
    [player, maze, gameOver, gameStarted],
  );

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        move(0, -1);
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        move(0, 1);
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        move(-1, 0);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        move(1, 0);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [move]);

  const restart = () => {
    setMaze(generateMaze());
    setPlayer({ x: 1, y: 1 });
    setTime(0);
    setMoves(0);
    setGameStarted(false);
    setGameOver(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-900 via-rose-700 to-rose-500 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-3xl flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} /> Arcade
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Maze Escape</h1>
        <div className="w-24" />
      </div>

      <div className="flex gap-6 mb-6 text-white">
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
          <Clock size={18} /> {formatTime(time)}
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
          <Footprints size={18} /> {moves}
        </div>
      </div>

      <div className="relative">
        <div
          className="grid bg-rose-950/50 rounded-xl p-1.5 shadow-2xl border-2 border-white/20"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            width: 'min(420px, 85vw)',
            height: 'min(420px, 85vw)',
          }}
        >
          {maze.map((row, y) =>
            row.map((cell, x) => {
              const isPlayer = player.x === x && player.y === y;
              const isGoal = goal.x === x && goal.y === y;
              return (
                <div
                  key={`${x}-${y}`}
                  className="rounded-[2px] flex items-center justify-center"
                  style={{
                    backgroundColor:
                      cell === 'wall'
                        ? '#1f2937'
                        : isGoal
                        ? '#fbbf24'
                        : '#fef3c7',
                  }}
                >
                  {isPlayer && (
                    <div
                      className="rounded-full bg-rose-500 border-2 border-white"
                      style={{ width: '70%', height: '70%' }}
                    />
                  )}
                  {isGoal && !isPlayer && (
                    <div className="text-amber-600 text-xs sm:text-sm font-bold">★</div>
                  )}
                </div>
              );
            }),
          )}
        </div>

        {gameOver && (
          <div className="absolute inset-0 bg-black/60 rounded-xl flex flex-col items-center justify-center">
            <h2 className="text-3xl font-bold text-white mb-2">You Escaped!</h2>
            <p className="text-xl text-rose-300 mb-1">Time: {formatTime(time)}</p>
            <p className="text-lg text-white/80 mb-1">Moves: {moves}</p>
            {bestScore !== undefined && (
              <p className="text-sm text-white/60 mb-4">Best: {formatTime(bestScore)}</p>
            )}
            <div className="flex gap-3 mt-2">
              <button
                onClick={restart}
                className="flex items-center gap-2 bg-rose-500 hover:bg-rose-400 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
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
        Use <span className="bg-white/20 px-2 py-0.5 rounded font-mono">Arrow Keys</span> or
        <span className="bg-white/20 px-2 py-0.5 rounded font-mono mx-1">WASD</span>
        to navigate. Reach the golden star to escape!
      </p>
    </div>
  );
}
