import { MinesweeperGame, GameSaveData } from './game';

const GAME_STATE_KEY = 'minesweeper-saved-game';

export interface SavedGameState {
  gameData: GameSaveData;
  level: string;
  elapsedTime: number;
  savedAt: number;
}

export class GamePersistence {
  /**
   * Save the current game state to localStorage
   */
  static saveGame(game: MinesweeperGame, level: string, elapsedTime: number): void {
    // Don't save if game is over
    if (game.gameState !== 'playing') {
      this.clearSavedGame();
      return;
    }

    const savedState: SavedGameState = {
      gameData: game.serialize(),
      level,
      elapsedTime,
      savedAt: Date.now()
    };

    try {
      localStorage.setItem(GAME_STATE_KEY, JSON.stringify(savedState));
    } catch (e) {
      console.error('Failed to save game state:', e);
    }
  }

  /**
   * Load saved game state from localStorage
   */
  static loadGame(): SavedGameState | null {
    try {
      const saved = localStorage.getItem(GAME_STATE_KEY);
      if (!saved) return null;

      const state = JSON.parse(saved) as SavedGameState;
      
      // Validate the saved data has required fields
      if (!state.gameData || !state.level || typeof state.elapsedTime !== 'number') {
        this.clearSavedGame();
        return null;
      }

      return state;
    } catch (e) {
      console.error('Failed to load game state:', e);
      this.clearSavedGame();
      return null;
    }
  }

  /**
   * Check if there's a saved game available
   */
  static hasSavedGame(): boolean {
    return this.loadGame() !== null;
  }

  /**
   * Clear the saved game from localStorage
   */
  static clearSavedGame(): void {
    try {
      localStorage.removeItem(GAME_STATE_KEY);
    } catch (e) {
      console.error('Failed to clear saved game:', e);
    }
  }

  /**
   * Restore a game from saved state
   */
  static restoreGame(savedState: SavedGameState): MinesweeperGame {
    return MinesweeperGame.deserialize(savedState.gameData);
  }
}
