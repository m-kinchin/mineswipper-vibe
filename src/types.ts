export interface Cell {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  isQuestionMark: boolean;
  adjacentMines: number;
}

export interface GameConfig {
  rows: number;
  cols: number;
  mines: number;
}

export type GameState = 'playing' | 'won' | 'lost';
