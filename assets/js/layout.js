const sidebarHTML = `
<aside class="fixed left-0 top-0 h-screen w-[260px] border-r border-outline-variant bg-surface shadow-sm flex flex-col py-6 z-50">
    <div class="px-6 mb-10 text-center">
        <h1 class="text-primary-container font-bold text-xl">SAIGON SMILE</h1>
        <p class="text-xs text-secondary mt-1">Medical Spa CRM</p>
    </div>
    <nav class="flex-1 px-2 space-y-1" id="main-nav">
        <a href="dashboard.html" data-page="dashboard" class="nav-item flex items-center gap-3 px-4 py-3 text-secondary hover:bg-subtle-grey transition-colors duration-200 rounded-lg">
            <span class="material-symbols-outlined">dashboard</span>
            <span class="font-body-md text-body-md">Tổng quan</span>
        </a>
        <a href="leads.html" data-page="leads" class="nav-item flex items-center gap-3 px-4 py-3 text-secondary hover:bg-subtle-grey transition-colors duration-200 rounded-lg">
            <span class="material-symbols-outlined">monetization_on</span>
            <span class="font-body-md text-body-md">Cơ hội bán hàng</span>
        </a>
        <a href="tasks.html" data-page="tasks" class="nav-item flex items-center gap-3 px-4 py-3 text-secondary hover:bg-subtle-grey transition-colors duration-200 rounded-lg">
            <span class="material-symbols-outlined">assignment</span>
            <span class="font-body-md text-body-md">Công việc</span>
        </a>
        <a href="customers.html" data-page="customers" class="nav-item flex items-center gap-3 px-4 py-3 text-secondary hover:bg-subtle-grey transition-colors duration-200 rounded-lg">
            <span class="material-symbols-outlined">group</span>
            <span class="font-body-md text-body-md">Danh sách khách hàng</span>
        </a>
        <a href="payments.html" data-page="payments" class="nav-item flex items-center gap-3 px-4 py-3 text-secondary hover:bg-subtle-grey transition-colors duration-200 rounded-lg">
            <span class="material-symbols-outlined">payments</span>
            <span class="font-body-md text-body-md">Thanh toán</span>
        </a>
        <a href="settings.html" data-page="settings" class="nav-item flex items-center gap-3 px-4 py-3 text-secondary hover:bg-subtle-grey transition-colors duration-200 rounded-lg">
            <span class="material-symbols-outlined">settings</span>
            <span class="font-body-md text-body-md">Cài đặt</span>
        </a>
    </nav>
    <div class="px-4 mt-auto">
        <a href="login.html" class="flex items-center gap-3 p-3 bg-surface-container rounded-xl hover:bg-outline-variant transition-colors">
            <div class="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center font-bold">AD</div>
            <div class="overflow-hidden">
                <p class="font-label-md text-label-md font-bold truncate">Quản trị viên</p>
                <p class="text-[10px] text-secondary truncate">Đăng xuất</p>
            </div>
        </a>
    </div>
</aside>
`;

const headerHTML = `
<header class="fixed top-0 right-0 w-[calc(100%-260px)] h-16 backdrop-blur-xl bg-glass-surface border-b border-outline-variant/30 flex justify-between items-center px-margin-desktop z-40">
    <div class="flex items-center flex-1 max-w-xl">
        <div class="relative w-full focus-within:ring-2 focus-within:ring-primary rounded-lg">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">search</span>
            <input class="w-full pl-10 pr-4 py-2 bg-subtle-grey border-none rounded-lg text-body-md font-body-md focus:outline-none focus:bg-white transition-all" placeholder="Tìm kiếm khách hàng, lịch hẹn, công việc..." type="text">
        </div>
    </div>
    <div class="flex items-center gap-6 ml-6">
        <button class="relative text-secondary hover:text-primary transition-colors">
            <span class="material-symbols-outlined">notifications</span>
            <span class="absolute -top-1 -right-1 w-2 h-2 bg-status-error rounded-full border-2 border-white"></span>
        </button>
        <div class="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center border border-outline-variant overflow-hidden text-sm font-bold text-primary-container">
            AD
        </div>
    </div>
</header>
`;

function injectLayout(currentPage) {
    const sidebarContainer = document.getElementById('sidebar-container');
    const headerContainer = document.getElementById('header-container');
    
    if (sidebarContainer) {
        sidebarContainer.innerHTML = sidebarHTML;
        // Set active state
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (item.getAttribute('data-page') === currentPage) {
                item.classList.remove('text-secondary', 'hover:bg-subtle-grey');
                item.classList.add('border-l-4', 'border-primary', 'bg-primary-container/10', 'text-primary', 'font-bold');
            }
        });
    }
    
    if (headerContainer) {
        headerContainer.innerHTML = headerHTML;
    }
}
