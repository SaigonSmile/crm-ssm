// tasks.js - Xử lý CRUD nhiệm vụ (Tasks), thay đổi trạng thái hoàn thành nhanh qua Checkbox, và bộ lọc thông minh

const TaskModule = {
    tasks: [],
    filteredTasks: [],
    customers: [],
    employees: [],
    currentFilter: 'all', // all, today, overdue, done

    async init() {
        showToast('Đang tải danh sách nhiệm vụ...', 'info', 1000);

        // 1. Gắn sự kiện cho các bộ lọc tĩnh và nút thêm
        this.bindEvents();

        // 2. Fetch danh sách khách hàng và nhân viên
        await this.fetchCustomers();
        await this.fetchEmployees();

        // 3. Fetch danh sách nhiệm vụ thực tế
        await this.fetchTasks();
    },

    bindEvents() {
        // Nút thêm công việc
        const addBtn = document.querySelector('main button[class*="bg-[#EC7700]"]');
        if (addBtn) {
            addBtn.onclick = () => this.showAddTaskPanel();
        }

        // Bộ lọc danh mục
        const filterAll = document.getElementById('task-filter-all') || document.querySelector('button:contains("Tất cả")');
        const filterToday = document.getElementById('task-filter-today') || document.querySelector('button:contains("Hôm nay")');
        const filterOverdue = document.getElementById('task-filter-overdue') || document.querySelector('button:contains("Quá hạn")');
        const filterDone = document.getElementById('task-filter-done') || document.querySelector('button:contains("Đã hoàn thành")');

        const filterBtns = [
            { btn: filterAll, type: 'all' },
            { btn: filterToday, type: 'today' },
            { btn: filterOverdue, type: 'overdue' },
            { btn: filterDone, type: 'done' }
        ];

        filterBtns.forEach(item => {
            if (item.btn) {
                item.btn.onclick = () => {
                    // Update active class styles
                    filterBtns.forEach(x => {
                        if (x.btn) {
                            x.btn.className = "px-5 py-2 bg-white border border-outline-variant text-secondary hover:border-primary hover:text-primary rounded-full font-label-md text-label-md transition-all";
                        }
                    });
                    item.btn.className = "px-5 py-2 bg-primary text-white rounded-full font-label-md text-label-md shadow-sm";
                    
                    this.currentFilter = item.type;
                    this.applyFilters();
                };
            }
        });
    },

    async fetchCustomers() {
        if (!window.supabaseClient) {
            this.customers = [
                { id: '1', full_name: 'Nguyễn Thị Lan Anh' },
                { id: '2', full_name: 'Lê Văn Hoàng' },
                { id: '3', full_name: 'Phạm Thu Trang' },
                { id: '4', full_name: 'Đặng Minh Hùng' },
                { id: '5', full_name: 'Vũ Kim Chi' }
            ];
            return;
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('customers')
                .select('id, full_name');
            if (error) throw error;
            this.customers = data || [];
        } catch (e) {
            console.error('Fetch customers error:', e.message);
        }
    },

    async fetchEmployees() {
        if (!window.supabaseClient) {
            this.employees = [
                { id: '1', full_name: 'Mai Linh' },
                { id: '2', full_name: 'Quốc Bảo' },
                { id: '3', full_name: 'Thu Hà' }
            ];
            return;
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('profiles')
                .select('id, full_name');
            if (error) throw error;
            this.employees = data || [];
        } catch (e) {
            console.error('Fetch employees error:', e.message);
        }
    },

    async fetchTasks() {
        if (!window.supabaseClient) {
            // Mock Offline
            const now = new Date();
            const today15 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0, 0);
            const tomorrow9 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 30, 0);
            const pastDue = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 10, 0, 0);

            this.tasks = [
                { id: 't1', title: 'Gửi báo giá Combo Trẻ hóa da "Trân Quý" cho chị Lan Anh', customer_id: '1', priority: 'high', status: 'todo', due_date: today15.toISOString(), assigned_to: '1' },
                { id: 't2', title: 'Gọi xác nhận lịch tư vấn Giảm béo cho chị Trang', customer_id: '3', priority: 'medium', status: 'todo', due_date: tomorrow9.toISOString(), assigned_to: '2' },
                { id: 't3', title: 'Soạn hợp đồng Trẻ hóa da cho Vietcombank', customer_id: '2', priority: 'high', status: 'todo', due_date: tomorrow9.toISOString(), assigned_to: '3' },
                { id: 't4', title: 'Gửi thông tin liệu trình Trị nám mới cho anh Hùng qua Zalo', customer_id: '4', priority: 'low', status: 'done', due_date: pastDue.toISOString(), assigned_to: '1' },
                { id: 't5', title: 'Kiểm tra phản hồi sau buổi tắm trắng đầu tiên của chị Kim Chi', customer_id: '5', priority: 'medium', status: 'todo', due_date: today15.toISOString(), assigned_to: '2' }
            ];
            this.applyFilters();
            return;
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('tasks')
                .select('*')
                .order('due_date', { ascending: true });

            if (error) throw error;
            this.tasks = data || [];
            this.applyFilters();
        } catch (e) {
            console.error('Fetch tasks error:', e.message);
            showToast('Lỗi tải danh sách công việc: ' + e.message, 'error');
        }
    },

    applyFilters() {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        this.filteredTasks = this.tasks.filter(t => {
            const due = t.due_date ? new Date(t.due_date) : null;
            
            switch (this.currentFilter) {
                case 'today':
                    return t.status !== 'done' && due && due >= startOfToday && due <= endOfToday;
                case 'overdue':
                    return t.status !== 'done' && due && due < now;
                case 'done':
                    return t.status === 'done';
                case 'all':
                default:
                    return true;
            }
        });

        this.renderTable();
    },

    renderTable() {
        const tbody = document.getElementById('task-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.filteredTasks.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-12 text-center text-secondary text-body-md">
                        Không có nhiệm vụ nào thuộc danh mục này.
                    </td>
                </tr>
            `;
            this.renderStats();
            return;
        }

        this.filteredTasks.forEach(t => {
            const customer = this.customers.find(c => c.id === t.customer_id) || { full_name: 'Khách vãng lai' };
            const isCompleted = t.status === 'done';

            // Định dạng mức độ ưu tiên
            let priorityBadge = '';
            if (t.priority === 'high') {
                priorityBadge = '<span class="px-3 py-1 rounded-full bg-[#EF4444]/10 text-[#EF4444] font-label-md text-label-md font-bold">Cao</span>';
            } else if (t.priority === 'medium') {
                priorityBadge = '<span class="px-3 py-1 rounded-full bg-status-warning/10 text-status-warning font-label-md text-label-md font-bold">Trung bình</span>';
            } else {
                priorityBadge = '<span class="px-3 py-1 rounded-full bg-status-info/10 text-status-info font-label-md text-label-md font-bold">Thấp</span>';
            }

            // Định dạng do ngày đến hạn
            let dueHTML = '';
            if (t.due_date) {
                const due = new Date(t.due_date);
                const isOverdue = due < new Date() && !isCompleted;
                const dateStr = due.toLocaleDateString('vi-VN');
                const timeStr = due.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

                dueHTML = `
                    <div class="flex items-center gap-2 ${isOverdue ? 'text-[#EF4444] font-bold' : 'text-secondary'}">
                        <span class="material-symbols-outlined text-[18px]">${isOverdue ? 'error' : 'schedule'}</span>
                        <span class="font-body-sm text-body-sm">${timeStr} - ${dateStr}</span>
                    </div>
                `;
            } else {
                dueHTML = `<span class="text-secondary">-</span>`;
            }

            const tr = document.createElement('tr');
            tr.className = `task-row hover:bg-subtle-grey transition-colors ${isCompleted ? 'opacity-50' : ''}`;
            tr.innerHTML = `
                <td class="py-4 px-6 text-center">
                    <input class="w-5 h-5 rounded-full border-outline-variant text-[#EC7700] focus:ring-[#EC7700] focus:ring-offset-0 transition-all cursor-pointer" 
                        type="checkbox" ${isCompleted ? 'checked' : ''} onclick="TaskModule.toggleComplete('${t.id}', this)" />
                </td>
                <td class="py-4 px-4">
                    <p class="font-body-md text-body-md font-medium text-on-surface ${isCompleted ? 'line-through text-secondary' : ''}" onclick="TaskModule.showTaskDetail('${t.id}')">${t.title}</p>
                </td>
                <td class="py-4 px-4">
                    <div class="inline-flex items-center px-3 py-1 rounded-full bg-secondary-container/30 text-secondary font-label-md text-label-md">
                        ${customer.full_name}
                    </div>
                </td>
                <td class="py-4 px-4">${priorityBadge}</td>
                <td class="py-4 px-4">${dueHTML}</td>
                <td class="py-4 px-6 text-right">
                    <button class="text-secondary hover:text-primary transition-colors p-2" onclick="TaskModule.showTaskMenu('${t.id}', event)">
                        <span class="material-symbols-outlined">more_vert</span>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        this.renderStats();
    },

    renderStats() {
        const pag = document.getElementById('task-pagination');
        if (pag) {
            pag.innerHTML = `<span class="text-body-sm text-secondary italic">Danh sách gồm ${this.filteredTasks.length} công việc lọc</span>`;
        }
    },

    async toggleComplete(id, checkboxEl) {
        const isChecked = checkboxEl.checked;
        const newStatus = isChecked ? 'done' : 'todo';

        showToast(isChecked ? 'Đang hoàn thành công việc...' : 'Đang mở lại công việc...', 'info', 600);

        if (!window.supabaseClient) {
            const idx = this.tasks.findIndex(t => t.id === id);
            if (idx !== -1) {
                this.tasks[idx].status = newStatus;
                this.applyFilters();
                showToast(isChecked ? 'Chúc mừng bạn đã hoàn thành!' : 'Đã mở lại công việc', 'success');
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
            this.applyFilters();
            showToast(isChecked ? 'Hoàn thành công việc thành công!' : 'Đã hoàn thành mở lại công việc', 'success');
        } catch (e) {
            console.error('Toggle complete task error:', e.message);
            showToast('Lỗi cập nhật: ' + e.message, 'error');
            checkboxEl.checked = !isChecked; // Restore
        }
    },

    showAddTaskPanel() {
        let customerOptions = '<option value="">Cá nhân / Khách vãng lai</option>';
        this.customers.forEach(c => {
            customerOptions += `<option value="${c.id}">${c.full_name}</option>`;
        });

        let employeeOptions = '';
        this.employees.forEach(e => {
            employeeOptions += `<option value="${e.id}">${e.full_name}</option>`;
        });

        const contentHTML = `
            <form id="add-task-form" class="space-y-5">
                <div class="flex flex-col gap-2">
                    <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Tên công việc *</label>
                    <input name="title" required class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md" type="text" placeholder="Gọi tư vấn liệu trình nâng cơ..." />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Khách hàng liên quan</label>
                    <select name="customerId" class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md">
                        ${customerOptions}
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Mức độ ưu tiên</label>
                        <select name="priority" class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md">
                            <option value="medium">Trung bình</option>
                            <option value="high">Cao (Gấp)</option>
                            <option value="low">Thấp</option>
                        </select>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Thời hạn hoàn thành *</label>
                        <input name="dueDate" required class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md" type="datetime-local" />
                    </div>
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Người thực hiện</label>
                    <select name="assignedTo" class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md">
                        ${employeeOptions}
                    </select>
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Mô tả công việc chi tiết</label>
                    <textarea name="description" rows="3" class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md" placeholder="Cần tư vấn về công nghệ cao, giá đang giảm sâu..."></textarea>
                </div>
            </form>
        `;

        SlideOver.show({
            title: 'Tạo công việc chăm sóc mới',
            contentHTML: contentHTML,
            saveText: 'Tạo công việc',
            onSave: async () => {
                const form = document.getElementById('add-task-form');
                if (!form.reportValidity()) return false;

                const formData = new FormData(form);
                const newTask = {
                    title: formData.get('title').trim(),
                    customer_id: formData.get('customerId') || null,
                    priority: formData.get('priority'),
                    due_date: formData.get('dueDate') ? new Date(formData.get('dueDate')).toISOString() : null,
                    assigned_to: formData.get('assignedTo') || null,
                    description: formData.get('description').trim() || null,
                    status: 'todo'
                };

                return await this.saveTask(newTask);
            }
        });
    },

    async saveTask(taskData) {
        if (!window.supabaseClient) {
            const mockId = Date.now().toString();
            const saved = { id: mockId, ...taskData, created_at: new Date().toISOString() };
            this.tasks.unshift(saved);
            this.applyFilters();
            showToast('Tạo công việc chăm sóc thành công (Offline Mode)', 'success');
            return true;
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('tasks')
                .insert([taskData])
                .select()
                .single();

            if (error) throw error;

            this.tasks.unshift(data);
            this.applyFilters();
            showToast('Đã thêm công việc thành công!', 'success');
            return true;
        } catch (e) {
            console.error('Save task error:', e.message);
            showToast('Lỗi lưu công việc: ' + e.message, 'error');
            return false;
        }
    },

    showTaskMenu(id, event) {
        event.stopPropagation();
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        const contentHTML = `
            <div class="space-y-4">
                <button class="w-full text-left px-4 py-3 hover:bg-subtle-grey rounded-xl transition-all flex items-center gap-3 text-on-surface" onclick="Modal.close(); TaskModule.showTaskDetail('${id}')">
                    <span class="material-symbols-outlined text-secondary">visibility</span>
                    <span>Chi tiết công việc</span>
                </button>
                <button class="w-full text-left px-4 py-3 hover:bg-subtle-grey rounded-xl transition-all flex items-center gap-3 text-status-error" onclick="Modal.close(); TaskModule.confirmDelete('${id}')">
                    <span class="material-symbols-outlined">delete</span>
                    <span>Xóa công việc này</span>
                </button>
            </div>
        `;

        Modal.show({
            title: `Lựa chọn: ${task.title.substring(0, 30)}...`,
            contentHTML: contentHTML,
            confirmText: 'Đóng',
            onConfirm: () => true
        });
    },

    showTaskDetail(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        const customer = this.customers.find(c => c.id === task.customer_id) || { full_name: 'Khách vãng lai' };
        const assignee = this.employees.find(e => e.id === task.assigned_to) || { full_name: 'Chưa gán' };

        const contentHTML = `
            <div class="space-y-4">
                <div>
                    <span class="text-xs uppercase tracking-wider text-secondary font-bold">Khách hàng liên kết</span>
                    <p class="text-body-md font-bold text-on-surface mt-1">${customer.full_name}</p>
                </div>
                <div>
                    <span class="text-xs uppercase tracking-wider text-secondary font-bold">Nhiệm vụ chi tiết</span>
                    <p class="text-body-lg font-bold text-[#EC7700] mt-1">${task.title}</p>
                </div>
                <div>
                    <span class="text-xs uppercase tracking-wider text-secondary font-bold">Nội dung / Mô tả</span>
                    <p class="text-body-sm text-secondary mt-1 whitespace-pre-line">${task.description || 'Không có mô tả chi tiết.'}</p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <span class="text-xs uppercase tracking-wider text-secondary font-bold">Ưu tiên</span>
                        <p class="text-body-sm font-bold text-on-surface mt-1 uppercase">${task.priority}</p>
                    </div>
                    <div>
                        <span class="text-xs uppercase tracking-wider text-secondary font-bold">Thời hạn</span>
                        <p class="text-body-sm font-bold text-status-warning mt-1">${task.due_date ? new Date(task.due_date).toLocaleString('vi-VN') : '-'}</p>
                    </div>
                </div>
                <div>
                    <span class="text-xs uppercase tracking-wider text-secondary font-bold">Người thực hiện</span>
                    <p class="text-body-sm font-bold text-on-surface mt-1">${assignee.full_name}</p>
                </div>
            </div>
        `;

        Modal.show({
            title: 'Chi tiết Nhiệm vụ chăm sóc',
            contentHTML: contentHTML,
            confirmText: 'Đóng',
            onConfirm: () => true
        });
    },

    confirmDelete(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        Modal.show({
            title: 'Xác nhận xóa nhiệm vụ',
            contentHTML: `<p>Bạn có chắc chắn muốn xóa công việc: <strong>${task.title}</strong>?</p>`,
            confirmText: 'Xác nhận xóa',
            onConfirm: async () => {
                if (!window.supabaseClient) {
                    this.tasks = this.tasks.filter(t => t.id !== id);
                    this.applyFilters();
                    showToast('Đã xóa công việc (Offline Mode)', 'success');
                    return true;
                }

                try {
                    const { error } = await window.supabaseClient
                        .from('tasks')
                        .delete()
                        .eq('id', id);

                    if (error) throw error;

                    this.tasks = this.tasks.filter(t => t.id !== id);
                    this.applyFilters();
                    showToast('Xóa công việc thành công!', 'success');
                    return true;
                } catch (e) {
                    console.error('Delete task error:', e.message);
                    showToast('Lỗi xóa công việc: ' + e.message, 'error');
                    return false;
                }
            }
        });
    }
};

window.TaskModule = TaskModule;
