export class SettingsModal {
  private modal: HTMLElement;
  private settingsBtn: HTMLElement;
  private closeBtn: HTMLElement;
  private backdrop: HTMLElement;

  constructor() {
    this.modal = document.getElementById('settings-modal')!;
    this.settingsBtn = document.getElementById('settings-btn')!;
    this.closeBtn = document.getElementById('settings-close')!;
    this.backdrop = this.modal.querySelector('.modal-backdrop')!;

    this.setupEventListeners();
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
  }

  public open(): void {
    this.modal.classList.remove('hidden');
  }

  public close(): void {
    this.modal.classList.add('hidden');
  }
}
