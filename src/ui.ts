import { MinesweeperGame } from './game';
import { Cell, GameConfig } from './types';
import { getAnimationManager, AnimationManager } from './animations';
import { GamePersistence } from './persistence';
import { validateCustomSettings, getMaxMines, CustomSettings } from './validation';
import { formatTime, formatTimeWithCentiseconds } from './timeFormat';
import { addHighScore, getHighScores, clearHighScores } from './highScores';

interface DifficultyLevel {
  name: string;
  config: GameConfig;
}

const LEVELS: Record<string, DifficultyLevel> = {
  beginner: { name: 'Beginner', config: { rows: 9, cols: 9, mines: 10 } },
  master: { name: 'Master', config: { rows: 16, cols: 16, mines: 40 } },
  expert: { name: 'Expert', config: { rows: 16, cols: 30, mines: 99 } },
  custom: { name: 'Custom', config: { rows: 10, cols: 10, mines: 15 } },
};

const CUSTOM_SETTINGS_KEY = 'minesweeper-custom-settings';

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
  private previousCellStates: Map<string, { revealed: boolean; flagged: boolean; questionMark: boolean }> = new Map();
  private resumeModal: HTMLElement;
  private customModal: HTMLElement;
  private pendingSavedState: ReturnType<typeof GamePersistence.loadGame> = null;

  constructor() {
    this.boardElement = document.getElementById('board')!;
    this.statusElement = document.getElementById('game-status')!;
    this.mineCountElement = document.getElementById('mine-count')!;
    this.timerElement = document.getElementById('timer')!;
    this.resumeModal = document.getElementById('resume-modal')!;
    this.customModal = document.getElementById('custom-modal')!;
    this.animationManager = getAnimationManager();

    // Load saved custom settings
    this.loadCustomSettings();
    
    this.game = new MinesweeperGame(LEVELS[this.currentLevel].config);
    this.setupControls();
    this.setupResumeModal();
    this.setupCustomModal();
    this.setupLeaderboardModal();
    
    // Render the initial board first
    this.render();
    this.saveCellStates();
    
    // Check for saved game after page is rendered
    requestAnimationFrame(() => {
      setTimeout(() => this.checkForSavedGame(), 100);
    });
  }

  private setupResumeModal(): void {
    const yesBtn = document.getElementById('resume-yes');
    const noBtn = document.getElementById('resume-no');
    
    yesBtn?.addEventListener('click', () => {
      this.hideResumeModal();
      if (this.pendingSavedState) {
        this.restoreSavedGame(this.pendingSavedState);
        this.pendingSavedState = null;
      }
    });
    
    noBtn?.addEventListener('click', () => {
      this.hideResumeModal();
      GamePersistence.clearSavedGame();
      this.pendingSavedState = null;
    });
  }

  private showResumeModal(level: string, elapsedTime: number): void {
    const textEl = document.getElementById('resume-modal-text');
    if (textEl) {
      let levelName = LEVELS[level]?.name || level;
      // For custom level, show dimensions
      if (level === 'custom') {
        const config = LEVELS.custom.config;
        levelName = `Custom (${config.rows}×${config.cols}, ${config.mines} mines)`;
      }
      // elapsedTime is now in centiseconds
      const seconds = Math.floor(elapsedTime / 100);
      textEl.textContent = `You have a saved ${levelName} game (${formatTime(seconds)} elapsed).`;
    }
    this.resumeModal.classList.remove('hidden');
  }

  private hideResumeModal(): void {
    this.resumeModal.classList.add('hidden');
  }

  private setupCustomModal(): void {
    const closeBtn = document.getElementById('custom-close');
    const startBtn = document.getElementById('custom-start');
    const cancelBtn = document.getElementById('custom-cancel');
    const rowsInput = document.getElementById('custom-rows') as HTMLInputElement;
    const colsInput = document.getElementById('custom-cols') as HTMLInputElement;
    const minesInput = document.getElementById('custom-mines') as HTMLInputElement;
    
    // Close modal on backdrop click
    this.customModal.querySelector('.modal-backdrop')?.addEventListener('click', () => {
      this.hideCustomModal();
    });
    
    closeBtn?.addEventListener('click', () => this.hideCustomModal());
    cancelBtn?.addEventListener('click', () => this.hideCustomModal());
    
    startBtn?.addEventListener('click', () => this.startCustomGame());
    
    // Update mines hint when rows/cols change
    const updateMinesHint = () => {
      const rows = parseInt(rowsInput.value) || 5;
      const cols = parseInt(colsInput.value) || 5;
      const maxMines = getMaxMines(rows, cols);
      const minesHint = document.getElementById('mines-hint');
      if (minesHint) {
        minesHint.textContent = `(1-${maxMines})`;
      }
    };
    
    rowsInput?.addEventListener('input', updateMinesHint);
    colsInput?.addEventListener('input', updateMinesHint);
    
    // Allow Enter key to start game, Escape to close
    [rowsInput, colsInput, minesInput].forEach(input => {
      input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.startCustomGame();
        } else if (e.key === 'Escape') {
          this.hideCustomModal();
        }
      });
    });

    // Global Escape key handler for modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.customModal.classList.contains('hidden')) {
        this.hideCustomModal();
      }
    });
  }

  private showCustomModal(): void {
    // Load saved custom settings into inputs
    const settings = this.loadCustomSettings();
    const rowsInput = document.getElementById('custom-rows') as HTMLInputElement;
    const colsInput = document.getElementById('custom-cols') as HTMLInputElement;
    const minesInput = document.getElementById('custom-mines') as HTMLInputElement;
    
    if (rowsInput) rowsInput.value = settings.rows.toString();
    if (colsInput) colsInput.value = settings.cols.toString();
    if (minesInput) minesInput.value = settings.mines.toString();
    
    // Update mines hint
    const maxMines = getMaxMines(settings.rows, settings.cols);
    const minesHint = document.getElementById('mines-hint');
    if (minesHint) {
      minesHint.textContent = `(1-${maxMines})`;
    }
    
    // Clear any previous error
    this.hideCustomError();
    
    this.customModal.classList.remove('hidden');
  }

  private hideCustomModal(): void {
    this.customModal.classList.add('hidden');
  }

  private setupLeaderboardModal(): void {
    const modal = document.getElementById('leaderboard-modal')!;
    const closeBtn = document.getElementById('leaderboard-close');
    const openBtn = document.getElementById('leaderboard-btn');
    const clearBtn = document.getElementById('leaderboard-clear');
    const backdrop = modal.querySelector('.modal-backdrop');
    
    openBtn?.addEventListener('click', () => this.showLeaderboard());
    closeBtn?.addEventListener('click', () => this.hideLeaderboard());
    backdrop?.addEventListener('click', () => this.hideLeaderboard());
    
    clearBtn?.addEventListener('click', () => {
      if (confirm('Clear all high scores?')) {
        clearHighScores();
        const activeTab = modal.querySelector('.leaderboard-tab.active') as HTMLElement;
        const level = (activeTab?.dataset.level || 'beginner') as 'beginner' | 'master' | 'expert';
        this.renderLeaderboard(level);
      }
    });
    
    // Tab switching
    const tabs = modal.querySelectorAll('.leaderboard-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const level = (tab as HTMLElement).dataset.level as 'beginner' | 'master' | 'expert';
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.renderLeaderboard(level);
      });
    });
    
    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        this.hideLeaderboard();
      }
    });
  }

  private showLeaderboard(level?: string, highlightRank?: number | null): void {
    const modal = document.getElementById('leaderboard-modal')!;
    modal.classList.remove('hidden');
    
    // Set active tab
    const activeLevel = (level === 'beginner' || level === 'master' || level === 'expert') ? level : 'beginner';
    const tabs = modal.querySelectorAll('.leaderboard-tab');
    tabs.forEach(tab => {
      const tabLevel = (tab as HTMLElement).dataset.level;
      tab.classList.toggle('active', tabLevel === activeLevel);
    });
    
    this.renderLeaderboard(activeLevel as 'beginner' | 'master' | 'expert', highlightRank ?? undefined);
  }

  private hideLeaderboard(): void {
    const modal = document.getElementById('leaderboard-modal')!;
    modal.classList.add('hidden');
  }

  private renderLeaderboard(level: 'beginner' | 'master' | 'expert', highlightRank?: number): void {
    const listEl = document.getElementById('leaderboard-list')!;
    const scores = getHighScores(level);
    
    if (scores.length === 0) {
      listEl.innerHTML = '<div class="leaderboard-empty">No high scores yet.<br>Win a game to set a record!</div>';
      return;
    }
    
    listEl.innerHTML = scores.map((score, index) => {
      const rank = index + 1;
      const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : '';
      const highlight = highlightRank === rank ? 'highlight' : '';
      const date = new Date(score.date).toLocaleDateString();
      
      return `
        <div class="leaderboard-row ${highlight}">
          <span class="leaderboard-rank ${rankClass}">#${rank}</span>
          <span class="leaderboard-time">${formatTimeWithCentiseconds(score.time)}</span>
          <span class="leaderboard-date">${date}</span>
        </div>
      `;
    }).join('');
  }

  private showCustomError(message: string): void {
    const errorEl = document.getElementById('custom-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }
  }

  private hideCustomError(): void {
    const errorEl = document.getElementById('custom-error');
    if (errorEl) {
      errorEl.classList.add('hidden');
    }
  }

  private startCustomGame(): void {
    const rowsInput = document.getElementById('custom-rows') as HTMLInputElement;
    const colsInput = document.getElementById('custom-cols') as HTMLInputElement;
    const minesInput = document.getElementById('custom-mines') as HTMLInputElement;
    
    const rows = parseInt(rowsInput.value);
    const cols = parseInt(colsInput.value);
    const mines = parseInt(minesInput.value);
    
    const error = validateCustomSettings(rows, cols, mines);
    if (error) {
      this.showCustomError(error);
      return;
    }
    
    // Save custom settings
    this.saveCustomSettings({ rows, cols, mines });
    
    // Update LEVELS.custom config
    LEVELS.custom.config = { rows, cols, mines };
    
    this.hideCustomModal();
    this.selectLevel('custom');
  }

  private loadCustomSettings(): CustomSettings {
    try {
      const saved = localStorage.getItem(CUSTOM_SETTINGS_KEY);
      if (saved) {
        const settings = JSON.parse(saved) as CustomSettings;
        // Update LEVELS.custom with saved settings
        LEVELS.custom.config = { rows: settings.rows, cols: settings.cols, mines: settings.mines };
        return settings;
      }
    } catch (e) {
      console.error('Failed to load custom settings:', e);
    }
    return { rows: 10, cols: 10, mines: 15 };
  }

  private saveCustomSettings(settings: CustomSettings): void {
    try {
      localStorage.setItem(CUSTOM_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save custom settings:', e);
    }
  }

  private checkForSavedGame(): void {
    const savedState = GamePersistence.loadGame();
    
    if (savedState) {
      this.pendingSavedState = savedState;
      this.showResumeModal(savedState.level, savedState.elapsedTime);
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
      if (level === 'custom') {
        // Custom opens the modal instead of starting directly
        btn?.addEventListener('click', () => this.showCustomModal());
      } else {
        btn?.addEventListener('click', () => this.selectLevel(level));
      }
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
    this.elapsedTime = 0; // Now in centiseconds
    this.updateTimerDisplay();
  }

  private startTimer(): void {
    if (this.timerInterval) return;
    this.timerInterval = window.setInterval(() => {
      this.elapsedTime++;
      this.updateTimerDisplay();
    }, 10); // Update every 10ms (centisecond)
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private updateTimerDisplay(): void {
    // Display only seconds during gameplay (less distracting)
    const seconds = Math.floor(this.elapsedTime / 100);
    this.timerElement.textContent = `Time: ${formatTime(seconds)}`;
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
    } else if (cell.isQuestionMark) {
      element.classList.add('question-mark');
      element.textContent = '?';
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
          flagged: cell.isFlagged,
          questionMark: cell.isQuestionMark
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
      
      // Check for high score (only for preset difficulties)
      if (this.currentLevel === 'beginner' || this.currentLevel === 'master' || this.currentLevel === 'expert') {
        const rank = addHighScore(this.currentLevel as 'beginner' | 'master' | 'expert', this.elapsedTime);
        if (rank !== null) {
          this.statusElement.textContent = `🎉 You Won! New #${rank} High Score!`;
          // Show leaderboard after a short delay
          setTimeout(() => this.showLeaderboard(this.currentLevel, rank), 1500);
        }
      }
      
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
