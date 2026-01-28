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
  
  // Display app version from package.json (injected by Vite)
  const versionElement = document.getElementById('app-version');
  if (versionElement) {
    versionElement.textContent = `v${__APP_VERSION__}`;
  }
});
