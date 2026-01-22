import { Cell, GameConfig, GameState } from './types';

export class MinesweeperGame {
  private board: Cell[][] = [];
  private config: GameConfig;
  private _gameState: GameState = 'playing';
  private _flagCount: number = 0;
  private firstClick: boolean = true;

  constructor(config: GameConfig) {
    this.config = config;
    this.initBoard();
  }

  get gameState(): GameState {
    return this._gameState;
  }

  get flagCount(): number {
    return this._flagCount;
  }

  get rows(): number {
    return this.config.rows;
  }

  get cols(): number {
    return this.config.cols;
  }

  get mineCount(): number {
    return this.config.mines;
  }

  getCell(row: number, col: number): Cell | null {
    if (row < 0 || row >= this.config.rows || col < 0 || col >= this.config.cols) {
      return null;
    }
    return this.board[row][col];
  }

  private initBoard(): void {
    this.board = [];
    for (let row = 0; row < this.config.rows; row++) {
      this.board[row] = [];
      for (let col = 0; col < this.config.cols; col++) {
        this.board[row][col] = {
          row,
          col,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentMines: 0
        };
      }
    }
  }

  private placeMines(excludeRow: number, excludeCol: number): void {
    let minesPlaced = 0;
    const maxMines = Math.min(this.config.mines, this.config.rows * this.config.cols - 9);

    while (minesPlaced < maxMines) {
      const row = Math.floor(Math.random() * this.config.rows);
      const col = Math.floor(Math.random() * this.config.cols);

      // Don't place mine on first click or adjacent cells
      if (Math.abs(row - excludeRow) <= 1 && Math.abs(col - excludeCol) <= 1) {
        continue;
      }

      if (!this.board[row][col].isMine) {
        this.board[row][col].isMine = true;
        minesPlaced++;
      }
    }

    this.calculateAdjacentMines();
  }

  private calculateAdjacentMines(): void {
    for (let row = 0; row < this.config.rows; row++) {
      for (let col = 0; col < this.config.cols; col++) {
        if (!this.board[row][col].isMine) {
          this.board[row][col].adjacentMines = this.countAdjacentMines(row, col);
        }
      }
    }
  }

  private countAdjacentMines(row: number, col: number): number {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const cell = this.getCell(row + dr, col + dc);
        if (cell?.isMine) {
          count++;
        }
      }
    }
    return count;
  }

  reveal(row: number, col: number): boolean {
    if (this._gameState !== 'playing') return false;

    const cell = this.getCell(row, col);
    if (!cell || cell.isRevealed || cell.isFlagged) return false;

    // First click - place mines
    if (this.firstClick) {
      this.firstClick = false;
      this.placeMines(row, col);
    }

    cell.isRevealed = true;

    if (cell.isMine) {
      this._gameState = 'lost';
      this.revealAllMines();
      return true;
    }

    // Auto-reveal adjacent cells if no adjacent mines
    if (cell.adjacentMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          this.reveal(row + dr, col + dc);
        }
      }
    }

    this.checkWin();
    return true;
  }

  toggleFlag(row: number, col: number): boolean {
    if (this._gameState !== 'playing') return false;

    const cell = this.getCell(row, col);
    if (!cell || cell.isRevealed) return false;

    cell.isFlagged = !cell.isFlagged;
    this._flagCount += cell.isFlagged ? 1 : -1;

    this.checkWin();
    return true;
  }

  private revealAllMines(): void {
    for (let row = 0; row < this.config.rows; row++) {
      for (let col = 0; col < this.config.cols; col++) {
        if (this.board[row][col].isMine) {
          this.board[row][col].isRevealed = true;
        }
      }
    }
  }

  private checkWin(): void {
    // Win condition 1: All safe cells revealed
    let unrevealedSafeCells = 0;
    for (let row = 0; row < this.config.rows; row++) {
      for (let col = 0; col < this.config.cols; col++) {
        const cell = this.board[row][col];
        if (!cell.isMine && !cell.isRevealed) {
          unrevealedSafeCells++;
        }
      }
    }

    if (unrevealedSafeCells === 0) {
      this._gameState = 'won';
      this.revealAllCells();
      return;
    }

    // Win condition 2: All mines correctly flagged (and only mines are flagged)
    if (this._flagCount === this.config.mines) {
      let allMinesFlagged = true;
      for (let row = 0; row < this.config.rows; row++) {
        for (let col = 0; col < this.config.cols; col++) {
          const cell = this.board[row][col];
          if (cell.isMine && !cell.isFlagged) {
            allMinesFlagged = false;
            break;
          }
        }
        if (!allMinesFlagged) break;
      }

      if (allMinesFlagged) {
        this._gameState = 'won';
        this.revealAllCells();
      }
    }
  }

  private revealAllCells(): void {
    for (let row = 0; row < this.config.rows; row++) {
      for (let col = 0; col < this.config.cols; col++) {
        this.board[row][col].isRevealed = true;
      }
    }
  }

  // Chord - reveal adjacent cells when clicking on a revealed number
  chord(row: number, col: number): boolean {
    if (this._gameState !== 'playing') return false;

    const cell = this.getCell(row, col);
    if (!cell || !cell.isRevealed || cell.adjacentMines === 0) return false;

    // Count adjacent flags
    let flagCount = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const adjacent = this.getCell(row + dr, col + dc);
        if (adjacent?.isFlagged) {
          flagCount++;
        }
      }
    }

    // If flag count matches adjacent mines, reveal all unflagged adjacent cells
    if (flagCount === cell.adjacentMines) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const adjacent = this.getCell(row + dr, col + dc);
          if (adjacent && !adjacent.isFlagged && !adjacent.isRevealed) {
            this.reveal(row + dr, col + dc);
          }
        }
      }
      return true;
    }

    return false;
  }

  // Serialize game state for persistence
  serialize(): GameSaveData {
    return {
      config: this.config,
      board: this.board.map(row => row.map(cell => ({
        isMine: cell.isMine,
        isRevealed: cell.isRevealed,
        isFlagged: cell.isFlagged,
        adjacentMines: cell.adjacentMines
      }))),
      gameState: this._gameState,
      flagCount: this._flagCount,
      firstClick: this.firstClick
    };
  }

  // Restore game from saved state
  static deserialize(data: GameSaveData): MinesweeperGame {
    const game = new MinesweeperGame(data.config);
    game._gameState = data.gameState;
    game._flagCount = data.flagCount;
    game.firstClick = data.firstClick;

    // Restore board state
    for (let row = 0; row < data.config.rows; row++) {
      for (let col = 0; col < data.config.cols; col++) {
        const savedCell = data.board[row][col];
        game.board[row][col] = {
          row,
          col,
          isMine: savedCell.isMine,
          isRevealed: savedCell.isRevealed,
          isFlagged: savedCell.isFlagged,
          adjacentMines: savedCell.adjacentMines
        };
      }
    }

    return game;
  }
}

export interface GameSaveData {
  config: GameConfig;
  board: {
    isMine: boolean;
    isRevealed: boolean;
    isFlagged: boolean;
    adjacentMines: number;
  }[][];
  gameState: GameState;
  flagCount: number;
  firstClick: boolean;
}
