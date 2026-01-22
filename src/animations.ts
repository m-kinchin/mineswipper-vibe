const ANIMATION_STORAGE_KEY = 'minesweeper-animations';

export class AnimationManager {
  private enabled: boolean = true;
  private checkbox: HTMLInputElement | null = null;

  constructor() {
    this.checkbox = document.getElementById('animations') as HTMLInputElement;
    this.init();
  }

  private init(): void {
    // Load saved preference
    const saved = localStorage.getItem(ANIMATION_STORAGE_KEY);
    if (saved !== null) {
      this.enabled = saved === 'true';
    }

    // Apply initial state
    this.applyAnimationState();

    // Update checkbox to match
    if (this.checkbox) {
      this.checkbox.checked = this.enabled;
      this.checkbox.addEventListener('change', () => this.handleToggle());
    }
  }

  private handleToggle(): void {
    if (!this.checkbox) return;
    this.enabled = this.checkbox.checked;
    this.applyAnimationState();
    localStorage.setItem(ANIMATION_STORAGE_KEY, String(this.enabled));
  }

  private applyAnimationState(): void {
    if (this.enabled) {
      document.documentElement.setAttribute('data-animations', 'enabled');
    } else {
      document.documentElement.removeAttribute('data-animations');
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Trigger reveal animation on a cell element
   */
  public animateReveal(element: HTMLElement): void {
    if (!this.enabled) return;
    element.classList.add('animate-reveal');
    // Clean up after animation
    setTimeout(() => element.classList.remove('animate-reveal'), 200);
  }

  /**
   * Trigger flag placement animation
   */
  public animateFlag(element: HTMLElement): void {
    if (!this.enabled) return;
    element.classList.add('animate-flag');
    setTimeout(() => element.classList.remove('animate-flag'), 250);
  }

  /**
   * Trigger flag removal animation
   */
  public animateUnflag(element: HTMLElement): void {
    if (!this.enabled) return;
    element.classList.add('animate-unflag');
    setTimeout(() => element.classList.remove('animate-unflag'), 150);
  }

  /**
   * Trigger mine explosion animation
   */
  public animateExplode(element: HTMLElement): void {
    if (!this.enabled) return;
    element.classList.add('animate-explode');
    setTimeout(() => element.classList.remove('animate-explode'), 300);
  }

  /**
   * Trigger board shake animation on game loss
   */
  public animateLose(boardElement: HTMLElement): void {
    if (!this.enabled) return;
    boardElement.classList.add('shake');
    setTimeout(() => boardElement.classList.remove('shake'), 400);
  }

  /**
   * Trigger win celebration animation
   */
  public animateWin(boardElement: HTMLElement, cells: NodeListOf<HTMLElement>): void {
    if (!this.enabled) return;
    
    // Board glow
    boardElement.classList.add('win-glow');
    setTimeout(() => boardElement.classList.remove('win-glow'), 1800);

    // Staggered cell pulse
    cells.forEach((cell, index) => {
      setTimeout(() => {
        cell.classList.add('win-pulse');
        setTimeout(() => cell.classList.remove('win-pulse'), 400);
      }, (index % 20) * 30); // Stagger by position, wrap every 20 cells
    });

    // Animate correct flags
    const correctFlags = boardElement.querySelectorAll('.correct-flag');
    correctFlags.forEach((flag) => {
      flag.classList.add('animate-win');
      setTimeout(() => flag.classList.remove('animate-win'), 800);
    });
  }
}

// Singleton instance
let animationManager: AnimationManager | null = null;

export function getAnimationManager(): AnimationManager {
  if (!animationManager) {
    animationManager = new AnimationManager();
  }
  return animationManager;
}

export function initAnimationManager(): AnimationManager {
  animationManager = new AnimationManager();
  return animationManager;
}
