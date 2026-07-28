import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { ANSWER_WORDS, VALID_WORDS } from '../data/words';

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

type LetterState = 'correct' | 'present' | 'absent' | 'empty';

interface Guess {
  letters: string[];
  states: LetterState[];
}

function pickWord(): string {
  return ANSWER_WORDS[Math.floor(Math.random() * ANSWER_WORDS.length)];
}

function evaluateGuess(guess: string, answer: string): LetterState[] {
  const states: LetterState[] = [];
  const answerArr = answer.split('');
  const guessArr = guess.split('');
  const used = new Array(WORD_LENGTH).fill(false);

  // First pass: correct
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessArr[i] === answerArr[i]) {
      states[i] = 'correct';
      used[i] = true;
    }
  }
  // Second pass: present / absent
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (states[i] === 'correct') continue;
    let found = false;
    for (let j = 0; j < WORD_LENGTH; j++) {
      if (!used[j] && guessArr[i] === answerArr[j]) {
        states[i] = 'present';
        used[j] = true;
        found = true;
        break;
      }
    }
    if (!found) states[i] = 'absent';
  }
  return states;
}

const KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['Enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace'],
];

interface Props {
  onBack: () => void;
  onSubmitScore: (streak: number) => void;
  bestScore?: number;
}

export default function Wordle({ onBack, onSubmitScore, bestScore }: Props) {
  const [answer, setAnswer] = useState(pickWord);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [streak, setStreak] = useState(0);
  const [error, setError] = useState('');
  const [keyStates, setKeyStates] = useState<Record<string, LetterState>>({});

  const updateKeyStates = useCallback(
    (guess: string, states: LetterState[]) => {
      setKeyStates((prev) => {
        const next = { ...prev };
        for (let i = 0; i < WORD_LENGTH; i++) {
          const letter = guess[i];
          const newState = states[i];
          const existing = next[letter];
          // Don't downgrade: correct > present > absent
          if (existing === 'correct') continue;
          if (existing === 'present' && newState === 'absent') continue;
          next[letter] = newState;
        }
        return next;
      });
    },
    [],
  );

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== WORD_LENGTH) {
      setError('Not enough letters');
      return;
    }
    if (!VALID_WORDS.has(currentGuess.toLowerCase())) {
      setError('Not in word list');
      return;
    }
    setError('');

    const states = evaluateGuess(currentGuess.toLowerCase(), answer);
    const newGuess: Guess = { letters: currentGuess.toLowerCase().split(''), states };
    const newGuesses = [...guesses, newGuess];
    setGuesses(newGuesses);
    updateKeyStates(currentGuess.toLowerCase(), states);
    setCurrentGuess('');

    if (currentGuess.toLowerCase() === answer) {
      setGameOver(true);
      setWon(true);
      const newStreak = streak + 1;
      setStreak(newStreak);
      onSubmitScore(newStreak);
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameOver(true);
      setWon(false);
      setStreak(0);
    }
  }, [currentGuess, answer, guesses, streak, updateKeyStates, onSubmitScore]);

  const handleKey = useCallback(
    (key: string) => {
      if (gameOver) return;
      if (key === 'Enter') {
        submitGuess();
      } else if (key === 'Backspace') {
        setCurrentGuess((g) => g.slice(0, -1));
        setError('');
      } else if (/^[a-zA-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((g) => g + key.toLowerCase());
        setError('');
      }
    },
    [gameOver, currentGuess, submitGuess],
  );

  // Physical keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleKey('Enter');
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleKey('Backspace');
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKey(e.key);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKey]);

  const restart = () => {
    setAnswer(pickWord());
    setGuesses([]);
    setCurrentGuess('');
    setGameOver(false);
    setWon(false);
    setError('');
    setKeyStates({});
  };

  const getTileColor = (state: LetterState) => {
    switch (state) {
      case 'correct': return 'bg-emerald-500 border-emerald-500 text-white';
      case 'present': return 'bg-amber-500 border-amber-500 text-white';
      case 'absent': return 'bg-gray-600 border-gray-600 text-white';
      default: return 'bg-transparent border-gray-400 text-white';
    }
  };

  const getKeyColor = (letter: string) => {
    const state = keyStates[letter];
    switch (state) {
      case 'correct': return 'bg-emerald-500 text-white';
      case 'present': return 'bg-amber-500 text-white';
      case 'absent': return 'bg-gray-600 text-white';
      default: return 'bg-white/20 text-white';
    }
  };

  // Build display rows
  const rows = [];
  for (let i = 0; i < MAX_GUESSES; i++) {
    if (i < guesses.length) {
      rows.push(guesses[i]);
    } else if (i === guesses.length) {
      rows.push({
        letters: currentGuess.split(''),
        states: new Array(WORD_LENGTH).fill('empty' as LetterState),
      });
    } else {
      rows.push({ letters: [], states: new Array(WORD_LENGTH).fill('empty' as LetterState) });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-700 to-amber-500 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-3xl flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} /> Arcade
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Word Hunt</h1>
        <div className="text-right">
          <span className="text-white/70 text-sm">Streak: </span>
          <span className="text-white font-bold">{streak}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="flex flex-col gap-1.5 mb-4">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1.5">
            {Array.from({ length: WORD_LENGTH }).map((_, colIdx) => {
              const letter = row.letters[colIdx] || '';
              const state = row.states[colIdx];
              const isCurrentRow = rowIdx === guesses.length && letter !== '';
              return (
                <div
                  key={colIdx}
                  className={`w-12 h-12 sm:w-14 sm:h-14 border-2 rounded-lg flex items-center justify-center text-2xl font-bold uppercase transition-all duration-300 ${
                    isCurrentRow ? 'border-gray-300 scale-105' : ''
                  } ${getTileColor(state)}`}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-200 text-sm mb-2 animate-pulse">{error}</p>
      )}

      {/* Game over overlay */}
      {gameOver && (
        <div className="mb-4 bg-black/40 rounded-xl px-6 py-4 text-center">
          <h2 className={`text-2xl font-bold mb-1 ${won ? 'text-emerald-300' : 'text-red-300'}`}>
            {won ? 'You Got It!' : 'Better Luck Next Time'}
          </h2>
          <p className="text-white/80">
            The word was <span className="font-bold uppercase text-amber-300">{answer}</span>
          </p>
          <p className="text-white/60 text-sm mt-1">Streak: {streak}</p>
          <div className="flex gap-3 justify-center mt-4">
            <button
              onClick={restart}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
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

      {/* Keyboard */}
      {!gameOver && (
        <div className="flex flex-col gap-1.5 w-full max-w-lg">
          {KEYBOARD_ROWS.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-1.5 justify-center">
              {row.map((key) => (
                <button
                  key={key}
                  onClick={() => handleKey(key)}
                  className={`rounded-lg font-bold text-sm sm:text-base transition-colors hover:brightness-110 ${
                    key === 'Enter' || key === 'Backspace'
                      ? 'px-3 sm:px-4 py-4 text-xs'
                      : 'w-8 sm:w-10 py-4'
                  } ${getKeyColor(key)}`}
                >
                  {key === 'Backspace' ? '⌫' : key === 'Enter' ? 'Enter' : key.toUpperCase()}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {bestScore !== undefined && (
        <p className="mt-4 text-white/60 text-sm">Best Streak: {bestScore}</p>
      )}
    </div>
  );
}
