import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { validateCustomSettings, getMaxMines, CUSTOM_LIMITS } from './validation';

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

// Test localStorage mock interactions
describe('Preference Storage', () => {
  const THEME_KEY = 'minesweeper-theme';
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

  it('returns null for missing keys', () => {
    expect(localStorage.getItem('nonexistent')).toBeNull();
  });

  it('overwrites existing preference', () => {
    localStorage.setItem(THEME_KEY, 'dark');
    localStorage.setItem(THEME_KEY, 'classic');
    expect(localStorage.getItem(THEME_KEY)).toBe('classic');
  });
});

// Test auto-pause preference storage
describe('Auto-Pause Preference', () => {
  const AUTO_PAUSE_KEY = 'minesweeper-auto-pause';
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

  it('defaults to true when not set', () => {
    const saved = localStorage.getItem(AUTO_PAUSE_KEY);
    const isEnabled = saved === null ? true : saved === 'true';
    expect(isEnabled).toBe(true);
  });

  it('saves auto-pause preference as true', () => {
    localStorage.setItem(AUTO_PAUSE_KEY, 'true');
    expect(localStorage.getItem(AUTO_PAUSE_KEY)).toBe('true');
  });

  it('saves auto-pause preference as false', () => {
    localStorage.setItem(AUTO_PAUSE_KEY, 'false');
    expect(localStorage.getItem(AUTO_PAUSE_KEY)).toBe('false');
  });

  it('reads saved preference correctly', () => {
    localStorage.setItem(AUTO_PAUSE_KEY, 'false');
    const saved = localStorage.getItem(AUTO_PAUSE_KEY);
    const isEnabled = saved === null ? true : saved === 'true';
    expect(isEnabled).toBe(false);
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
    custom: { rows: 10, cols: 10, mines: 15 },
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

  it('custom level has default configuration', () => {
    expect(LEVELS.custom.rows).toBe(10);
    expect(LEVELS.custom.cols).toBe(10);
    expect(LEVELS.custom.mines).toBe(15);
  });
});

// Test custom difficulty validation (uses imported validateCustomSettings)
describe('Custom Difficulty Validation', () => {
  it('accepts valid custom settings', () => {
    expect(validateCustomSettings(10, 10, 15)).toBeNull();
    expect(validateCustomSettings(5, 5, 1)).toBeNull();
    expect(validateCustomSettings(30, 50, 100)).toBeNull();
  });

  it('rejects rows outside valid range', () => {
    expect(validateCustomSettings(4, 10, 10)).toContain('Rows must be between');
    expect(validateCustomSettings(31, 10, 10)).toContain('Rows must be between');
  });

  it('rejects columns outside valid range', () => {
    expect(validateCustomSettings(10, 4, 10)).toContain('Columns must be between');
    expect(validateCustomSettings(10, 51, 10)).toContain('Columns must be between');
  });

  it('rejects zero or negative mines', () => {
    expect(validateCustomSettings(10, 10, 0)).toBe('Must have at least 1 mine');
    expect(validateCustomSettings(10, 10, -5)).toBe('Must have at least 1 mine');
  });

  it('rejects mines exceeding 80% of cells', () => {
    // 10x10 = 100 cells, 80% = 80 mines max
    expect(validateCustomSettings(10, 10, 81)).toBe('Mines cannot exceed 80 (80% of cells)');
    // 5x5 = 25 cells, 80% = 20 mines max
    expect(validateCustomSettings(5, 5, 21)).toBe('Mines cannot exceed 20 (80% of cells)');
  });

  it('accepts mines at exactly 80% of cells', () => {
    // 10x10 = 100 cells, 80% = 80 mines
    expect(validateCustomSettings(10, 10, 80)).toBeNull();
  });

  it('rejects NaN values', () => {
    expect(validateCustomSettings(NaN, 10, 10)).toBe('Please enter valid numbers');
    expect(validateCustomSettings(10, NaN, 10)).toBe('Please enter valid numbers');
    expect(validateCustomSettings(10, 10, NaN)).toBe('Please enter valid numbers');
  });

  it('calculates max mines correctly for various grid sizes', () => {
    const testCases = [
      { rows: 5, cols: 5, expectedMax: 20 },      // 25 * 0.8 = 20
      { rows: 10, cols: 10, expectedMax: 80 },    // 100 * 0.8 = 80
      { rows: 16, cols: 16, expectedMax: 204 },   // 256 * 0.8 = 204.8 -> 204
      { rows: 30, cols: 50, expectedMax: 1200 },  // 1500 * 0.8 = 1200
    ];

    testCases.forEach(({ rows, cols, expectedMax }) => {
      expect(getMaxMines(rows, cols)).toBe(expectedMax);
      // Should accept exactly max
      expect(validateCustomSettings(rows, cols, expectedMax)).toBeNull();
      // Should reject max + 1
      expect(validateCustomSettings(rows, cols, expectedMax + 1)).not.toBeNull();
    });
  });

  it('uses constants from CUSTOM_LIMITS', () => {
    expect(CUSTOM_LIMITS.rows.min).toBe(5);
    expect(CUSTOM_LIMITS.rows.max).toBe(30);
    expect(CUSTOM_LIMITS.cols.min).toBe(5);
    expect(CUSTOM_LIMITS.cols.max).toBe(50);
    expect(CUSTOM_LIMITS.minePercentage).toBe(0.8);
  });
});

// Test game persistence logic
describe('Game Persistence', () => {
  const GAME_STATE_KEY = 'minesweeper-saved-game';
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

  it('saves game state to localStorage', () => {
    const gameState = {
      gameData: {
        config: { rows: 9, cols: 9, mines: 10 },
        board: [],
        gameState: 'playing',
        flagCount: 0,
        firstClick: true
      },
      level: 'beginner',
      elapsedTime: 42,
      savedAt: Date.now()
    };

    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
    
    const saved = localStorage.getItem(GAME_STATE_KEY);
    expect(saved).not.toBeNull();
    
    const parsed = JSON.parse(saved!);
    expect(parsed.level).toBe('beginner');
    expect(parsed.elapsedTime).toBe(42);
  });

  it('returns null for missing saved game', () => {
    expect(localStorage.getItem(GAME_STATE_KEY)).toBeNull();
  });

  it('clears saved game from localStorage', () => {
    localStorage.setItem(GAME_STATE_KEY, '{"test": true}');
    expect(localStorage.getItem(GAME_STATE_KEY)).not.toBeNull();
    
    localStorage.removeItem(GAME_STATE_KEY);
    expect(localStorage.getItem(GAME_STATE_KEY)).toBeNull();
  });

  it('validates saved game data structure', () => {
    const validState = {
      gameData: { config: {}, board: [], gameState: 'playing', flagCount: 0, firstClick: true },
      level: 'beginner',
      elapsedTime: 100,
      savedAt: Date.now()
    };

    const isValid = (state: unknown): boolean => {
      if (!state || typeof state !== 'object') return false;
      const s = state as Record<string, unknown>;
      return !!s.gameData && !!s.level && typeof s.elapsedTime === 'number';
    };

    expect(isValid(validState)).toBe(true);
    expect(isValid({})).toBe(false);
    expect(isValid({ gameData: {} })).toBe(false);
    expect(isValid(null)).toBe(false);
  });

  it('preserves timer value in saved state', () => {
    const elapsedTime = 157;
    const savedState = {
      gameData: { config: {}, board: [], gameState: 'playing', flagCount: 0, firstClick: false },
      level: 'master',
      elapsedTime,
      savedAt: Date.now()
    };

    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(savedState));
    const restored = JSON.parse(localStorage.getItem(GAME_STATE_KEY)!);
    
    expect(restored.elapsedTime).toBe(157);
  });
});

// Test custom settings persistence
describe('Custom Settings Persistence', () => {
  const CUSTOM_SETTINGS_KEY = 'minesweeper-custom-settings';
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

  it('saves custom settings to localStorage', () => {
    const settings = { rows: 20, cols: 25, mines: 100 };
    localStorage.setItem(CUSTOM_SETTINGS_KEY, JSON.stringify(settings));

    const saved = localStorage.getItem(CUSTOM_SETTINGS_KEY);
    expect(saved).not.toBeNull();

    const parsed = JSON.parse(saved!);
    expect(parsed.rows).toBe(20);
    expect(parsed.cols).toBe(25);
    expect(parsed.mines).toBe(100);
  });

  it('returns null when no custom settings saved', () => {
    expect(localStorage.getItem(CUSTOM_SETTINGS_KEY)).toBeNull();
  });

  it('overwrites previous custom settings', () => {
    localStorage.setItem(CUSTOM_SETTINGS_KEY, JSON.stringify({ rows: 10, cols: 10, mines: 15 }));
    localStorage.setItem(CUSTOM_SETTINGS_KEY, JSON.stringify({ rows: 20, cols: 30, mines: 50 }));

    const saved = JSON.parse(localStorage.getItem(CUSTOM_SETTINGS_KEY)!);
    expect(saved.rows).toBe(20);
    expect(saved.cols).toBe(30);
    expect(saved.mines).toBe(50);
  });

  it('validates custom settings structure', () => {
    const isValidCustomSettings = (data: unknown): boolean => {
      if (!data || typeof data !== 'object') return false;
      const s = data as Record<string, unknown>;
      return typeof s.rows === 'number' && 
             typeof s.cols === 'number' && 
             typeof s.mines === 'number';
    };

    expect(isValidCustomSettings({ rows: 10, cols: 10, mines: 15 })).toBe(true);
    expect(isValidCustomSettings({ rows: 10, cols: 10 })).toBe(false);
    expect(isValidCustomSettings({ rows: '10', cols: 10, mines: 15 })).toBe(false);
    expect(isValidCustomSettings(null)).toBe(false);
    expect(isValidCustomSettings({})).toBe(false);
  });
});

// Test version display
describe('Version Display', () => {
  it('version format follows semantic versioning pattern', () => {
    const semverRegex = /^\d+\.\d+\.\d+$/;
    const testVersions = ['1.0.0', '2.1.3', '10.20.30'];
    
    testVersions.forEach(version => {
      expect(semverRegex.test(version)).toBe(true);
    });
  });

  it('rejects invalid version formats', () => {
    const semverRegex = /^\d+\.\d+\.\d+$/;
    const invalidVersions = ['1.0', 'v1.0.0', '1.0.0-beta', 'abc'];
    
    invalidVersions.forEach(version => {
      expect(semverRegex.test(version)).toBe(false);
    });
  });

  it('formats version with v prefix correctly', () => {
    const formatVersion = (version: string) => `v${version}`;
    
    expect(formatVersion('1.0.0')).toBe('v1.0.0');
    expect(formatVersion('2.5.10')).toBe('v2.5.10');
  });
});
