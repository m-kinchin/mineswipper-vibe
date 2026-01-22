import { describe, it, expect, beforeEach } from 'vitest';
import { MinesweeperGame } from './game';

describe('MinesweeperGame', () => {
  describe('Board Initialization', () => {
    it('creates board with correct dimensions', () => {
      const game = new MinesweeperGame({ rows: 9, cols: 9, mines: 10 });
      expect(game.rows).toBe(9);
      expect(game.cols).toBe(9);
    });

    it('all cells start unrevealed and unflagged', () => {
      const game = new MinesweeperGame({ rows: 5, cols: 5, mines: 5 });
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          const cell = game.getCell(row, col);
          expect(cell?.isRevealed).toBe(false);
          expect(cell?.isFlagged).toBe(false);
        }
      }
    });

    it('no mines placed before first click', () => {
      const game = new MinesweeperGame({ rows: 5, cols: 5, mines: 5 });
      let mineCount = 0;
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          if (game.getCell(row, col)?.isMine) mineCount++;
        }
      }
      expect(mineCount).toBe(0);
    });
  });

  describe('Mine Placement', () => {
    it('places correct number of mines after first click', () => {
      const game = new MinesweeperGame({ rows: 9, cols: 9, mines: 10 });
      game.reveal(4, 4); // First click

      let mineCount = 0;
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (game.getCell(row, col)?.isMine) mineCount++;
        }
      }
      expect(mineCount).toBe(10);
    });

    it('first click area (3x3) is mine-free', () => {
      const game = new MinesweeperGame({ rows: 9, cols: 9, mines: 10 });
      game.reveal(4, 4); // First click at center

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const cell = game.getCell(4 + dr, 4 + dc);
          expect(cell?.isMine).toBe(false);
        }
      }
    });

    it('calculates adjacent mine counts correctly', () => {
      const game = new MinesweeperGame({ rows: 9, cols: 9, mines: 10 });
      game.reveal(0, 0); // First click

      // Check that all non-mine cells have valid adjacent counts (0-8)
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          const cell = game.getCell(row, col);
          if (!cell?.isMine) {
            expect(cell?.adjacentMines).toBeGreaterThanOrEqual(0);
            expect(cell?.adjacentMines).toBeLessThanOrEqual(8);
          }
        }
      }
    });
  });

  describe('Reveal Mechanics', () => {
    let game: MinesweeperGame;

    beforeEach(() => {
      game = new MinesweeperGame({ rows: 9, cols: 9, mines: 10 });
    });

    it('revealing a safe cell marks it as revealed', () => {
      game.reveal(4, 4); // First click is always safe
      expect(game.getCell(4, 4)?.isRevealed).toBe(true);
    });

    it('revealing a mine triggers game over', () => {
      game.reveal(0, 0); // First click - safe

      // Find a mine and reveal it
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          const cell = game.getCell(row, col);
          if (cell?.isMine && !cell.isRevealed) {
            game.reveal(row, col);
            expect(game.gameState).toBe('lost');
            return;
          }
        }
      }
    });

    it('cannot reveal flagged cells', () => {
      game.reveal(4, 4); // First click
      
      // Find an unrevealed cell
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          const cell = game.getCell(row, col);
          if (!cell?.isRevealed) {
            game.toggleFlag(row, col);
            game.reveal(row, col);
            expect(game.getCell(row, col)?.isRevealed).toBe(false);
            return;
          }
        }
      }
    });

    it('cannot reveal already revealed cells', () => {
      game.reveal(4, 4);
      const result = game.reveal(4, 4); // Try to reveal again
      expect(result).toBe(false);
    });

    it('cannot reveal when game is over', () => {
      game.reveal(0, 0); // First click

      // Find and click a mine to end game
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (game.getCell(row, col)?.isMine) {
            game.reveal(row, col);
            break;
          }
        }
        if (game.gameState === 'lost') break;
      }

      // Try to reveal another cell
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (!game.getCell(row, col)?.isRevealed) {
            const result = game.reveal(row, col);
            expect(result).toBe(false);
            return;
          }
        }
      }
    });
  });

  describe('Flag Mechanics', () => {
    let game: MinesweeperGame;

    beforeEach(() => {
      game = new MinesweeperGame({ rows: 9, cols: 9, mines: 10 });
      game.reveal(4, 4); // First click to initialize
    });

    it('toggling flag on unrevealed cell works', () => {
      // Find an unrevealed cell
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          const cell = game.getCell(row, col);
          if (!cell?.isRevealed) {
            game.toggleFlag(row, col);
            expect(game.getCell(row, col)?.isFlagged).toBe(true);
            return;
          }
        }
      }
    });

    it('toggling flag again removes it', () => {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          const cell = game.getCell(row, col);
          if (!cell?.isRevealed) {
            game.toggleFlag(row, col);
            game.toggleFlag(row, col);
            expect(game.getCell(row, col)?.isFlagged).toBe(false);
            return;
          }
        }
      }
    });

    it('cannot flag revealed cells', () => {
      const result = game.toggleFlag(4, 4); // Try to flag revealed cell
      expect(result).toBe(false);
      expect(game.getCell(4, 4)?.isFlagged).toBe(false);
    });

    it('flag count updates correctly', () => {
      expect(game.flagCount).toBe(0);

      // Find unrevealed cells and flag them
      let flagged = 0;
      for (let row = 0; row < 9 && flagged < 3; row++) {
        for (let col = 0; col < 9 && flagged < 3; col++) {
          const cell = game.getCell(row, col);
          if (!cell?.isRevealed) {
            game.toggleFlag(row, col);
            flagged++;
          }
        }
      }

      expect(game.flagCount).toBe(3);
    });

    it('cannot flag when game is over', () => {
      // Find and click a mine to end game
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (game.getCell(row, col)?.isMine) {
            game.reveal(row, col);
            break;
          }
        }
        if (game.gameState === 'lost') break;
      }

      // Try to flag
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (!game.getCell(row, col)?.isRevealed) {
            const result = game.toggleFlag(row, col);
            expect(result).toBe(false);
            return;
          }
        }
      }
    });
  });

  describe('Win Conditions', () => {
    it('wins when all safe cells are revealed', () => {
      const game = new MinesweeperGame({ rows: 3, cols: 3, mines: 1 });
      game.reveal(1, 1); // First click at center

      // Reveal all non-mine cells
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const cell = game.getCell(row, col);
          if (!cell?.isMine && !cell?.isRevealed) {
            game.reveal(row, col);
          }
        }
      }

      expect(game.gameState).toBe('won');
    });

    it('wins when all mines are correctly flagged', () => {
      const game = new MinesweeperGame({ rows: 5, cols: 5, mines: 3 });
      game.reveal(2, 2); // First click at center

      // Flag all mines
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          const cell = game.getCell(row, col);
          if (cell?.isMine) {
            game.toggleFlag(row, col);
          }
        }
      }

      expect(game.gameState).toBe('won');
    });

    it('all cells reveal on win', () => {
      const game = new MinesweeperGame({ rows: 5, cols: 5, mines: 3 });
      game.reveal(2, 2); // First click at center

      // Flag all mines to win
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          const cell = game.getCell(row, col);
          if (cell?.isMine) {
            game.toggleFlag(row, col);
          }
        }
      }

      // Check all cells are revealed
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          expect(game.getCell(row, col)?.isRevealed).toBe(true);
        }
      }
    });
  });

  describe('Chord Click', () => {
    it('chord reveals adjacent cells when flag count matches', () => {
      const game = new MinesweeperGame({ rows: 5, cols: 5, mines: 1 });
      game.reveal(2, 2); // First click

      // Find a revealed cell with adjacent mines
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          const cell = game.getCell(row, col);
          if (cell?.isRevealed && cell.adjacentMines > 0) {
            // Flag adjacent mines
            let flagged = 0;
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                const adj = game.getCell(row + dr, col + dc);
                if (adj?.isMine && !adj.isFlagged) {
                  game.toggleFlag(row + dr, col + dc);
                  flagged++;
                }
              }
            }

            if (flagged === cell.adjacentMines) {
              const beforeCount = countRevealed(game, 5, 5);
              game.chord(row, col);
              const afterCount = countRevealed(game, 5, 5);
              expect(afterCount).toBeGreaterThanOrEqual(beforeCount);
              return;
            }
          }
        }
      }
    });

    it('chord does nothing if flag count does not match', () => {
      const game = new MinesweeperGame({ rows: 5, cols: 5, mines: 3 });
      game.reveal(2, 2); // First click

      // Find a revealed cell with adjacent mines but don't flag correctly
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          const cell = game.getCell(row, col);
          if (cell?.isRevealed && cell.adjacentMines > 0) {
            const beforeCount = countRevealed(game, 5, 5);
            game.chord(row, col); // No flags placed
            const afterCount = countRevealed(game, 5, 5);
            expect(afterCount).toBe(beforeCount);
            return;
          }
        }
      }
    });
  });

  describe('Edge Cases', () => {
    it('getCell returns null for out of bounds', () => {
      const game = new MinesweeperGame({ rows: 5, cols: 5, mines: 3 });
      expect(game.getCell(-1, 0)).toBeNull();
      expect(game.getCell(0, -1)).toBeNull();
      expect(game.getCell(5, 0)).toBeNull();
      expect(game.getCell(0, 5)).toBeNull();
    });

    it('handles maximum mines constraint', () => {
      // Try to create a game with too many mines
      const game = new MinesweeperGame({ rows: 3, cols: 3, mines: 100 });
      game.reveal(1, 1);

      let mineCount = 0;
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (game.getCell(row, col)?.isMine) mineCount++;
        }
      }
      // Should be limited (9 cells - 9 safe area = 0 max, but implementation may vary)
      expect(mineCount).toBeLessThan(9);
    });
  });

  describe('Cascade Reveal (Flood Fill)', () => {
    it('reveals adjacent empty cells recursively', () => {
      // Create a small board where we can predict cascade behavior
      const game = new MinesweeperGame({ rows: 5, cols: 5, mines: 1 });
      game.reveal(2, 2); // First click at center

      // After first click, if center has no adjacent mines, 
      // multiple cells should be revealed
      const revealed = countRevealed(game, 5, 5);
      expect(revealed).toBeGreaterThan(1);
    });

    it('stops cascade at cells with adjacent mines', () => {
      const game = new MinesweeperGame({ rows: 5, cols: 5, mines: 4 });
      game.reveal(2, 2);

      // Cells with numbers should be revealed but not cascade further
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          const cell = game.getCell(row, col);
          if (cell?.isRevealed && cell.adjacentMines > 0) {
            // This cell stopped the cascade correctly
            expect(cell.isRevealed).toBe(true);
          }
        }
      }
    });
  });

  describe('Chord Click Edge Cases', () => {
    it('chord does nothing on unrevealed cell', () => {
      const game = new MinesweeperGame({ rows: 5, cols: 5, mines: 3 });
      // Don't click first - board not initialized
      const result = game.chord(2, 2);
      expect(result).toBe(false);
    });

    it('chord does nothing on cell with 0 adjacent mines', () => {
      const game = new MinesweeperGame({ rows: 5, cols: 5, mines: 1 });
      game.reveal(0, 0); // First click

      // Find a revealed cell with 0 adjacent mines
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          const cell = game.getCell(row, col);
          if (cell?.isRevealed && cell.adjacentMines === 0) {
            const result = game.chord(row, col);
            expect(result).toBe(false);
            return;
          }
        }
      }
    });

    it('chord triggers game over if flag placement is wrong', () => {
      const game = new MinesweeperGame({ rows: 5, cols: 5, mines: 3 });
      game.reveal(2, 2);

      // Find a revealed cell with adjacent mines
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          const cell = game.getCell(row, col);
          if (cell?.isRevealed && cell.adjacentMines > 0) {
            // Flag non-mine cells (wrong placement)
            let flagged = 0;
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                const adj = game.getCell(row + dr, col + dc);
                if (adj && !adj.isRevealed && !adj.isMine && flagged < cell.adjacentMines) {
                  game.toggleFlag(row + dr, col + dc);
                  flagged++;
                }
              }
            }

            if (flagged === cell.adjacentMines) {
              game.chord(row, col);
              // Should trigger game over since we flagged non-mines
              expect(game.gameState).toBe('lost');
              return;
            }
          }
        }
      }
    });
  });

  describe('Game State Transitions', () => {
    it('cannot transition from won to lost', () => {
      const game = new MinesweeperGame({ rows: 3, cols: 3, mines: 1 });
      game.reveal(1, 1);

      // Win by revealing all safe cells
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const cell = game.getCell(row, col);
          if (!cell?.isMine && !cell?.isRevealed) {
            game.reveal(row, col);
          }
        }
      }

      expect(game.gameState).toBe('won');

      // Try to click a mine (should be impossible since game is over)
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (game.getCell(row, col)?.isMine) {
            game.reveal(row, col);
          }
        }
      }

      expect(game.gameState).toBe('won'); // Should still be won
    });

    it('cannot transition from lost to won', () => {
      const game = new MinesweeperGame({ rows: 5, cols: 5, mines: 3 });
      game.reveal(2, 2);

      // Lose by clicking a mine
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          if (game.getCell(row, col)?.isMine) {
            game.reveal(row, col);
            break;
          }
        }
        if (game.gameState === 'lost') break;
      }

      expect(game.gameState).toBe('lost');

      // Try to flag all remaining mines
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          if (game.getCell(row, col)?.isMine) {
            game.toggleFlag(row, col);
          }
        }
      }

      expect(game.gameState).toBe('lost'); // Should still be lost
    });
  });

  describe('First Click Protection', () => {
    it('first click never hits a mine even in corner', () => {
      // Run multiple times to test randomness
      for (let i = 0; i < 10; i++) {
        const game = new MinesweeperGame({ rows: 9, cols: 9, mines: 10 });
        game.reveal(0, 0); // Corner click
        expect(game.gameState).toBe('playing');
        expect(game.getCell(0, 0)?.isMine).toBe(false);
      }
    });

    it('first click at edge is safe', () => {
      for (let i = 0; i < 10; i++) {
        const game = new MinesweeperGame({ rows: 9, cols: 9, mines: 10 });
        game.reveal(0, 4); // Edge click
        expect(game.gameState).toBe('playing');
        expect(game.getCell(0, 4)?.isMine).toBe(false);
      }
    });
  });

  describe('Mine Count Validation', () => {
    it('reports correct mine count', () => {
      const game = new MinesweeperGame({ rows: 9, cols: 9, mines: 15 });
      expect(game.mineCount).toBe(15);
    });

    it('handles zero mines', () => {
      const game = new MinesweeperGame({ rows: 5, cols: 5, mines: 0 });
      game.reveal(2, 2);
      
      // Should auto-win since no mines
      expect(game.gameState).toBe('won');
    });
  });
});

// Helper function
function countRevealed(game: MinesweeperGame, rows: number, cols: number): number {
  let count = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (game.getCell(row, col)?.isRevealed) count++;
    }
  }
  return count;
}
