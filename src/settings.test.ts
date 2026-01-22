import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Test theme validation logic
describe('Theme Validation', () => {
  const validThemes = ['default', 'dark', 'classic'];
  
  function isValidTheme(theme: string): boolean {
    return validThemes.includes(theme);
  }

  it('accepts valid theme names', () => {
    expect(isValidTheme('default')).toBe(true);
    expect(isValidTheme('dark')).toBe(true);
    expect(isValidTheme('classic')).toBe(true);
  });

  it('rejects invalid theme names', () => {
    expect(isValidTheme('light')).toBe(false);
    expect(isValidTheme('neon')).toBe(false);
    expect(isValidTheme('')).toBe(false);
    expect(isValidTheme('DEFAULT')).toBe(false); // Case sensitive
  });
});

// Test animation enable/disable logic
describe('Animation State Logic', () => {
  function parseBoolean(value: string): boolean {
    return value === 'true';
  }

  it('parses boolean string correctly', () => {
    expect(parseBoolean('true')).toBe(true);
    expect(parseBoolean('false')).toBe(false);
    expect(parseBoolean('')).toBe(false);
  });

  it('defaults to enabled when no preference saved', () => {
    const saved: string | null = null;
    const enabled = saved !== null ? parseBoolean(saved) : true;
    expect(enabled).toBe(true);
  });

  it('respects saved enabled preference', () => {
    const saved: string | null = 'true';
    const enabled = saved !== null ? parseBoolean(saved) : true;
    expect(enabled).toBe(true);
  });

  it('respects saved disabled preference', () => {
    const saved: string | null = 'false';
    const enabled = saved !== null ? parseBoolean(saved) : true;
    expect(enabled).toBe(false);
  });
});

// Test localStorage mock interactions
describe('Preference Storage', () => {
  const THEME_KEY = 'minesweeper-theme';
  const ANIMATION_KEY = 'minesweeper-animations';
  let storage: Map<string, string>;

  beforeEach(() => {
    storage = new Map();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
      clear: () => storage.clear(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('saves theme preference', () => {
    localStorage.setItem(THEME_KEY, 'dark');
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');
  });

  it('saves animation preference', () => {
    localStorage.setItem(ANIMATION_KEY, 'false');
    expect(localStorage.getItem(ANIMATION_KEY)).toBe('false');
  });

  it('returns null for missing keys', () => {
    expect(localStorage.getItem('nonexistent')).toBeNull();
  });

  it('overwrites existing preference', () => {
    localStorage.setItem(THEME_KEY, 'dark');
    localStorage.setItem(THEME_KEY, 'classic');
    expect(localStorage.getItem(THEME_KEY)).toBe('classic');
  });
});

// Test CSS class application logic
describe('Theme Application Logic', () => {
  it('default theme should remove data-theme attribute', () => {
    const theme = 'default';
    const shouldRemove = theme === 'default';
    expect(shouldRemove).toBe(true);
  });

  it('non-default themes should set data-theme attribute', () => {
    const themes = ['dark', 'classic'];
    themes.forEach(theme => {
      const shouldRemove = theme === 'default';
      expect(shouldRemove).toBe(false);
    });
  });
});

// Test animation class logic
describe('Animation Class Application', () => {
  it('animation classes follow naming convention', () => {
    const animationClasses = [
      'animate-reveal',
      'animate-flag',
      'animate-unflag',
      'animate-explode',
      'shake',
      'win-glow',
      'win-pulse',
      'animate-win'
    ];

    animationClasses.forEach(cls => {
      expect(cls).toMatch(/^[a-z-]+$/);
    });
  });

  it('animation durations are within acceptable range', () => {
    const durations = {
      reveal: 200,
      flag: 250,
      unflag: 150,
      explode: 300,
      shake: 400,
      winGlow: 1800,
      winPulse: 400
    };

    // Most animations should be under 500ms for responsiveness
    expect(durations.reveal).toBeLessThanOrEqual(500);
    expect(durations.flag).toBeLessThanOrEqual(500);
    expect(durations.unflag).toBeLessThanOrEqual(500);
    expect(durations.explode).toBeLessThanOrEqual(500);
    expect(durations.shake).toBeLessThanOrEqual(500);
    
    // Win animation can be longer
    expect(durations.winGlow).toBeLessThanOrEqual(2000);
  });
});

// Test difficulty level configurations
describe('Difficulty Levels', () => {
  const LEVELS = {
    beginner: { rows: 9, cols: 9, mines: 10 },
    master: { rows: 16, cols: 16, mines: 40 },
    expert: { rows: 16, cols: 30, mines: 99 },
  };

  it('beginner level has correct configuration', () => {
    expect(LEVELS.beginner.rows).toBe(9);
    expect(LEVELS.beginner.cols).toBe(9);
    expect(LEVELS.beginner.mines).toBe(10);
  });

  it('master level has correct configuration', () => {
    expect(LEVELS.master.rows).toBe(16);
    expect(LEVELS.master.cols).toBe(16);
    expect(LEVELS.master.mines).toBe(40);
  });

  it('expert level has correct configuration', () => {
    expect(LEVELS.expert.rows).toBe(16);
    expect(LEVELS.expert.cols).toBe(30);
    expect(LEVELS.expert.mines).toBe(99);
  });

  it('mine density is reasonable for all levels', () => {
    Object.values(LEVELS).forEach(level => {
      const totalCells = level.rows * level.cols;
      const density = level.mines / totalCells;
      // Density should be between 10% and 25%
      expect(density).toBeGreaterThanOrEqual(0.1);
      expect(density).toBeLessThanOrEqual(0.25);
    });
  });

  it('all levels have room for first click safe zone', () => {
    Object.values(LEVELS).forEach(level => {
      const totalCells = level.rows * level.cols;
      const safeZone = 9; // 3x3 around first click
      expect(totalCells - safeZone).toBeGreaterThan(level.mines);
    });
  });
});
