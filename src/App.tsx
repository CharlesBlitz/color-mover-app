import { useState, useCallback } from 'react';
import ArcadeHub from './ArcadeHub';
import ColorCollector from './games/ColorCollector';
import MemoryMatch from './games/MemoryMatch';
import Wordle from './games/Wordle';
import Maze from './games/Maze';
import { useHighScores, type GameId } from './useHighScores';

function App() {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const { scores, submitScore, getScore } = useHighScores();

  const handleBack = useCallback(() => setActiveGame(null), []);

  const handleSubmitColorCollector = useCallback(
    (score: number) => submitScore('color-collector', score, false),
    [submitScore],
  );
  const handleSubmitMemory = useCallback(
    (moves: number) => submitScore('memory-match', moves, true),
    [submitScore],
  );
  const handleSubmitWordle = useCallback(
    (streak: number) => submitScore('wordle', streak, false),
    [submitScore],
  );
  const handleSubmitMaze = useCallback(
    (timeSeconds: number) => submitScore('maze', timeSeconds, true),
    [submitScore],
  );

  if (activeGame === null) {
    return <ArcadeHub onSelect={setActiveGame} scores={scores} />;
  }

  switch (activeGame) {
    case 'color-collector':
      return (
        <ColorCollector
          onBack={handleBack}
          onSubmitScore={handleSubmitColorCollector}
          bestScore={getScore('color-collector')}
        />
      );
    case 'memory-match':
      return (
        <MemoryMatch
          onBack={handleBack}
          onSubmitScore={handleSubmitMemory}
          bestScore={getScore('memory-match')}
        />
      );
    case 'wordle':
      return (
        <Wordle
          onBack={handleBack}
          onSubmitScore={handleSubmitWordle}
          bestScore={getScore('wordle')}
        />
      );
    case 'maze':
      return (
        <Maze
          onBack={handleBack}
          onSubmitScore={handleSubmitMaze}
          bestScore={getScore('maze')}
        />
      );
    default:
      return <ArcadeHub onSelect={setActiveGame} scores={scores} />;
  }
}

export default App;
