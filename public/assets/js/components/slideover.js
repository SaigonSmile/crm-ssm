// slideover.js - Slide-over panel kéo từ bên phải ra, mượt mà và trực quan

const SlideOver = {
    _panelEl: null,

    show({ title, contentHTML, onSave, saveText = 'Lưu thay đổi', cancelText = 'Hủy' }) {
        this.close();

        // Container chính
        this._panelEl = document.createElement('div');
        this._panelEl.className = 'fixed inset-0 z-[90] flex justify-end overflow-hidden';

        // Backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'absolute inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity duration-300 opacity-0';
        backdrop.onclick = () => this.close();
        this._panelEl.appendChild(backdrop);

        // Slide-over Content Panel
        const panelContainer = document.createElement('div');
        panelContainer.className = 'relative w-screen max-w-xl bg-white shadow-2xl flex flex-col h-full transform translate-x-full transition-transform duration-300 pointer-events-auto border-l border-outline-variant/30';

        panelContainer.innerHTML = `
            <div class="px-8 py-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
                <h3 class="text-lg font-bold text-on-surface flex items-center gap-2">${title}</h3>
                <button class="text-secondary hover:text-primary transition-colors" onclick="SlideOver.close()">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="px-8 py-6 overflow-y-auto flex-1 text-body-md font-body-md text-on-surface space-y-6">
                ${contentHTML}
            </div>
            <div class="px-8 py-5 border-t border-outline-variant/30 bg-surface-container-low flex justify-end gap-3">
                <button class="px-5 py-3 border border-outline-variant text-secondary text-sm font-bold rounded-xl hover:bg-subtle-grey transition-all active:scale-[0.98]" onclick="SlideOver.close()">${cancelText}</button>
                <button id="slideover-save-btn" class="px-5 py-3 bg-[#EC7700] hover:bg-[#d46a00] text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-[0.98]">${saveText}</button>
            </div>
        `;

        this._panelEl.appendChild(panelContainer);
        document.body.appendChild(this._panelEl);

        // Nút Save action
        const saveBtn = panelContainer.querySelector('#slideover-save-btn');
        if (onSave) {
            saveBtn.onclick = async () => {
                saveBtn.disabled = true;
                saveBtn.innerHTML = `<span class="animate-spin material-symbols-outlined text-[18px]">sync</span>`;
                const success = await onSave();
                if (success !== false) {
                    this.close();
                } else {
                    saveBtn.disabled = false;
                    saveBtn.innerText = saveText;
                }
            };
        } else {
            saveBtn.onclick = () => this.close();
        }

        // Kích hoạt transition trượt ra mượt mà
        setTimeout(() => {
            backdrop.classList.remove('opacity-0');
            backdrop.classList.add('opacity-100');
            panelContainer.classList.remove('translate-x-full');
            panelContainer.classList.add('translate-x-0');
        }, 10);
    },

    close() {
        if (!this._panelEl) return;
        const backdrop = this._panelEl.querySelector('div:first-child');
        const container = this._panelEl.querySelector('div:nth-child(2)');

        if (container && backdrop) {
            backdrop.classList.remove('opacity-100');
            backdrop.classList.add('opacity-0');
            container.classList.remove('translate-x-0');
            container.classList.add('translate-x-full');

            container.addEventListener('transitionend', () => {
                if (this._panelEl) {
                    this._panelEl.remove();
                    this._panelEl = null;
                }
            });
        } else {
            this._panelEl.remove();
            this._panelEl = null;
        }
    }
};

window.SlideOver = SlideOver;
