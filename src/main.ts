import './style.css';
import { GameUI } from './ui';
import { ThemeManager } from './theme';

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
  new GameUI();
});
