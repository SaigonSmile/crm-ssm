// modal.js - Hệ thống Modal động, tái sử dụng trên toàn hệ thống

const Modal = {
    _modalEl: null,

    show({ title, contentHTML, onConfirm, confirmText = 'Xác nhận', cancelText = 'Hủy' }) {
        // Xóa modal cũ nếu có
        this.close();

        // Tạo container modal
        this._modalEl = document.createElement('div');
        this._modalEl.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4';
        
        // Backdrop overlay
        const backdrop = document.createElement('div');
        backdrop.className = 'absolute inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity duration-300';
        backdrop.onclick = () => this.close();
        this._modalEl.appendChild(backdrop);

        // Modal Content
        const modalContainer = document.createElement('div');
        modalContainer.className = 'relative bg-white w-full max-w-lg rounded-[24px] shadow-2xl border border-outline-variant/30 flex flex-col max-h-[90vh] overflow-hidden pointer-events-auto transform scale-95 opacity-0 transition-all duration-300';
        
        // Tiêm HTML
        modalContainer.innerHTML = `
            <div class="px-8 py-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
                <h3 class="text-lg font-bold text-on-surface flex items-center gap-2">${title}</h3>
                <button class="text-secondary hover:text-primary transition-colors" onclick="Modal.close()">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="px-8 py-6 overflow-y-auto flex-1 text-body-md font-body-md text-on-surface">
                ${contentHTML}
            </div>
            <div class="px-8 py-5 border-t border-outline-variant/30 bg-surface-container-low flex justify-end gap-3">
                <button class="px-5 py-3 border border-outline-variant text-secondary text-sm font-bold rounded-xl hover:bg-subtle-grey transition-all active:scale-[0.98]" onclick="Modal.close()">${cancelText}</button>
                <button id="modal-confirm-btn" class="px-5 py-3 bg-[#EC7700] hover:bg-[#d46a00] text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-[0.98]">${confirmText}</button>
            </div>
        `;

        this._modalEl.appendChild(modalContainer);
        document.body.appendChild(this._modalEl);

        // Thêm sự kiện nút xác nhận
        const confirmBtn = modalContainer.querySelector('#modal-confirm-btn');
        if (onConfirm) {
            confirmBtn.onclick = async () => {
                confirmBtn.disabled = true;
                confirmBtn.innerHTML = `<span class="animate-spin material-symbols-outlined text-[18px]">sync</span>`;
                const success = await onConfirm();
                if (success !== false) {
                    this.close();
                } else {
                    confirmBtn.disabled = false;
                    confirmBtn.innerText = confirmText;
                }
            };
        } else {
            confirmBtn.onclick = () => this.close();
        }

        // Kích hoạt transition mượt mà
        setTimeout(() => {
            modalContainer.classList.remove('scale-95', 'opacity-0');
            modalContainer.classList.add('scale-100', 'opacity-100');
        }, 10);
    },

    close() {
        if (!this._modalEl) return;
        const container = this._modalEl.querySelector('div:nth-child(2)');
        if (container) {
            container.classList.remove('scale-100', 'opacity-100');
            container.classList.add('scale-95', 'opacity-0');
            container.addEventListener('transitionend', () => {
                if (this._modalEl) {
                    this._modalEl.remove();
                    this._modalEl = null;
                }
            });
        } else {
            this._modalEl.remove();
            this._modalEl = null;
        }
    }
};

window.Modal = Modal;
