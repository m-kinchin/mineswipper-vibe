import { MinesweeperGame } from './game';
import { Cell } from './types';

export class GameUI {
  private game: MinesweeperGame;
  private boardElement: HTMLElement;
  private statusElement: HTMLElement;
  private mineCountElement: HTMLElement;
  private timerElement: HTMLElement;
  private timerInterval: number | null = null;
  private elapsedTime: number = 0;

  constructor() {
    this.boardElement = document.getElementById('board')!;
    this.statusElement = document.getElementById('game-status')!;
    this.mineCountElement = document.getElementById('mine-count')!;
    this.timerElement = document.getElementById('timer')!;

    this.game = new MinesweeperGame({ rows: 9, cols: 9, mines: 10 });
    this.setupControls();
    this.render();
  }

  private setupControls(): void {
    const newGameBtn = document.getElementById('new-game')!;
    newGameBtn.addEventListener('click', () => this.startNewGame());

    // Prevent context menu on board
    this.boardElement.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private startNewGame(): void {
    const rows = parseInt((document.getElementById('rows') as HTMLInputElement).value) || 9;
    const cols = parseInt((document.getElementById('cols') as HTMLInputElement).value) || 9;
    const mines = parseInt((document.getElementById('mines') as HTMLInputElement).value) || 10;

    // Validate mines count
    const maxMines = Math.floor((rows * cols) * 0.8);
    const validMines = Math.min(Math.max(mines, 1), maxMines);

    this.game = new MinesweeperGame({ rows, cols, mines: validMines });
    this.resetTimer();
    this.render();
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
        element.classList.add('mine');
        element.textContent = '💣';
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
    this.checkGameEnd();
  }

  private handleRightClick(row: number, col: number): void {
    if (this.game.gameState !== 'playing') return;

    this.game.toggleFlag(row, col);
    this.updateBoard();
    this.updateMineCount();
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

  private checkGameEnd(): void {
    if (this.game.gameState === 'won') {
      this.stopTimer();
      this.statusElement.textContent = '🎉 You Won!';
      this.statusElement.className = 'won';
    } else if (this.game.gameState === 'lost') {
      this.stopTimer();
      this.statusElement.textContent = '💥 Game Over!';
      this.statusElement.className = 'lost';
    }
  }
}
