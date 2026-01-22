export type ThemeName = 'default' | 'dark' | 'classic';

const THEME_STORAGE_KEY = 'minesweeper-theme';

export class ThemeManager {
  private currentTheme: ThemeName = 'default';
  private themeSelect: HTMLSelectElement | null = null;

  constructor() {
    this.themeSelect = document.getElementById('theme') as HTMLSelectElement;
    this.init();
  }

  private init(): void {
    // Try to load saved theme, or detect system preference
    const savedTheme = this.getSavedTheme();
    if (savedTheme) {
      this.currentTheme = savedTheme;
    } else if (this.prefersDarkMode()) {
      this.currentTheme = 'dark';
    }

    // Apply initial theme
    this.applyTheme(this.currentTheme);

    // Update select to match current theme
    if (this.themeSelect) {
      this.themeSelect.value = this.currentTheme;
      this.themeSelect.addEventListener('change', () => this.handleThemeChange());
    }

    // Listen for system theme changes
    this.listenForSystemThemeChanges();
  }

  private getSavedTheme(): ThemeName | null {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && this.isValidTheme(saved)) {
      return saved as ThemeName;
    }
    return null;
  }

  private isValidTheme(theme: string): boolean {
    return ['default', 'dark', 'classic'].includes(theme);
  }

  private prefersDarkMode(): boolean {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private listenForSystemThemeChanges(): void {
    if (!window.matchMedia) return;

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only auto-switch if user hasn't explicitly set a theme
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        const newTheme = e.matches ? 'dark' : 'default';
        this.setTheme(newTheme, false); // Don't save to localStorage
      }
    });
  }

  private handleThemeChange(): void {
    if (!this.themeSelect) return;
    const newTheme = this.themeSelect.value as ThemeName;
    this.setTheme(newTheme, true);
  }

  private setTheme(theme: ThemeName, save: boolean): void {
    this.currentTheme = theme;
    this.applyTheme(theme);
    
    if (this.themeSelect) {
      this.themeSelect.value = theme;
    }

    if (save) {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }

  private applyTheme(theme: ThemeName): void {
    if (theme === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  public getTheme(): ThemeName {
    return this.currentTheme;
  }
}
