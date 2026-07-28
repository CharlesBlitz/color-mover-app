import { useState, useEffect, useCallback } from 'react';
import type { GameId } from './types';

const STORAGE_KEY = 'green-arcade-scores';

type ScoreMap = Partial<Record<GameId, number>>;

function readScores(): ScoreMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ScoreMap;
  } catch {
    return {};
  }
}

function writeScores(scores: ScoreMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch {
    // ignore
  }
}

export function useHighScores() {
  const [scores, setScores] = useState<ScoreMap>({});

  useEffect(() => {
    setScores(readScores());
  }, []);

  const submitScore = useCallback((game: GameId, value: number, lowerIsBetter: boolean) => {
    setScores(prev => {
      const existing = prev[game];
      let shouldUpdate = false;
      if (existing === undefined) {
        shouldUpdate = true;
      } else if (lowerIsBetter) {
        shouldUpdate = value < existing;
      } else {
        shouldUpdate = value > existing;
      }
      if (!shouldUpdate) return prev;
      const next = { ...prev, [game]: value };
      writeScores(next);
      return next;
    });
  }, []);

  const getScore = useCallback((game: GameId): number | undefined => scores[game], [scores]);

  return { scores, submitScore, getScore };
}
