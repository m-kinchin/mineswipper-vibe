export type CellSize = 'small' | 'medium' | 'large';

const CELL_SIZE_STORAGE_KEY = 'minesweeper-cell-size';

export class SettingsModal {
  private modal: HTMLElement;
  private settingsBtn: HTMLElement;
  private closeBtn: HTMLElement;
  private backdrop: HTMLElement;
  private sizeButtons: NodeListOf<HTMLButtonElement>;

  constructor() {
    this.modal = document.getElementById('settings-modal')!;
    this.settingsBtn = document.getElementById('settings-btn')!;
    this.closeBtn = document.getElementById('settings-close')!;
    this.backdrop = this.modal.querySelector('.modal-backdrop')!;
    this.sizeButtons = this.modal.querySelectorAll('.size-btn');

    this.initCellSize();
    this.setupEventListeners();
  }

  private initCellSize(): void {
    const savedSize = this.getSavedCellSize() || 'small';
    this.applyCellSize(savedSize);
    this.updateSizeButtons(savedSize);
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
  }

  public open(): void {
    this.modal.classList.remove('hidden');
  }

  public close(): void {
    this.modal.classList.add('hidden');
  }
}
