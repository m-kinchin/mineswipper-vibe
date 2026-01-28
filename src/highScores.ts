export interface HighScore {
  time: number; // in seconds
  date: string; // ISO date string
}

export interface HighScores {
  beginner: HighScore[];
  master: HighScore[];
  expert: HighScore[];
}

const STORAGE_KEY = 'minesweeper-high-scores';
const MAX_SCORES = 5;

function getEmptyScores(): HighScores {
  return {
    beginner: [],
    master: [],
    expert: [],
  };
}

export function loadHighScores(): HighScores {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        beginner: parsed.beginner || [],
        master: parsed.master || [],
        expert: parsed.expert || [],
      };
    }
  } catch {
    // Invalid data, return empty
  }
  return getEmptyScores();
}

export function saveHighScores(scores: HighScores): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
}

export function clearHighScores(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Adds a new score if it qualifies for top 5.
 * Returns the rank (1-5) if it's a new high score, or null if not.
 */
export function addHighScore(
  level: 'beginner' | 'master' | 'expert',
  time: number
): number | null {
  const scores = loadHighScores();
  const levelScores = scores[level];
  
  const newScore: HighScore = {
    time,
    date: new Date().toISOString(),
  };
  
  // Find position to insert (sorted by time ascending)
  let insertIndex = levelScores.findIndex(s => time < s.time);
  if (insertIndex === -1) {
    insertIndex = levelScores.length;
  }
  
  // Only add if within top 10
  if (insertIndex >= MAX_SCORES) {
    return null;
  }
  
  // Insert and trim to max
  levelScores.splice(insertIndex, 0, newScore);
  if (levelScores.length > MAX_SCORES) {
    levelScores.pop();
  }
  
  saveHighScores(scores);
  return insertIndex + 1; // Return 1-based rank
}

export function getHighScores(level: 'beginner' | 'master' | 'expert'): HighScore[] {
  return loadHighScores()[level];
}
