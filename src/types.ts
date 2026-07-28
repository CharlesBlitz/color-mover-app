export type GameId = 'color-collector' | 'memory-match' | 'wordle' | 'maze';

export interface GameMeta {
  id: GameId;
  name: string;
  description: string;
  accent: string;
  scoreLabel: string;
}

export const GAMES: GameMeta[] = [
  {
    id: 'color-collector',
    name: 'Color Collector',
    description: 'Move your character and collect golden zones before time runs out!',
    accent: 'emerald',
    scoreLabel: 'High Score',
  },
  {
    id: 'memory-match',
    name: 'Memory Match',
    description: 'Flip cards and find all the matching pairs in fewest moves.',
    accent: 'sky',
    scoreLabel: 'Best Moves',
  },
  {
    id: 'wordle',
    name: 'Word Hunt',
    description: 'Guess the hidden five-letter word in six tries.',
    accent: 'amber',
    scoreLabel: 'Best Streak',
  },
  {
    id: 'maze',
    name: 'Maze Escape',
    description: 'Navigate the random maze to the exit as fast as you can.',
    accent: 'rose',
    scoreLabel: 'Best Time',
  },
];
