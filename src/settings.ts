export type CellSize = 'small' | 'medium' | 'large';

const CELL_SIZE_STORAGE_KEY = 'minesweeper-cell-size';
const AUTO_PAUSE_STORAGE_KEY = 'minesweeper-auto-pause';

export class SettingsModal {
  private modal: HTMLElement;
  private settingsBtn: HTMLElement;
  private closeBtn: HTMLElement;
  private backdrop: HTMLElement;
  private sizeButtons: NodeListOf<HTMLButtonElement>;
  private autoPauseCheckbox: HTMLInputElement;

  constructor() {
    this.modal = document.getElementById('settings-modal')!;
    this.settingsBtn = document.getElementById('settings-btn')!;
    this.closeBtn = document.getElementById('settings-close')!;
    this.backdrop = this.modal.querySelector('.modal-backdrop')!;
    this.sizeButtons = this.modal.querySelectorAll('.size-btn');
    this.autoPauseCheckbox = document.getElementById('auto-pause') as HTMLInputElement;

    this.initCellSize();
    this.initAutoPause();
    this.setupEventListeners();
  }

  private initCellSize(): void {
    const savedSize = this.getSavedCellSize() || 'small';
    this.applyCellSize(savedSize);
    this.updateSizeButtons(savedSize);
  }

  private initAutoPause(): void {
    const saved = localStorage.getItem(AUTO_PAUSE_STORAGE_KEY);
    // Default to true (checked) if not set
    const isEnabled = saved === null ? true : saved === 'true';
    this.autoPauseCheckbox.checked = isEnabled;
  }

  private getSavedCellSize(): CellSize | null {
    const saved = localStorage.getItem(CELL_SIZE_STORAGE_KEY);
    if (saved && ['small', 'medium', 'large'].includes(saved)) {
      return saved as CellSize;
    }
    return null;
  }

  private applyCellSize(size: CellSize): void {
    document.documentElement.setAttribute('data-cell-size', size);
    localStorage.setItem(CELL_SIZE_STORAGE_KEY, size);
  }

  private updateSizeButtons(activeSize: CellSize): void {
    this.sizeButtons.forEach(btn => {
      if (btn.dataset.size === activeSize) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  private setupEventListeners(): void {
    // Open settings
    this.settingsBtn.addEventListener('click', () => this.open());

    // Close settings
    this.closeBtn.addEventListener('click', () => this.close());
    this.backdrop.addEventListener('click', () => this.close());

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
        this.close();
      }
    });

    // Cell size buttons
    this.sizeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const size = btn.dataset.size as CellSize;
        this.applyCellSize(size);
        this.updateSizeButtons(size);
      });
    });

    // Auto-pause checkbox
    this.autoPauseCheckbox.addEventListener('change', () => {
      localStorage.setItem(AUTO_PAUSE_STORAGE_KEY, String(this.autoPauseCheckbox.checked));
    });
  }

  public open(): void {
    this.modal.classList.remove('hidden');
  }

  public close(): void {
    this.modal.classList.add('hidden');
  }
}
