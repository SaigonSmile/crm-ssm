// settings.js - Xử lý chuyển đổi Tab mượt mà, lưu thông tin hồ sơ và quản lý tài khoản nhân viên (độc quyền Admin)

const SettingsModule = {
    activeTab: 'profile', // profile, security, employees
    profiles: [],

    async init() {
        showToast('Đang tải cấu hình...', 'info', 800);

        // Bind events chuyển tab
        this.bindEvents();

        // Nạp thông tin tài khoản hiện tại vào các ô input
        this.loadProfileData();

        // Fetch danh sách nhân viên
        await this.fetchEmployees();
    },

    bindEvents() {
        const navLinks = document.querySelectorAll('nav.col-span-3 a');
        const sections = document.querySelectorAll('.col-span-9 section');

        navLinks.forEach((link, idx) => {
            link.onclick = (e) => {
                e.preventDefault();
                
                // Active class sidebar
                navLinks.forEach(l => {
                    l.className = "flex items-center gap-3 px-5 py-4 text-secondary hover:bg-white hover:shadow-sm rounded-xl transition-all";
                });
                link.className = "glass-card flex items-center gap-3 px-5 py-4 bg-primary-container text-white shadow-md";

                // Show/hide sections
                sections.forEach(s => s.classList.add('hidden'));

                if (idx === 0) {
                    this.activeTab = 'profile';
                    sections[0].classList.remove('hidden');
                } else if (idx === 1) {
                    this.activeTab = 'security';
                    sections[1].classList.remove('hidden');
                } else if (idx === 2) {
                    this.activeTab = 'employees';
                    sections[2].classList.remove('hidden');
                } else {
                    // Mấy tab phụ khác cho phép hiển thị profile tạm thời kèm thông báo
                    sections[0].classList.remove('hidden');
                    showToast('Tính năng này sẽ khả dụng ở phiên bản tiếp theo!', 'info');
                }
            };
        });

        // Nút lưu thay đổi hồ sơ
        const saveProfileBtn = document.querySelector('section:first-of-type button.bg-primary');
        if (saveProfileBtn) {
            saveProfileBtn.onclick = () => this.updateProfile();
        }
    },

    loadProfileData() {
        const userJson = localStorage.getItem('crm_user') || localStorage.getItem('crm_mock_user');
        if (!userJson) return;

        try {
            const user = JSON.parse(userJson);

            const nameInput = document.querySelector('input[value="Nguyễn Hoàng Minh"]');
            const emailEl = document.querySelector('span:contains("@")') || document.querySelector('.border-b-2.border-outline-variant\\/30 span.font-body-md');
            const phoneInput = document.querySelector('input[value="0988 123 456"]');
            const titleInput = document.querySelector('input[value="Quản lý chi nhánh Quận 1"]');

            if (nameInput) nameInput.value = user.full_name || '';
            if (emailEl) emailEl.textContent = user.email || '';
            if (phoneInput) phoneInput.value = user.phone || '0988 123 456';
            if (titleInput) titleInput.value = user.role === 'admin' ? 'Quản trị viên Hệ thống' : 'Trưởng nhóm / Sales';

            const idEl = document.querySelector('span:contains("ID: SS-ADMIN-01")') || document.querySelector('.flex.flex-col.items-center.gap-4 span.text-body-sm');
            if (idEl) idEl.textContent = `ID: SS-USER-${(user.id || 'MOCK').substring(0, 8).toUpperCase()}`;

        } catch (e) {
            console.error('Error loading settings profile data:', e);
        }
    },

    async updateProfile() {
        const nameInput = document.querySelector('input[value="Nguyễn Hoàng Minh"]') || document.querySelector('input[type="text"]');
        const phoneInput = document.querySelector('input[value="0988 123 456"]');

        const fullName = nameInput ? nameInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';

        if (!fullName) {
            showToast('Họ và tên không được để trống!', 'warning');
            return;
        }

        showToast('Đang cập nhật hồ sơ...', 'info', 800);

        const currentMockUser = localStorage.getItem('crm_mock_user');
        const currentUser = localStorage.getItem('crm_user');

        if (!window.supabaseClient) {
            // Offline Mode
            if (currentMockUser) {
                const user = JSON.parse(currentMockUser);
                user.full_name = fullName;
                user.phone = phone;
                localStorage.setItem('crm_mock_user', JSON.stringify(user));
            }
            showToast('Cập nhật hồ sơ thành công (Offline Mode)!', 'success');
            // Refresh Header & Sidebar
            if (typeof injectLayout === 'function') injectLayout('settings');
            return;
        }

        try {
            const user = JSON.parse(currentUser || '{}');
            if (!user.id) throw new Error('Không xác định được Session User');

            const { error } = await window.supabaseClient
                .from('profiles')
                .update({ full_name: fullName })
                .eq('id', user.id);

            if (error) throw error;

            user.full_name = fullName;
            localStorage.setItem('crm_user', JSON.stringify(user));

            showToast('Đã lưu thông tin hồ sơ mới!', 'success');
            // Refresh Header & Sidebar
            if (typeof injectLayout === 'function') injectLayout('settings');
        } catch (e) {
            console.error('Update profile error:', e.message);
            showToast('Lỗi cập nhật: ' + e.message, 'error');
        }
    },

    async fetchEmployees() {
        if (!window.supabaseClient) {
            // Mock Offline Staff
            this.profiles = [
                { id: '1', full_name: 'Lê Thị Tuyết', email: 'tuyet.lt@saigonsmile.vn', role: 'sales', is_active: true },
                { id: '2', full_name: 'Trần Văn Nam', email: 'nam.tv@saigonsmile.vn', role: 'sales', is_active: false },
                { id: '3', full_name: 'Quốc Bảo', email: 'bao.q@saigonsmile.vn', role: 'team_lead', is_active: true }
            ];
            this.renderEmployeesTable();
            return;
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('profiles')
                .select('*')
                .order('role', { ascending: true });

            if (error) throw error;
            this.profiles = data || [];
            this.renderEmployeesTable();
        } catch (e) {
            console.error('Fetch staff members error:', e.message);
        }
    },

    renderEmployeesTable() {
        const tbody = document.querySelector('section:nth-of-type(3) tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.profiles.forEach(p => {
            const isCompleted = p.is_active;
            const initials = p.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            tbody.innerHTML += `
                <tr class="hover:bg-subtle-grey/50 transition-colors">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xs">
                                ${initials}
                            </div>
                            <div>
                                <p class="font-body-md font-medium text-on-surface">${p.full_name}</p>
                                <p class="text-[11px] text-secondary">${p.email}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-body-sm text-secondary uppercase">${p.role === 'admin' ? 'Quản trị viên' : p.role === 'team_lead' ? 'Trưởng nhóm' : 'Tư vấn viên (Sales)'}</td>
                    <td class="px-6 py-4">
                        <span class="px-3 py-1 ${isCompleted ? 'bg-status-success/10 text-status-success' : 'bg-status-error/10 text-status-error'} text-[10px] font-bold rounded-full uppercase tracking-wider">
                            ${isCompleted ? 'Hoạt động' : 'Tạm khóa'}
                        </span>
                    </td>
                    <td class="px-6 py-4">
                        <button class="text-secondary hover:text-primary transition-colors p-2" onclick="SettingsModule.showEmployeeActions('${p.id}', event)">
                            <span class="material-symbols-outlined text-lg">more_vert</span>
                        </button>
                    </td>
                </tr>
            `;
        });
    },

    showEmployeeActions(id, event) {
        event.stopPropagation();
        const profile = this.profiles.find(p => p.id === id);
        if (!profile) return;

        const contentHTML = `
            <div class="space-y-4">
                <button class="w-full text-left px-4 py-3 hover:bg-subtle-grey rounded-xl transition-all flex items-center gap-3 text-on-surface" onclick="Modal.close(); SettingsModule.toggleEmployeeActive('${id}')">
                    <span class="material-symbols-outlined text-secondary">${profile.is_active ? 'lock' : 'lock_open'}</span>
                    <span>${profile.is_active ? 'Tạm khóa tài khoản' : 'Kích hoạt tài khoản'}</span>
                </button>
                <div class="border-t border-outline-variant/30 my-2"></div>
                <div class="px-4 py-2 text-xs uppercase tracking-wider text-secondary font-bold">Thay đổi phân quyền</div>
                <button class="w-full text-left px-4 py-3 hover:bg-subtle-grey rounded-xl transition-all flex items-center gap-3 text-on-surface" onclick="Modal.close(); SettingsModule.changeEmployeeRole('${id}', 'sales')">
                    <span class="material-symbols-outlined text-secondary">person</span>
                    <span>Đặt làm Tư vấn viên (Sales)</span>
                </button>
                <button class="w-full text-left px-4 py-3 hover:bg-subtle-grey rounded-xl transition-all flex items-center gap-3 text-on-surface" onclick="Modal.close(); SettingsModule.changeEmployeeRole('${id}', 'team_lead')">
                    <span class="material-symbols-outlined text-secondary">supervisor_account</span>
                    <span>Đặt làm Trưởng nhóm (Team Lead)</span>
                </button>
            </div>
        `;

        Modal.show({
            title: `Quản lý nhân sự: ${profile.full_name}`,
            contentHTML: contentHTML,
            confirmText: 'Đóng',
            onConfirm: () => true
        });
    },

    async toggleEmployeeActive(id) {
        const profile = this.profiles.find(p => p.id === id);
        if (!profile) return;

        const nextActive = !profile.is_active;
        showToast(nextActive ? 'Đang kích hoạt...' : 'Đang tạm khóa...', 'info', 600);

        if (!window.supabaseClient) {
            profile.is_active = nextActive;
            this.renderEmployeesTable();
            showToast('Cập nhật thành công (Offline Mode)', 'success');
            return;
        }

        try {
            const { error } = await window.supabaseClient
                .from('profiles')
                .update({ is_active: nextActive })
                .eq('id', id);

            if (error) throw error;

            profile.is_active = nextActive;
            this.renderEmployeesTable();
            showToast('Đã thay đổi trạng thái hoạt động của tài khoản!', 'success');
        } catch (e) {
            console.error('Toggle active error:', e.message);
            showToast('Lỗi cập nhật RLS: ' + e.message, 'error');
        }
    },

    async changeEmployeeRole(id, newRole) {
        const profile = this.profiles.find(p => p.id === id);
        if (!profile) return;

        showToast('Đang cập nhật phân quyền...', 'info', 600);

        if (!window.supabaseClient) {
            profile.role = newRole;
            this.renderEmployeesTable();
            showToast('Cập nhật phân quyền thành công (Offline Mode)', 'success');
            return;
        }

        try {
            const { error } = await window.supabaseClient
                .from('profiles')
                .update({ role: newRole })
                .eq('id', id);

            if (error) throw error;

            profile.role = newRole;
            this.renderEmployeesTable();
            showToast(`Đã thay đổi phân quyền thành ${newRole}!`, 'success');
        } catch (e) {
            console.error('Change role error:', e.message);
            showToast('Lỗi thay đổi phân quyền RLS: ' + e.message, 'error');
        }
    }
};

window.SettingsModule = SettingsModule;
