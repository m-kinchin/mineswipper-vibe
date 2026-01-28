import { describe, it, expect, beforeEach, vi } from 'vitest';
import { addHighScore, getHighScores, clearHighScores, loadHighScores } from './highScores';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('highScores', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('loadHighScores', () => {
    it('should return empty scores when no data exists', () => {
      const scores = loadHighScores();
      expect(scores.beginner).toEqual([]);
      expect(scores.master).toEqual([]);
      expect(scores.expert).toEqual([]);
    });

    it('should load existing scores from localStorage', () => {
      const testData = {
        beginner: [{ time: 60, date: '2026-01-01' }],
        master: [],
        expert: [],
      };
      localStorageMock.setItem('minesweeper-high-scores', JSON.stringify(testData));
      
      const scores = loadHighScores();
      expect(scores.beginner).toHaveLength(1);
      expect(scores.beginner[0].time).toBe(60);
    });
  });

  describe('addHighScore', () => {
    it('should add first score and return rank 1', () => {
      const rank = addHighScore('beginner', 100);
      expect(rank).toBe(1);
      
      const scores = getHighScores('beginner');
      expect(scores).toHaveLength(1);
      expect(scores[0].time).toBe(100);
    });

    it('should insert faster time at correct position', () => {
      addHighScore('beginner', 100);
      addHighScore('beginner', 50);
      
      const scores = getHighScores('beginner');
      expect(scores[0].time).toBe(50);
      expect(scores[1].time).toBe(100);
    });

    it('should return correct rank for new score', () => {
      addHighScore('beginner', 100);
      addHighScore('beginner', 150);
      
      const rank = addHighScore('beginner', 120);
      expect(rank).toBe(2); // Between 100 and 150
    });

    it('should limit to 5 scores', () => {
      for (let i = 1; i <= 7; i++) {
        addHighScore('beginner', i * 10);
      }
      
      const scores = getHighScores('beginner');
      expect(scores).toHaveLength(5);
      expect(scores[0].time).toBe(10); // Fastest
      expect(scores[4].time).toBe(50); // 5th fastest
    });

    it('should return null if score does not qualify for top 5', () => {
      for (let i = 1; i <= 5; i++) {
        addHighScore('beginner', i * 10);
      }
      
      const rank = addHighScore('beginner', 500);
      expect(rank).toBeNull();
    });

    it('should store scores separately per difficulty', () => {
      addHighScore('beginner', 50);
      addHighScore('master', 100);
      addHighScore('expert', 150);
      
      expect(getHighScores('beginner')[0].time).toBe(50);
      expect(getHighScores('master')[0].time).toBe(100);
      expect(getHighScores('expert')[0].time).toBe(150);
    });
  });

  describe('clearHighScores', () => {
    it('should clear all scores', () => {
      addHighScore('beginner', 100);
      addHighScore('master', 200);
      
      clearHighScores();
      
      expect(getHighScores('beginner')).toEqual([]);
      expect(getHighScores('master')).toEqual([]);
    });
  });

  describe('getHighScores', () => {
    it('should return empty array for level with no scores', () => {
      expect(getHighScores('expert')).toEqual([]);
    });

    it('should return scores sorted by time ascending', () => {
      addHighScore('beginner', 150);
      addHighScore('beginner', 50);
      addHighScore('beginner', 100);
      
      const scores = getHighScores('beginner');
      expect(scores[0].time).toBe(50);
      expect(scores[1].time).toBe(100);
      expect(scores[2].time).toBe(150);
    });
  });
});
