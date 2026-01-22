import { MinesweeperGame } from './game';
import { Cell, GameConfig } from './types';
import { getAnimationManager, AnimationManager } from './animations';
import { GamePersistence } from './persistence';

interface DifficultyLevel {
  name: string;
  config: GameConfig;
}

const LEVELS: Record<string, DifficultyLevel> = {
  beginner: { name: 'Beginner', config: { rows: 9, cols: 9, mines: 10 } },
  master: { name: 'Master', config: { rows: 16, cols: 16, mines: 40 } },
  expert: { name: 'Expert', config: { rows: 16, cols: 30, mines: 99 } },
};

export class GameUI {
  private game: MinesweeperGame;
  private boardElement: HTMLElement;
  private statusElement: HTMLElement;
  private mineCountElement: HTMLElement;
  private timerElement: HTMLElement;
  private timerInterval: number | null = null;
  private elapsedTime: number = 0;
  private currentLevel: string = 'beginner';
  private animationManager: AnimationManager;
  private previousCellStates: Map<string, { revealed: boolean; flagged: boolean }> = new Map();

  constructor() {
    this.boardElement = document.getElementById('board')!;
    this.statusElement = document.getElementById('game-status')!;
    this.mineCountElement = document.getElementById('mine-count')!;
    this.timerElement = document.getElementById('timer')!;
    this.animationManager = getAnimationManager();

    this.game = new MinesweeperGame(LEVELS[this.currentLevel].config);
    this.setupControls();
    
    // Check for saved game and prompt to resume
    this.checkForSavedGame();
  }

  private checkForSavedGame(): void {
    const savedState = GamePersistence.loadGame();
    
    if (savedState) {
      // Show resume prompt
      const resume = confirm(
        `You have a saved game (${savedState.level}, ${savedState.elapsedTime}s elapsed).\n\nWould you like to resume?`
      );
      
      if (resume) {
        this.restoreSavedGame(savedState);
      } else {
        GamePersistence.clearSavedGame();
        this.render();
        this.saveCellStates();
      }
    } else {
      this.render();
      this.saveCellStates();
    }
  }

  private restoreSavedGame(savedState: ReturnType<typeof GamePersistence.loadGame>): void {
    if (!savedState) return;

    this.currentLevel = savedState.level;
    this.elapsedTime = savedState.elapsedTime;
    this.game = GamePersistence.restoreGame(savedState);

    // Update active button
    document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(this.currentLevel)?.classList.add('active');

    // Render and start timer if game was in progress
    this.render();
    this.saveCellStates();
    this.updateTimerDisplay();
    
    // Resume timer if game is still playing
    if (this.game.gameState === 'playing') {
      this.startTimer();
    }
  }

  private setupControls(): void {
    // Level buttons
    Object.keys(LEVELS).forEach(level => {
      const btn = document.getElementById(level);
      btn?.addEventListener('click', () => this.selectLevel(level));
    });

    // Prevent context menu on board
    this.boardElement.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private selectLevel(level: string): void {
    this.currentLevel = level;
    
    // Update active button
    document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(level)?.classList.add('active');
    
    // Clear saved game when starting new game with different level
    GamePersistence.clearSavedGame();
    this.startNewGame();
  }

  private startNewGame(): void {
    const config = LEVELS[this.currentLevel].config;
    this.game = new MinesweeperGame(config);
    this.resetTimer();
    this.render();
    this.saveCellStates();
    // Clear any saved game when starting fresh
    GamePersistence.clearSavedGame();
  }

  private resetTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.elapsedTime = 0;
    this.updateTimerDisplay();
  }

  private startTimer(): void {
    if (this.timerInterval) return;
    this.timerInterval = window.setInterval(() => {
      this.elapsedTime++;
      this.updateTimerDisplay();
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private updateTimerDisplay(): void {
    this.timerElement.textContent = `Time: ${this.elapsedTime}`;
  }

  private render(): void {
    this.boardElement.innerHTML = '';
    this.statusElement.textContent = '';
    this.statusElement.className = '';
    this.updateMineCount();

    for (let row = 0; row < this.game.rows; row++) {
      const rowElement = document.createElement('div');
      rowElement.className = 'row';

      for (let col = 0; col < this.game.cols; col++) {
        const cell = this.game.getCell(row, col)!;
        const cellElement = this.createCellElement(cell);
        rowElement.appendChild(cellElement);
      }

      this.boardElement.appendChild(rowElement);
    }
  }

  private createCellElement(cell: Cell): HTMLElement {
    const element = document.createElement('div');
    element.className = 'cell';
    element.dataset.row = cell.row.toString();
    element.dataset.col = cell.col.toString();

    this.updateCellElement(element, cell);

    element.addEventListener('click', (e) => this.handleClick(e, cell.row, cell.col));
    element.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.handleRightClick(cell.row, cell.col);
    });

    return element;
  }

  private updateCellElement(element: HTMLElement, cell: Cell): void {
    element.className = 'cell';
    element.textContent = '';
    delete element.dataset.count;

    if (cell.isRevealed) {
      element.classList.add('revealed');
      if (cell.isMine) {
        // On win, show green flag instead of bomb
        if (this.game.gameState === 'won') {
          element.classList.add('correct-flag');
        } else {
          element.classList.add('mine');
          element.textContent = '💣';
        }
      } else if (cell.adjacentMines > 0) {
        element.textContent = cell.adjacentMines.toString();
        element.dataset.count = cell.adjacentMines.toString();
      }
    } else if (cell.isFlagged) {
      element.classList.add('flagged');
    }
  }

  private handleClick(_e: MouseEvent, row: number, col: number): void {
    if (this.game.gameState !== 'playing') return;

    const cell = this.game.getCell(row, col);
    if (!cell) return;

    // Start timer on first click
    if (!this.timerInterval) {
      this.startTimer();
    }

    if (cell.isRevealed) {
      // Chord click on revealed number
      this.game.chord(row, col);
    } else {
      this.game.reveal(row, col);
    }

    this.updateBoard();
    this.animateCellChanges();
    this.checkGameEnd();
    this.autoSave();
  }

  private handleRightClick(row: number, col: number): void {
    if (this.game.gameState !== 'playing') return;

    const cell = this.game.getCell(row, col);
    if (!cell) return;

    // If removing a flag, trigger unflag animation before state change
    if (cell.isFlagged) {
      const element = this.boardElement.querySelector(
        `[data-row="${row}"][data-col="${col}"]`
      ) as HTMLElement;
      if (element) {
        this.animationManager.animateUnflag(element);
      }
    }

    this.game.toggleFlag(row, col);
    this.updateBoard();
    this.animateCellChanges();
    this.updateMineCount();
    this.checkGameEnd();
    this.autoSave();
  }

  private autoSave(): void {
    // Auto-save game state after every action
    GamePersistence.saveGame(this.game, this.currentLevel, this.elapsedTime);
  }

  private updateBoard(): void {
    for (let row = 0; row < this.game.rows; row++) {
      for (let col = 0; col < this.game.cols; col++) {
        const cell = this.game.getCell(row, col)!;
        const element = this.boardElement.querySelector(
          `[data-row="${row}"][data-col="${col}"]`
        ) as HTMLElement;
        if (element) {
          this.updateCellElement(element, cell);
        }
      }
    }
  }

  private updateMineCount(): void {
    const remaining = this.game.mineCount - this.game.flagCount;
    this.mineCountElement.textContent = `Mines: ${remaining}`;
  }

  private saveCellStates(): void {
    this.previousCellStates.clear();
    for (let row = 0; row < this.game.rows; row++) {
      for (let col = 0; col < this.game.cols; col++) {
        const cell = this.game.getCell(row, col)!;
        this.previousCellStates.set(`${row}-${col}`, {
          revealed: cell.isRevealed,
          flagged: cell.isFlagged
        });
      }
    }
  }

  private animateCellChanges(): void {
    for (let row = 0; row < this.game.rows; row++) {
      for (let col = 0; col < this.game.cols; col++) {
        const cell = this.game.getCell(row, col)!;
        const key = `${row}-${col}`;
        const prevState = this.previousCellStates.get(key);
        const element = this.boardElement.querySelector(
          `[data-row="${row}"][data-col="${col}"]`
        ) as HTMLElement;

        if (!element || !prevState) continue;

        // Check for reveal
        if (cell.isRevealed && !prevState.revealed) {
          if (cell.isMine && this.game.gameState === 'lost') {
            this.animationManager.animateExplode(element);
          } else {
            this.animationManager.animateReveal(element);
          }
        }

        // Check for flag added
        if (cell.isFlagged && !prevState.flagged) {
          this.animationManager.animateFlag(element);
        }

        // Check for flag removed (unflag animation handled differently)
        // The unflag animation needs to run before the cell updates
      }
    }
    
    // Save new states for next comparison
    this.saveCellStates();
  }

  private checkGameEnd(): void {
    if (this.game.gameState === 'won') {
      this.stopTimer();
      this.statusElement.textContent = '🎉 You Won!';
      this.statusElement.className = 'won';
      
      // Clear saved game on win
      GamePersistence.clearSavedGame();
      
      // Trigger win animation
      const cells = this.boardElement.querySelectorAll('.cell') as NodeListOf<HTMLElement>;
      this.animationManager.animateWin(this.boardElement, cells);
    } else if (this.game.gameState === 'lost') {
      this.stopTimer();
      this.statusElement.textContent = '💥 Game Over!';
      this.statusElement.className = 'lost';
      
      // Clear saved game on loss
      GamePersistence.clearSavedGame();
      
      // Trigger lose animation (board shake)
      this.animationManager.animateLose(this.boardElement);
    }
  }
}
