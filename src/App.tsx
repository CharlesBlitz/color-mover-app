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
  '#8b5cf6', // violet
  '#10b981', // emerald
  '#f59e0b', // amber
  '#6366f1', // indigo
];

const GAME_AREA_WIDTH = 600;
const GAME_AREA_HEIGHT = 400;
const CHARACTER_SIZE = 40;
const SCORE_ZONE_SIZE = 50;

function App() {
  const [position, setPosition] = useState({ x: 280, y: 180 });
  const [colorIndex, setColorIndex] = useState(0);
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [targetPosition, setTargetPosition] = useState<{ x: number, y: number } | null>(null);
  const [score, setScore] = useState(0);
  const [scoreZone, setScoreZone] = useState({ x: 0, y: 0 });

  const moveSpeed = 5;
  const clickMoveSpeed = 8;

  // Generate random position for score zone
  const generateRandomScoreZone = useCallback(() => {
    const maxX = GAME_AREA_WIDTH - SCORE_ZONE_SIZE;
    const maxY = GAME_AREA_HEIGHT - SCORE_ZONE_SIZE;
    const newX = Math.random() * maxX;
    const newY = Math.random() * maxY;
    setScoreZone({ x: newX, y: newY });
  }, []);

  // Initialize score zone position
  useEffect(() => {
    generateRandomScoreZone();
  }, [generateRandomScoreZone]);

  // Check for collision with score zone
  const checkScoreZoneCollision = useCallback((charPos: { x: number, y: number }) => {
    const charCenterX = charPos.x + CHARACTER_SIZE / 2;
    const charCenterY = charPos.y + CHARACTER_SIZE / 2;
    const zoneCenterX = scoreZone.x + SCORE_ZONE_SIZE / 2;
    const zoneCenterY = scoreZone.y + SCORE_ZONE_SIZE / 2;
    
    const distance = Math.sqrt(
      Math.pow(charCenterX - zoneCenterX, 2) + 
      Math.pow(charCenterY - zoneCenterY, 2)
    );
    
    // Collision if distance is less than combined radii
    return distance < (CHARACTER_SIZE / 2 + SCORE_ZONE_SIZE / 2);
  }, [scoreZone]);
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

        const newPosition = { x: newX, y: newY };
        
        // Check for score zone collision
        if (checkScoreZoneCollision(newPosition)) {
          setScore(prevScore => prevScore + 1);
          generateRandomScoreZone();
        }
        
        return newPosition;
      });
    };

    const intervalId = setInterval(moveCharacter, 16); // ~60fps
    return () => clearInterval(intervalId);
  }, [keys, targetPosition, checkScoreZoneCollision, generateRandomScoreZone]);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 flex flex-col items-center justify-center p-8">
      {/* Game Logo in top right */}
      <div className="absolute top-8 right-8 z-10">
        <img 
          src="/controller-icon.svg" 
          alt="Controller Icon" 
          className="w-16 h-16 drop-shadow-lg hover:scale-110 transition-transform duration-200"
        />
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Color Mover App</h1>
        <div className="text-lg text-gray-300 space-y-2">
          <p>Use <span className="bg-white bg-opacity-20 px-2 py-1 rounded font-mono">Arrow Keys</span> to move</p>
          <p>Press <span className="bg-white bg-opacity-20 px-2 py-1 rounded font-mono">Space</span> to change color</p>
          <p>Click anywhere in the game area to move there</p>
          <p>Collect the <span className="text-yellow-300 font-semibold">golden zones</span> to score points!</p>
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

        {/* Score Zone */}
        <div
          className="absolute rounded-lg border-4 border-yellow-400 bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-lg animate-pulse"
          style={{
            left: scoreZone.x,
            top: scoreZone.y,
            width: SCORE_ZONE_SIZE,
            height: SCORE_ZONE_SIZE,
            boxShadow: '0 4px 20px rgba(234, 179, 8, 0.6)',
          }}
        />

        {/* Position indicator */}
        <div className="absolute top-4 left-4 text-gray-600 text-sm font-mono bg-white bg-opacity-80 px-3 py-1 rounded-lg">
          Position: ({Math.round(position.x)}, {Math.round(position.y)})
        </div>

        {/* Score indicator */}
        <div className="absolute top-16 left-4 text-gray-600 text-sm font-mono bg-white bg-opacity-80 px-3 py-1 rounded-lg">
          Score: {score}
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
        <p className="text-sm">Use keyboard controls or click to move the character and collect golden zones!</p>
      </div>
    </div>
  );
}

export default App;
