export class AnimationManager {
  constructor() {
    // Always enable animations
    document.documentElement.setAttribute('data-animations', 'enabled');
  }

  public isEnabled(): boolean {
    return true;
  }

  /**
   * Trigger reveal animation on a cell element
   */
  public animateReveal(_element: HTMLElement): void {
    // Reveal animation disabled
  }

  /**
   * Trigger flag placement animation
   */
  public animateFlag(element: HTMLElement): void {
    element.classList.add('animate-flag');
    setTimeout(() => element.classList.remove('animate-flag'), 250);
  }

  /**
   * Trigger flag removal animation
   */
  public animateUnflag(element: HTMLElement): void {
    element.classList.add('animate-unflag');
    setTimeout(() => element.classList.remove('animate-unflag'), 150);
  }

  /**
   * Trigger mine explosion animation
   */
  public animateExplode(element: HTMLElement): void {
    element.classList.add('animate-explode');
    setTimeout(() => element.classList.remove('animate-explode'), 300);
  }

  /**
   * Trigger board shake animation on game loss
   */
  public animateLose(boardElement: HTMLElement): void {
    boardElement.classList.add('shake');
    setTimeout(() => boardElement.classList.remove('shake'), 400);
  }

  /**
   * Trigger win celebration animation
   */
  public animateWin(boardElement: HTMLElement, cells: NodeListOf<HTMLElement>): void {
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
