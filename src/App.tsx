import React, { useState, useEffect, useCallback } from 'react';

const COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#22c55e', // green
  '#eab308', // yellow
  '#a855f7', // purple
  '#f97316', // orange
  '#ec4899', // pink
  '#06b6d4', // cyan
];

const GAME_AREA_WIDTH = 600;
const GAME_AREA_HEIGHT = 400;
const CHARACTER_SIZE = 40;

function App() {
  const [position, setPosition] = useState({ x: 280, y: 180 });
  const [colorIndex, setColorIndex] = useState(0);
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [targetPosition, setTargetPosition] = useState<{ x: number, y: number } | null>(null);

  const moveSpeed = 5;
  const clickMoveSpeed = 8;

  // Handle keydown events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    event.preventDefault();
    setKeys(prev => new Set([...prev, event.code]));
    
    if (event.code === 'Space') {
      setColorIndex(prev => (prev + 1) % COLORS.length);
    }
  }, []);

  // Handle keyup events
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    setKeys(prev => {
      const newKeys = new Set(prev);
      newKeys.delete(event.code);
      return newKeys;
    });
  }, []);

  // Handle mouse click in game area
  const handleGameAreaClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    // Adjust for character size to center it on click point
    const targetX = Math.max(0, Math.min(GAME_AREA_WIDTH - CHARACTER_SIZE, clickX - CHARACTER_SIZE / 2));
    const targetY = Math.max(0, Math.min(GAME_AREA_HEIGHT - CHARACTER_SIZE, clickY - CHARACTER_SIZE / 2));
    
    setTargetPosition({ x: targetX, y: targetY });
  }, []);

  // Movement logic
  useEffect(() => {
    const moveCharacter = () => {
      setPosition(prev => {
        let newX = prev.x;
        let newY = prev.y;

        // Handle mouse click movement
        if (targetPosition) {
          const dx = targetPosition.x - prev.x;
          const dy = targetPosition.y - prev.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < clickMoveSpeed) {
            // Close enough, snap to target
            newX = targetPosition.x;
            newY = targetPosition.y;
            setTargetPosition(null);
          } else {
            // Move towards target
            const moveX = (dx / distance) * clickMoveSpeed;
            const moveY = (dy / distance) * clickMoveSpeed;
            newX = prev.x + moveX;
            newY = prev.y + moveY;
          }
        } else {
          // Handle keyboard movement
          if (keys.has('ArrowLeft')) {
            newX = Math.max(0, prev.x - moveSpeed);
          }
          if (keys.has('ArrowRight')) {
            newX = Math.min(GAME_AREA_WIDTH - CHARACTER_SIZE, prev.x + moveSpeed);
          }
          if (keys.has('ArrowUp')) {
            newY = Math.max(0, prev.y - moveSpeed);
          }
          if (keys.has('ArrowDown')) {
            newY = Math.min(GAME_AREA_HEIGHT - CHARACTER_SIZE, prev.y + moveSpeed);
          }
        }

        return { x: newX, y: newY };
      });
    };

    const intervalId = setInterval(moveCharacter, 16); // ~60fps
    return () => clearInterval(intervalId);
  }, [keys, targetPosition]);

  // Set up keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Focus the window to ensure keyboard events are captured
  useEffect(() => {
    window.focus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex flex-col items-center justify-center p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Color Character Game</h1>
        <div className="text-lg text-gray-300 space-y-2">
          <p>Use <span className="bg-white bg-opacity-20 px-2 py-1 rounded font-mono">Arrow Keys</span> to move</p>
          <p>Press <span className="bg-white bg-opacity-20 px-2 py-1 rounded font-mono">Space</span> to change color</p>
          <p>Click anywhere in the game area to move there</p>
        </div>
      </div>

      <div 
        className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-2xl border-4 border-white border-opacity-30"
        style={{ 
          width: GAME_AREA_WIDTH, 
          height: GAME_AREA_HEIGHT 
        }}
        tabIndex={0}
        onClick={handleGameAreaClick}
      >
        {/* Character */}
        <div
          className="absolute rounded-full transition-all duration-75 shadow-lg border-2 border-white border-opacity-50 cursor-pointer"
          style={{
            left: position.x,
            top: position.y,
            width: CHARACTER_SIZE,
            height: CHARACTER_SIZE,
            backgroundColor: COLORS[colorIndex],
            boxShadow: `0 4px 15px ${COLORS[colorIndex]}40`,
          }}
        />

        {/* Target indicator */}
        {targetPosition && (
          <div
            className="absolute rounded-full border-2 border-dashed border-gray-500 opacity-50 pointer-events-none"
            style={{
              left: targetPosition.x,
              top: targetPosition.y,
              width: CHARACTER_SIZE,
              height: CHARACTER_SIZE,
            }}
          />
        )}

        {/* Position indicator */}
        <div className="absolute top-4 left-4 text-gray-600 text-sm font-mono bg-white bg-opacity-80 px-3 py-1 rounded-lg">
          Position: ({Math.round(position.x)}, {Math.round(position.y)})
        </div>

        {/* Color indicator */}
        <div className="absolute top-4 right-4 text-gray-600 text-sm font-mono bg-white bg-opacity-80 px-3 py-1 rounded-lg flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full border border-gray-400"
            style={{ backgroundColor: COLORS[colorIndex] }}
          />
          Color: {colorIndex + 1}/{COLORS.length}
        </div>
      </div>

      <div className="mt-6 text-center text-gray-300">
        <p className="text-sm">Use keyboard controls or click to move the character!</p>
      </div>
    </div>
  );
}

export default App;