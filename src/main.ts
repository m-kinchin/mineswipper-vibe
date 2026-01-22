import './style.css';
import { GameUI } from './ui';
import { ThemeManager } from './theme';
import { initAnimationManager } from './animations';

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
  initAnimationManager();
  new GameUI();
});
