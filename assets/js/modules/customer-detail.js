// customer-detail.js - Quản lý chi tiết hồ sơ khách hàng, các cơ hội liên quan, lịch sử thanh toán và lịch hẹn công việc chăm sóc

const CustomerDetailModule = {
    customerId: null,
    customer: null,
    opportunities: [],
    payments: [],
    tasks: [],

    async init() {
        // 1. Phân tích URL để lấy customer ID
        const urlParams = new URLSearchParams(window.location.search);
        this.customerId = urlParams.get('id');

        if (!this.customerId) {
            showToast('Không tìm thấy khách hàng yêu cầu!', 'error');
            setTimeout(() => window.location.href = 'customers.html', 1500);
            return;
        }

        showToast('Đang tải hồ sơ chi tiết...', 'info', 800);

        // 2. Gắn sự kiện điều hướng Tabs
        this.bindTabs();

        // 3. Fetch dữ liệu tổng hợp
        await this.fetchCustomerProfile();
        await this.fetchRelatedOpps();
        await this.fetchRelatedPayments();
        await this.fetchRelatedTasks();

        // 4. Gắn các sự kiện thao tác nhanh (Thêm cơ hội, Thêm thanh toán, Thêm task)
        this.bindQuickActions();
    },

    bindTabs() {
        const tabBtnOpps = document.getElementById('tab-btn-opportunities');
        const tabBtnPays = document.getElementById('tab-btn-payments');
        const tabBtnTasks = document.getElementById('tab-btn-tasks');

        const contentOpps = document.getElementById('tab-content-opportunities');
        const contentPays = document.getElementById('tab-content-payments');
        const contentTasks = document.getElementById('tab-content-tasks');

        const tabs = [
            { btn: tabBtnOpps, content: contentOpps },
            { btn: tabBtnPays, content: contentPays },
            { btn: tabBtnTasks, content: contentTasks }
        ];

        tabs.forEach(item => {
            if (item.btn) {
                item.btn.onclick = () => {
                    // Reset active style on all buttons
                    tabs.forEach(x => {
                        if (x.btn) {
                            x.btn.className = "px-5 py-2.5 text-secondary hover:bg-subtle-grey rounded-lg font-button transition-all text-sm";
                            x.content.classList.add('hidden');
                        }
                    });
                    
                    // Activate clicked tab
                    item.btn.className = "px-5 py-2.5 bg-[#EC7700] text-white rounded-lg font-button shadow-sm transition-all text-sm";
                    item.content.classList.remove('hidden');
                };
            }
        });
    },

    async fetchCustomerProfile() {
        if (!window.supabaseClient) {
            // Mock Profile Offline
            const mockCustomers = [
                { id: '1', full_name: 'Nguyễn Thị Lan Anh', phone: '0912 345 678', email: 'lananh.nguyen@gmail.com', segment: 'VIP', address: '144 Xuân Thủy, Cầu Giấy, Hà Nội' },
                { id: '2', full_name: 'Lê Văn Hoàng', phone: '0988 777 666', email: 'hoang.le@vinhomes.vn', segment: 'Tiềm năng cao', address: 'Park 7, Vinhomes Central Park, TP.HCM' },
                { id: '3', full_name: 'Phạm Thu Trang', phone: '0904 112 233', email: 'trang.pham@shopee.vn', segment: 'Khách mới', address: 'Tòa nhà Saigon Centre, Quận 1, TP.HCM' }
            ];
            this.customer = mockCustomers.find(c => c.id === this.customerId) || {
                id: this.customerId,
                full_name: 'Khách hàng Offline',
                phone: '0900 000 000',
                email: 'offline@saigonsmile.vn',
                segment: 'Khách mới',
                address: 'Chưa cập nhật'
            };
            this.renderProfile();
            return;
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('customers')
                .select('*')
                .eq('id', this.customerId)
                .single();

            if (error) throw error;
            this.customer = data;
            this.renderProfile();
        } catch (e) {
            console.error('Fetch customer profile error:', e.message);
            showToast('Lỗi tải hồ sơ khách hàng: ' + e.message, 'error');
        }
    },

    renderProfile() {
        if (!this.customer) return;

        const avatarEl = document.getElementById('detail-avatar');
        const nameEl = document.getElementById('detail-name');
        const segmentEl = document.getElementById('detail-segment');
        const phoneEl = document.getElementById('detail-phone');
        const emailEl = document.getElementById('detail-email');
        const addressEl = document.getElementById('detail-address');

        const initials = this.customer.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        if (avatarEl) avatarEl.textContent = initials;
        if (nameEl) nameEl.textContent = this.customer.full_name;
        if (segmentEl) {
            segmentEl.textContent = this.customer.segment || 'Khách vãng lai';
            if (this.customer.segment === 'VIP') {
                segmentEl.className = "px-3 py-1 rounded-full text-xs font-bold bg-[#EC7700]/10 text-[#EC7700]";
            } else if (this.customer.segment === 'Tiềm năng cao') {
                segmentEl.className = "px-3 py-1 rounded-full text-xs font-bold bg-status-success/10 text-status-success";
            } else {
                segmentEl.className = "px-3 py-1 rounded-full text-xs font-bold bg-subtle-grey text-secondary";
            }
        }
        if (phoneEl) phoneEl.textContent = this.customer.phone;
        if (emailEl) emailEl.textContent = this.customer.email || 'Chưa cung cấp';
        if (addressEl) addressEl.textContent = this.customer.address || 'Chưa cung cấp';

        // Gắn sự kiện edit hồ sơ nhanh
        const editBtn = document.getElementById('edit-customer-btn');
        if (editBtn) {
            editBtn.onclick = () => this.showEditCustomerModal();
        }
    },

    async fetchRelatedOpps() {
        if (!window.supabaseClient) {
            this.opportunities = [
                { id: '101', title: 'Liệu trình trẻ hóa Thermage Vingroup', expected_value: 120000000, stage: 'da_dat_lich', created_at: new Date().toISOString() }
            ];
            this.renderOpps();
            return;
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('opportunities')
                .select('*')
                .eq('customer_id', this.customerId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            this.opportunities = data || [];
            this.renderOpps();
        } catch (e) {
            console.error('Fetch related opps error:', e.message);
        }
    },

    renderOpps() {
        const tbody = document.getElementById('detail-opps-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.opportunities.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="px-6 py-6 text-center text-secondary">Chưa có cơ hội bán hàng nào được tạo.</td>
                </tr>
            `;
            return;
        }

        this.opportunities.forEach(o => {
            const dateStr = new Date(o.created_at).toLocaleDateString('vi-VN');
            const valueStr = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(o.expected_value || 0);

            tbody.innerHTML += `
                <tr class="hover:bg-subtle-grey transition-colors cursor-pointer" onclick="window.location.href='leads.html'">
                    <td class="px-6 py-4 font-bold text-on-surface">${o.title}</td>
                    <td class="px-6 py-4 text-[#EC7700] font-bold">${valueStr}</td>
                    <td class="px-6 py-4">
                        <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary uppercase">
                            ${o.stage || 'Mới tạo'}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-secondary">${dateStr}</td>
                </tr>
            `;
        });
    },

    async fetchRelatedPayments() {
        if (!window.supabaseClient) {
            this.payments = [
                { id: 'p1', amount: 25000000, method: 'transfer', status: 'completed', payment_date: new Date().toISOString() }
            ];
            this.renderPayments();
            return;
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('payments')
                .select('*')
                .eq('customer_id', this.customerId)
                .order('payment_date', { ascending: false });

            if (error) throw error;
            this.payments = data || [];
            this.renderPayments();
        } catch (e) {
            console.error('Fetch related payments error:', e.message);
        }
    },

    renderPayments() {
        const tbody = document.getElementById('detail-payments-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.payments.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-6 text-center text-secondary">Chưa ghi nhận giao dịch thanh toán nào.</td>
                </tr>
            `;
            return;
        }

        this.payments.forEach(p => {
            const dateStr = new Date(p.payment_date).toLocaleDateString('vi-VN');
            const amountStr = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.amount || 0);

            let badge = '';
            if (p.status === 'completed') {
                badge = '<span class="px-2 py-0.5 rounded-full bg-status-success/10 text-status-success font-bold text-xs uppercase">Thành công</span>';
            } else if (p.status === 'pending') {
                badge = '<span class="px-2 py-0.5 rounded-full bg-status-info/10 text-status-info font-bold text-xs uppercase">Chờ xử lý</span>';
            } else {
                badge = '<span class="px-2 py-0.5 rounded-full bg-status-error/10 text-status-error font-bold text-xs uppercase">Đã hủy</span>';
            }

            tbody.innerHTML += `
                <tr class="hover:bg-subtle-grey transition-colors">
                    <td class="px-6 py-4 text-secondary">#TX-${p.id.substring(0, 6).toUpperCase()}</td>
                    <td class="px-6 py-4 text-[#EC7700] font-bold">${amountStr}</td>
                    <td class="px-6 py-4 uppercase">${p.method}</td>
                    <td class="px-6 py-4">${badge}</td>
                    <td class="px-6 py-4 text-secondary">${dateStr}</td>
                </tr>
            `;
        });
    },

    async fetchRelatedTasks() {
        if (!window.supabaseClient) {
            this.tasks = [
                { id: 't1', title: 'Gọi điện thoại chăm sóc sau liệu trình Hifu', priority: 'high', status: 'todo', due_date: new Date().toISOString() }
            ];
            this.renderTasks();
            return;
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('tasks')
                .select('*')
                .eq('customer_id', this.customerId)
                .order('due_date', { ascending: true });

            if (error) throw error;
            this.tasks = data || [];
            this.renderTasks();
        } catch (e) {
            console.error('Fetch related tasks error:', e.message);
        }
    },

    renderTasks() {
        const tbody = document.getElementById('detail-tasks-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.tasks.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="px-6 py-6 text-center text-secondary">Chưa có nhiệm vụ chăm sóc nào được xếp lịch.</td>
                </tr>
            `;
            return;
        }

        this.tasks.forEach(t => {
            const isCompleted = t.status === 'done';
            const dateStr = t.due_date ? new Date(t.due_date).toLocaleString('vi-VN') : 'Không hạn';

            let priorityBadge = '';
            if (t.priority === 'high') {
                priorityBadge = '<span class="px-2.5 py-0.5 rounded-full bg-status-error/10 text-status-error text-xs font-bold uppercase">Cao</span>';
            } else if (t.priority === 'medium') {
                priorityBadge = '<span class="px-2.5 py-0.5 rounded-full bg-status-warning/10 text-status-warning text-xs font-bold uppercase">Trung bình</span>';
            } else {
                priorityBadge = '<span class="px-2.5 py-0.5 rounded-full bg-status-info/10 text-status-info text-xs font-bold uppercase">Thấp</span>';
            }

            const tr = document.createElement('tr');
            tr.className = `hover:bg-subtle-grey transition-colors ${isCompleted ? 'opacity-50' : ''}`;
            tr.innerHTML = `
                <td class="px-6 py-4 text-center">
                    <input class="w-5 h-5 rounded-full border-outline-variant text-[#EC7700] focus:ring-[#EC7700] transition-all cursor-pointer" 
                        type="checkbox" ${isCompleted ? 'checked' : ''} onclick="CustomerDetailModule.toggleTaskComplete('${t.id}', this)" />
                </td>
                <td class="px-6 py-4 font-medium text-on-surface ${isCompleted ? 'line-through text-secondary' : ''}">${t.title}</td>
                <td class="px-6 py-4">${priorityBadge}</td>
                <td class="px-6 py-4 text-secondary">${dateStr}</td>
            `;
            tbody.appendChild(tr);
        });
    },

    async toggleTaskComplete(id, checkboxEl) {
        const isChecked = checkboxEl.checked;
        const newStatus = isChecked ? 'done' : 'todo';

        showToast(isChecked ? 'Đang hoàn thành...' : 'Đang mở lại...', 'info', 600);

        if (!window.supabaseClient) {
            const idx = this.tasks.findIndex(t => t.id === id);
            if (idx !== -1) {
                this.tasks[idx].status = newStatus;
                this.renderTasks();
            }
            return;
        }

        try {
            const { error } = await window.supabaseClient
                .from('tasks')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            const idx = this.tasks.findIndex(t => t.id === id);
            if (idx !== -1) {
                this.tasks[idx].status = newStatus;
            }
            this.renderTasks();
            showToast(isChecked ? 'Đã hoàn thành công việc!' : 'Đã mở lại công việc!', 'success');
        } catch (e) {
            console.error('Toggle task complete error:', e.message);
            showToast('Lỗi cập nhật RLS: ' + e.message, 'error');
            checkboxEl.checked = !isChecked; // Restore
        }
    },

    bindQuickActions() {
        // 1. Thêm cơ hội mới liên kết
        const addOppBtn = document.getElementById('add-detail-opp-btn');
        if (addOppBtn) {
            addOppBtn.onclick = () => this.showAddOppPanel();
        }

        // 2. Ghi nhận thanh toán liên kết
        const addPayBtn = document.getElementById('add-detail-pay-btn');
        if (addPayBtn) {
            addPayBtn.onclick = () => this.showAddPaymentPanel();
        }

        // 3. Thêm nhiệm vụ liên kết
        const addTaskBtn = document.getElementById('add-detail-task-btn');
        if (addTaskBtn) {
            addTaskBtn.onclick = () => this.showAddTaskPanel();
        }
    },

    showAddOppPanel() {
        const contentHTML = `
            <form id="detail-add-opp-form" class="space-y-5">
                <div class="flex flex-col gap-2">
                    <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Tên cơ hội / Dịch vụ đăng ký *</label>
                    <input name="title" required class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md" type="text" placeholder="Combo giảm béo Ultra Slim..." />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Giá trị dự kiến (VND) *</label>
                    <input name="expectedValue" required class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md" type="number" placeholder="25000000" />
                </div>
            </form>
        `;

        SlideOver.show({
            title: 'Tạo cơ hội bán hàng mới',
            contentHTML: contentHTML,
            saveText: 'Tạo cơ hội',
            onSave: async () => {
                const form = document.getElementById('detail-add-opp-form');
                if (!form.reportValidity()) return false;

                const formData = new FormData(form);
                const newOpp = {
                    customer_id: this.customerId,
                    title: formData.get('title').trim(),
                    expected_value: parseFloat(formData.get('expectedValue')),
                    stage: 'moi_tao'
                };

                if (!window.supabaseClient) {
                    this.opportunities.unshift({ id: Date.now().toString(), ...newOpp, created_at: new Date().toISOString() });
                    this.renderOpps();
                    showToast('Đã thêm cơ hội (Offline Mode)!', 'success');
                    return true;
                }

                try {
                    const { data, error } = await window.supabaseClient
                        .from('opportunities')
                        .insert([newOpp])
                        .select()
                        .single();

                    if (error) throw error;

                    this.opportunities.unshift(data);
                    this.renderOpps();
                    showToast('Đã thêm cơ hội thành công!', 'success');
                    return true;
                } catch (e) {
                    console.error(e);
                    showToast('Lỗi lưu: ' + e.message, 'error');
                    return false;
                }
            }
        });
    },

    showAddPaymentPanel() {
        const contentHTML = `
            <form id="detail-add-pay-form" class="space-y-5">
                <div class="flex flex-col gap-2">
                    <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Số tiền nhận (VND) *</label>
                    <input name="amount" required class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md" type="number" placeholder="15000000" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Phương thức</label>
                        <select name="method" class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md">
                            <option value="transfer">Chuyển khoản</option>
                            <option value="cash">Tiền mặt</option>
                            <option value="card">Thẻ ngân hàng</option>
                        </select>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Trạng thái</label>
                        <select name="status" class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md">
                            <option value="completed">Hoàn thành</option>
                            <option value="pending">Chờ xử lý</option>
                        </select>
                    </div>
                </div>
            </form>
        `;

        SlideOver.show({
            title: 'Ghi nhận thanh toán nhanh',
            contentHTML: contentHTML,
            saveText: 'Ghi nhận',
            onSave: async () => {
                const form = document.getElementById('detail-add-pay-form');
                if (!form.reportValidity()) return false;

                const formData = new FormData(form);
                const newPay = {
                    customer_id: this.customerId,
                    amount: parseFloat(formData.get('amount')),
                    method: formData.get('method'),
                    status: formData.get('status'),
                    payment_date: new Date().toISOString()
                };

                if (!window.supabaseClient) {
                    this.payments.unshift({ id: Date.now().toString(), ...newPay });
                    this.renderPayments();
                    showToast('Đã ghi nhận thanh toán (Offline Mode)!', 'success');
                    return true;
                }

                try {
                    const { data, error } = await window.supabaseClient
                        .from('payments')
                        .insert([newPay])
                        .select()
                        .single();

                    if (error) throw error;

                    this.payments.unshift(data);
                    this.renderPayments();
                    showToast('Đã ghi nhận thanh toán thành công!', 'success');
                    return true;
                } catch (e) {
                    console.error(e);
                    showToast('Lỗi lưu: ' + e.message, 'error');
                    return false;
                }
            }
        });
    },

    showAddTaskPanel() {
        const contentHTML = `
            <form id="detail-add-task-form" class="space-y-5">
                <div class="flex flex-col gap-2">
                    <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Tên công việc / Lịch hẹn *</label>
                    <input name="title" required class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md" type="text" placeholder="Gọi tư vấn liệu trình nâng cơ..." />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Ưu tiên</label>
                        <select name="priority" class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md">
                            <option value="medium">Trung bình</option>
                            <option value="high">Cao</option>
                            <option value="low">Thấp</option>
                        </select>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Hạn hoàn thành *</label>
                        <input name="dueDate" required class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md" type="datetime-local" />
                    </div>
                </div>
            </form>
        `;

        SlideOver.show({
            title: 'Tạo nhiệm vụ chăm sóc mới',
            contentHTML: contentHTML,
            saveText: 'Tạo công việc',
            onSave: async () => {
                const form = document.getElementById('detail-add-task-form');
                if (!form.reportValidity()) return false;

                const formData = new FormData(form);
                const newTask = {
                    customer_id: this.customerId,
                    title: formData.get('title').trim(),
                    priority: formData.get('priority'),
                    due_date: formData.get('dueDate') ? new Date(formData.get('dueDate')).toISOString() : null,
                    status: 'todo'
                };

                if (!window.supabaseClient) {
                    this.tasks.unshift({ id: Date.now().toString(), ...newTask });
                    this.renderTasks();
                    showToast('Đã xếp lịch công việc (Offline Mode)!', 'success');
                    return true;
                }

                try {
                    const { data, error } = await window.supabaseClient
                        .from('tasks')
                        .insert([newTask])
                        .select()
                        .single();

                    if (error) throw error;

                    this.tasks.unshift(data);
                    this.renderTasks();
                    showToast('Đã thêm công việc thành công!', 'success');
                    return true;
                } catch (e) {
                    console.error(e);
                    showToast('Lỗi: ' + e.message, 'error');
                    return false;
                }
            }
        });
    },

    showEditCustomerModal() {
        if (!this.customer) return;

        const contentHTML = `
            <form id="detail-edit-cust-form" class="space-y-4">
                <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold text-secondary uppercase">Họ và tên *</label>
                    <input name="fullName" required class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] transition-all text-body-md" type="text" value="${this.customer.full_name}" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold text-secondary uppercase">Số điện thoại *</label>
                        <input name="phone" required class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] transition-all text-body-md" type="text" value="${this.customer.phone}" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold text-secondary uppercase">Phân khúc</label>
                        <select name="segment" class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] transition-all text-body-md">
                            <option value="VIP" ${this.customer.segment === 'VIP' ? 'selected' : ''}>VIP</option>
                            <option value="Tiềm năng cao" ${this.customer.segment === 'Tiềm năng cao' ? 'selected' : ''}>Tiềm năng cao</option>
                            <option value="Khách mới" ${this.customer.segment === 'Khách mới' ? 'selected' : ''}>Khách mới</option>
                        </select>
                    </div>
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold text-secondary uppercase">Địa chỉ</label>
                    <input name="address" class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] transition-all text-body-md" type="text" value="${this.customer.address || ''}" />
                </div>
            </form>
        `;

        Modal.show({
            title: 'Chỉnh sửa Hồ sơ Khách hàng',
            contentHTML: contentHTML,
            confirmText: 'Lưu thay đổi',
            onConfirm: async () => {
                const form = document.getElementById('detail-edit-cust-form');
                if (!form.reportValidity()) return false;

                const formData = new FormData(form);
                const updated = {
                    full_name: formData.get('fullName').trim(),
                    phone: formData.get('phone').trim(),
                    segment: formData.get('segment'),
                    address: formData.get('address').trim() || null
                };

                showToast('Đang cập nhật hồ sơ...', 'info', 800);

                if (!window.supabaseClient) {
                    this.customer = { ...this.customer, ...updated };
                    this.renderProfile();
                    showToast('Đã cập nhật hồ sơ thành công (Offline Mode)!', 'success');
                    return true;
                }

                try {
                    const { error } = await window.supabaseClient
                        .from('customers')
                        .update(updated)
                        .eq('id', this.customerId);

                    if (error) throw error;

                    this.customer = { ...this.customer, ...updated };
                    this.renderProfile();
                    showToast('Cập nhật hồ sơ thành công!', 'success');
                    return true;
                } catch (e) {
                    console.error(e);
                    showToast('Lỗi cập nhật RLS: ' + e.message, 'error');
                    return false;
                }
            }
        });
    }
};

window.CustomerDetailModule = CustomerDetailModule;
