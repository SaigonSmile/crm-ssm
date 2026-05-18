// toast.js - Hệ thống Toast notification toàn cục, tự động tiêm HTML/CSS vào trang

const Toast = {
    _container: null,

    _init() {
        if (this._container) return;

        // Tạo container ở cuối body
        this._container = document.createElement('div');
        this._container.className = 'fixed bottom-5 right-5 flex flex-col gap-3 z-[9999]';
        document.body.appendChild(this._container);

        // Thêm CSS hiệu ứng trượt mượt nếu chưa có
        if (!document.getElementById('toast-keyframes-style')) {
            const style = document.createElement('style');
            style.id = 'toast-keyframes-style';
            style.innerHTML = `
                @keyframes toast-in {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes toast-out {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .animate-toast-in { animation: toast-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-toast-out { animation: toast-out 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `;
            document.head.appendChild(style);
        }
    },

    show(message, type = 'success', duration = 3500) {
        this._init();

        const toast = document.createElement('div');
        toast.className = 'animate-toast-in glass-card flex items-center gap-3 px-5 py-4 rounded-[12px] shadow-lg border text-body-md font-body-md min-w-[280px] max-w-[400px] pointer-events-auto';

        let icon = 'info';
        let bgStyle = '';
        let textColor = 'text-on-surface';

        switch (type) {
            case 'success':
                icon = 'check_circle';
                toast.classList.add('border-status-success/30', 'bg-white/90');
                bgStyle = 'text-status-success';
                break;
            case 'error':
                icon = 'error';
                toast.classList.add('border-status-error/30', 'bg-white/90');
                bgStyle = 'text-status-error';
                break;
            case 'warning':
                icon = 'warning';
                toast.classList.add('border-status-warning/30', 'bg-white/90');
                bgStyle = 'text-status-warning';
                break;
            case 'info':
            default:
                icon = 'info';
                toast.classList.add('border-status-info/30', 'bg-white/90');
                bgStyle = 'text-status-info';
                break;
        }

        toast.innerHTML = `
            <span class="material-symbols-outlined ${bgStyle}">${icon}</span>
            <div class="flex-1 ${textColor}">${message}</div>
            <button class="text-secondary hover:text-primary-container transition-colors ml-2" onclick="this.parentElement.remove()">
                <span class="material-symbols-outlined text-[16px]">close</span>
            </button>
        `;

        this._container.appendChild(toast);

        // Tự động xóa sau thời gian duration
        setTimeout(() => {
            toast.classList.remove('animate-toast-in');
            toast.classList.add('animate-toast-out');
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, duration);
    }
};

// Global helper
window.showToast = (message, type, duration) => Toast.show(message, type, duration);
