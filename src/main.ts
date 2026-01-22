import './style.css';
import { GameUI } from './ui';
import { ThemeManager } from './theme';
import { initAnimationManager } from './animations';
import { SettingsModal } from './settings';

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
  initAnimationManager();
  new SettingsModal();
  new GameUI();
});
