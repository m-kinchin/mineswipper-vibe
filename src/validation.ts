/**
 * Validation utilities for custom game settings
 */

export interface CustomSettings {
  rows: number;
  cols: number;
  mines: number;
}

export const CUSTOM_LIMITS = {
  rows: { min: 5, max: 30 },
  cols: { min: 5, max: 50 },
  minePercentage: 0.8,
} as const;

/**
 * Validates custom difficulty settings
 * @returns Error message if invalid, null if valid
 */
export function validateCustomSettings(rows: number, cols: number, mines: number): string | null {
  if (isNaN(rows) || isNaN(cols) || isNaN(mines)) {
    return 'Please enter valid numbers';
  }
  if (rows < CUSTOM_LIMITS.rows.min || rows > CUSTOM_LIMITS.rows.max) {
    return `Rows must be between ${CUSTOM_LIMITS.rows.min} and ${CUSTOM_LIMITS.rows.max}`;
  }
  if (cols < CUSTOM_LIMITS.cols.min || cols > CUSTOM_LIMITS.cols.max) {
    return `Columns must be between ${CUSTOM_LIMITS.cols.min} and ${CUSTOM_LIMITS.cols.max}`;
  }
  if (mines < 1) {
    return 'Must have at least 1 mine';
  }
  const maxMines = getMaxMines(rows, cols);
  if (mines > maxMines) {
    return `Mines cannot exceed ${maxMines} (80% of cells)`;
  }
  return null;
}

/**
 * Calculate the maximum allowed mines for a given grid size
 */
export function getMaxMines(rows: number, cols: number): number {
  return Math.floor(rows * cols * CUSTOM_LIMITS.minePercentage);
}
