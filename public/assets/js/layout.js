// layout.js - Dynamic layout engine for Saigon Smile CRM
// Tự động quản lý dependencies, kiểm tra session (Route Guard), phân quyền menu & hiển thị avatar người dùng thật

const sidebarHTML = `
<aside class="fixed left-0 top-0 h-screen w-[260px] border-r border-outline-variant bg-surface shadow-sm flex flex-col py-6 z-50">
    <div class="px-6 mb-10 text-center">
        <h1 class="text-[#EC7700] font-bold text-xl tracking-wider">SAIGON SMILE</h1>
        <p class="text-xs text-secondary mt-1 uppercase tracking-widest font-semibold">Medical Spa CRM</p>
    </div>
    <nav class="flex-1 px-2 space-y-1" id="main-nav">
        <a href="dashboard.html" data-page="dashboard" class="nav-item flex items-center gap-3 px-4 py-3 text-secondary hover:bg-subtle-grey transition-all duration-200 rounded-lg">
            <span class="material-symbols-outlined">dashboard</span>
            <span class="font-body-md text-body-md">Tổng quan</span>
        </a>
        <a href="leads.html" data-page="leads" class="nav-item flex items-center gap-3 px-4 py-3 text-secondary hover:bg-subtle-grey transition-all duration-200 rounded-lg">
            <span class="material-symbols-outlined">monetization_on</span>
            <span class="font-body-md text-body-md">Cơ hội bán hàng</span>
        </a>
        <a href="tasks.html" data-page="tasks" class="nav-item flex items-center gap-3 px-4 py-3 text-secondary hover:bg-subtle-grey transition-all duration-200 rounded-lg">
            <span class="material-symbols-outlined">assignment</span>
            <span class="font-body-md text-body-md">Công việc</span>
        </a>
        <a href="customers.html" data-page="customers" class="nav-item flex items-center gap-3 px-4 py-3 text-secondary hover:bg-subtle-grey transition-all duration-200 rounded-lg">
            <span class="material-symbols-outlined">group</span>
            <span class="font-body-md text-body-md">Danh sách khách hàng</span>
        </a>
        <a href="payments.html" data-page="payments" class="nav-item flex items-center gap-3 px-4 py-3 text-secondary hover:bg-subtle-grey transition-all duration-200 rounded-lg">
            <span class="material-symbols-outlined">payments</span>
            <span class="font-body-md text-body-md">Thanh toán</span>
        </a>
        <a href="settings.html" data-page="settings" class="nav-item flex items-center gap-3 px-4 py-3 text-secondary hover:bg-subtle-grey transition-all duration-200 rounded-lg">
            <span class="material-symbols-outlined">settings</span>
            <span class="font-body-md text-body-md">Cài đặt</span>
        </a>
    </nav>
    <div class="px-4 mt-auto">
        <a href="javascript:void(0)" onclick="AuthService.signOut()" class="flex items-center gap-3 p-3 bg-surface-container rounded-xl hover:bg-outline-variant transition-colors group">
            <div id="sidebar-avatar-initials" class="w-10 h-10 rounded-full bg-[#EC7700] text-white flex items-center justify-center font-bold">U</div>
            <div class="overflow-hidden flex-1">
                <p id="sidebar-user-name" class="font-label-md text-label-md font-bold truncate">Người dùng</p>
                <p id="sidebar-user-role" class="text-[10px] text-secondary truncate uppercase tracking-wider font-semibold">Nhân viên</p>
            </div>
            <span class="material-symbols-outlined text-secondary group-hover:text-primary transition-colors">logout</span>
        </a>
    </div>
</aside>
`;

const headerHTML = `
<header class="fixed top-0 right-0 w-[calc(100%-260px)] h-16 backdrop-blur-xl bg-glass-surface border-b border-outline-variant/30 flex justify-between items-center px-margin-desktop z-40">
    <div class="flex items-center flex-1 max-w-xl">
        <div class="relative w-full focus-within:ring-2 focus-within:ring-[#EC7700] rounded-lg">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">search</span>
            <input class="w-full pl-10 pr-4 py-2 bg-subtle-grey border-none rounded-lg text-body-md font-body-md focus:outline-none focus:bg-white transition-all" placeholder="Tìm kiếm nhanh..." type="text">
        </div>
    </div>
    <div class="flex items-center gap-6 ml-6">
        <button class="relative text-secondary hover:text-primary transition-colors">
            <span class="material-symbols-outlined">notifications</span>
            <span class="absolute -top-1 -right-1 w-2 h-2 bg-status-error rounded-full border-2 border-white"></span>
        </button>
        <div id="header-avatar-initials" class="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center border border-outline-variant overflow-hidden text-sm font-bold text-[#EC7700]">
            U
        </div>
    </div>
</header>
`;

// Helper load file JS động bằng Promise
function _loadScript(src) {
    return new Promise((resolve, reject) => {
        // Tránh load trùng lắp
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            if (existing.dataset.loaded === 'true') {
                resolve();
            } else {
                existing.addEventListener('load', resolve);
                existing.addEventListener('error', reject);
            }
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            script.dataset.loaded = 'true';
            resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Tự động kiểm tra và tiêm các file script nền tảng còn thiếu
async function _ensureDependenciesLoaded() {
    // 1. Tải Supabase SDK từ CDN trước tiên nếu chưa có
    if (typeof supabase === 'undefined') {
        await _loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    }
    // 2. Tải config.js
    if (typeof SUPABASE_CONFIG === 'undefined') {
        await _loadScript('assets/js/config.js').catch(() => {
            console.warn('config.js not found, running offline fallback');
        });
    }
    // 3. Tải supabase client initialization
    if (typeof window.supabaseClient === 'undefined') {
        await _loadScript('assets/js/auth/supabase.js');
    }
    // 4. Tải các helpers UI dùng chung (Toast, Modal, SlideOver)
    if (typeof showToast === 'undefined') {
        await _loadScript('assets/js/components/toast.js');
    }
    if (typeof Modal === 'undefined') {
        await _loadScript('assets/js/components/modal.js');
    }
    if (typeof SlideOver === 'undefined') {
        await _loadScript('assets/js/components/slideover.js');
    }
    // 5. Tải AuthService và ProfileService
    if (typeof AuthService === 'undefined') {
        await _loadScript('assets/js/auth/auth.js');
    }
    if (typeof ProfileService === 'undefined') {
        await _loadScript('assets/js/auth/profile.js');
    }
}

async function injectLayout(currentPage) {
    try {
        // Tự động chuẩn bị môi trường chạy
        await _ensureDependenciesLoaded();

        // Kiểm tra Route Guard
        const user = await AuthService.checkSession();
        if (!user) return; // Đã tự chuyển hướng về login

        // Lấy profile đầy đủ từ DB để phân quyền
        const profileResult = await ProfileService.getUserProfile(user.id);
        const profile = profileResult.success ? profileResult.profile : {
            full_name: user.user_metadata.full_name || user.email.split('@')[0],
            role: 'sales'
        };

        // Render Sidebar & Header
        const sidebarContainer = document.getElementById('sidebar-container');
        const headerContainer = document.getElementById('header-container');

        if (sidebarContainer) {
            sidebarContainer.innerHTML = sidebarHTML;

            // Đặt active tab cho trang hiện tại
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => {
                if (item.getAttribute('data-page') === currentPage) {
                    item.classList.remove('text-secondary', 'hover:bg-subtle-grey');
                    item.classList.add('border-l-4', 'border-[#EC7700]', 'bg-[#EC7700]/10', 'text-[#EC7700]', 'font-bold');
                }
            });

            // Cập nhật thông tin Profile ở sidebar footer
            const userNameEl = document.getElementById('sidebar-user-name');
            const userRoleEl = document.getElementById('sidebar-user-role');
            const userInitialsEl = document.getElementById('sidebar-avatar-initials');

            if (userNameEl) userNameEl.textContent = profile.full_name;
            if (userRoleEl) {
                let roleVietnamese = 'Sales';
                if (profile.role === 'admin') roleVietnamese = 'Quản trị viên';
                if (profile.role === 'team_lead') roleVietnamese = 'Trưởng nhóm';
                userRoleEl.textContent = roleVietnamese;
            }

            // Sinh initials đại diện avatar
            if (userInitialsEl) {
                const initials = profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                userInitialsEl.textContent = initials;
            }
        }

        if (headerContainer) {
            headerContainer.innerHTML = headerHTML;

            // Cập nhật avatar ở top header
            const headerInitialsEl = document.getElementById('header-avatar-initials');
            if (headerInitialsEl) {
                const initials = profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                headerInitialsEl.textContent = initials;
            }
        }

        // Đồng bộ lời chào cá nhân hóa nếu trang có element welcome-text
        const welcomeHeader = document.querySelector('main h2');
        if (welcomeHeader && welcomeHeader.textContent.includes('Chào buổi sáng')) {
            welcomeHeader.textContent = `Chào buổi sáng, ${profile.full_name}`;
        }

    } catch (e) {
        console.error('Error injecting layout:', e);
    }
}
