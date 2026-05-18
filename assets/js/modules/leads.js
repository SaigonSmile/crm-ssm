// leads.js - Xử lý Kanban, Click-to-change-stage, bộ lọc và CRUD cơ hội bán hàng (Opportunities)

const LeadModule = {
    leads: [],
    filteredLeads: [],
    customers: [],
    employees: [],

    stages: [
        { key: 'moi_nhan', label: 'Mới nhận', color: 'bg-status-info/10 text-status-info border-status-info' },
        { key: 'dang_lien_he', label: 'Đang liên hệ', color: 'bg-status-warning/10 text-status-warning border-status-warning' },
        { key: 'da_tu_van', label: 'Đã tư vấn', color: 'bg-primary-container/10 text-primary-container border-[#EC7700]' },
        { key: 'cho_dat_lich', label: 'Chờ đặt lịch', color: 'bg-secondary-container text-on-secondary-container border-secondary' },
        { key: 'da_dat_lich', label: 'Đã đặt lịch', color: 'bg-status-success/10 text-status-success border-status-success' },
        { key: 'thanh_cong', label: 'Thành công', color: 'bg-emerald-50 text-emerald-600 border-emerald-500' },
        { key: 'that_bai', label: 'Thất bại', color: 'bg-rose-50 text-rose-600 border-rose-500' }
    ],

    async init() {
        showToast('Đang tải cơ hội bán hàng...', 'info', 1000);

        // Bind events
        this.bindEvents();

        // Load dependencies
        await this.fetchCustomers();
        await this.fetchEmployees();
        await this.fetchLeads();
    },

    bindEvents() {
        // Add Lead Button
        const addBtn = document.getElementById('add-lead-btn');
        if (addBtn) {
            addBtn.onclick = () => this.showAddLeadPanel();
        }

        // Search/Filter Button
        const filterBtn = document.getElementById('filter-lead-btn');
        if (filterBtn) {
            filterBtn.onclick = () => this.showFilterModal();
        }
    },

    async fetchCustomers() {
        if (!window.supabaseClient) {
            this.customers = [
                { id: '1', full_name: 'Nguyễn Thị Lan Anh', company: 'Vietcombank H.O' },
                { id: '2', full_name: 'Lê Văn Hoàng', company: 'Vinhomes Group' },
                { id: '3', full_name: 'Phạm Thu Trang', company: 'Shopee Vietnam' },
                { id: '4', full_name: 'Đặng Minh Hùng', company: 'Techcombank' },
                { id: '5', full_name: 'Vũ Kim Chi', company: 'Freelancer' },
                { id: '6', full_name: 'Hoàng Quốc Bảo', company: 'PwC Vietnam' }
            ];
            return;
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('customers')
                .select('id, full_name, company');
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

    async fetchLeads() {
        if (!window.supabaseClient) {
            // Offline Mode Seed Data
            this.leads = [
                { id: '101', customer_id: '4', title: 'Trị nám & Chăm sóc da Masan', value: 15500000, stage: 'moi_nhan', created_by: '3' },
                { id: '102', customer_id: '3', title: 'Giảm béo Ultra Slim FPT', value: 22000000, stage: 'dang_lien_he', created_by: '1' },
                { id: '103', customer_id: '6', title: 'Ultherapy PwC', value: 28000000, stage: 'dang_lien_he', created_by: '2' },
                { id: '104', customer_id: '1', title: 'Liệu trình trẻ hóa Thermage Vingroup', value: 35000000, stage: 'da_tu_van', created_by: '1' },
                { id: '105', customer_id: '5', title: 'Tắm trắng Collagen 4D VNA', value: 42000000, stage: 'cho_dat_lich', created_by: '3' },
                { id: '106', customer_id: '2', title: 'Meso Căng bóng VIP', value: 120000000, stage: 'da_dat_lich', created_by: '2' }
            ];
            this.filteredLeads = [...this.leads];
            this.renderKanban();
            return;
        }

        try {
            // Supabase RLS will automatically apply
            const { data, error } = await window.supabaseClient
                .from('opportunities')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            this.leads = data || [];
            this.filteredLeads = [...this.leads];
            this.renderKanban();
        } catch (e) {
            console.error('Fetch opportunities error:', e.message);
            showToast('Lỗi tải cơ hội bán hàng: ' + e.message, 'error');
        }
    },

    renderKanban() {
        const board = document.getElementById('kanban-board-container');
        if (!board) return;

        board.innerHTML = '';

        this.stages.forEach(stage => {
            // Lọc leads thuộc Stage này
            const stageLeads = this.filteredLeads.filter(l => l.stage === stage.key);
            
            const column = document.createElement('div');
            column.className = 'w-[320px] bg-[#F8F8F8] rounded-[16px] flex flex-col p-4';
            
            // Header cột
            column.innerHTML = `
                <div class="flex items-center justify-between mb-4 px-1">
                    <h3 class="font-semibold text-secondary flex items-center gap-2">
                        ${stage.label}
                        <span class="bg-[#EC7700]/10 text-[#EC7700] text-[11px] px-2 py-0.5 rounded-full font-bold">${stageLeads.length}</span>
                    </h3>
                    <span class="material-symbols-outlined text-secondary/40 text-[20px] cursor-pointer" onclick="LeadModule.showColumnMenu('${stage.key}')">more_horiz</span>
                </div>
            `;

            // Body cột
            const cardList = document.createElement('div');
            cardList.className = 'space-y-4 flex-1 overflow-y-auto';

            if (stageLeads.length === 0) {
                cardList.innerHTML = `
                    <div class="h-24 border border-dashed border-outline-variant/30 rounded-xl flex items-center justify-center text-secondary/30 text-xs">
                        Kéo thả hoặc click đổi cột
                    </div>
                `;
            } else {
                stageLeads.forEach(l => {
                    const customer = this.customers.find(c => c.id === l.customer_id) || { full_name: 'Khách hàng ẩn', company: '-' };
                    const assignee = this.employees.find(e => e.id === l.created_by) || { full_name: 'Chưa gán' };
                    const assigneeInitials = assignee.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                    const card = document.createElement('div');
                    card.className = 'bg-white p-4 rounded-[20px] card-shadow border border-white/50 group cursor-pointer hover:border-[#EC7700]/30 transition-all relative';
                    card.onclick = () => this.showLeadDetailPanel(l.id);

                    card.innerHTML = `
                        <div class="flex justify-between items-start mb-3">
                            <span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${stage.color.split(' ')[0]} ${stage.color.split(' ')[1]}">
                                ${stage.label}
                            </span>
                            <button class="text-secondary/40 hover:text-primary transition-colors" onclick="LeadModule.showStageDropdown('${l.id}', event)">
                                <span class="material-symbols-outlined text-[18px]">swap_horiz</span>
                            </button>
                        </div>
                        <p class="font-semibold text-on-surface mb-1 group-hover:text-[#EC7700] transition-colors">${customer.full_name}</p>
                        <p class="text-body-sm text-secondary mb-3">${customer.company || '-'}</p>
                        <div class="flex items-center gap-2 text-[12px] text-on-surface-variant bg-surface-container-low p-2 rounded-lg mb-4">
                            <span class="material-symbols-outlined text-[16px] text-[#EC7700]">spa</span>
                            <span class="truncate">${l.title}</span>
                        </div>
                        <div class="flex justify-between items-center border-t border-outline-variant/20 pt-3">
                            <span class="text-[#EC7700] font-bold text-sm">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(l.value || 0)}</span>
                            <div class="w-6 h-6 rounded-full bg-status-warning/20 flex items-center justify-center text-[10px] text-status-warning font-bold" title="Người tạo: ${assignee.full_name}">
                                ${assigneeInitials}
                            </div>
                        </div>
                    `;
                    cardList.appendChild(card);
                });
            }

            column.appendChild(cardList);
            board.appendChild(column);
        });
    },

    // Cơ chế Click-to-change-stage cực kỳ mượt và vững chãi
    showStageDropdown(leadId, event) {
        event.stopPropagation();
        const lead = this.leads.find(l => l.id === leadId);
        if (!lead) return;

        let optionsHTML = '';
        this.stages.forEach(stg => {
            const isCurrent = stg.key === lead.stage;
            optionsHTML += `
                <button class="w-full text-left px-4 py-3 hover:bg-subtle-grey rounded-xl transition-all flex items-center justify-between text-body-md ${isCurrent ? 'font-bold text-[#EC7700] bg-[#EC7700]/5' : 'text-on-surface'}" 
                    onclick="Modal.close(); LeadModule.updateLeadStage('${leadId}', '${stg.key}')">
                    <span>${stg.label}</span>
                    ${isCurrent ? '<span class="material-symbols-outlined text-[#EC7700] text-[18px]">check</span>' : ''}
                </button>
            `;
        });

        Modal.show({
            title: `Chuyển trạng thái Cơ hội`,
            contentHTML: `<div class="space-y-1">${optionsHTML}</div>`,
            confirmText: 'Đóng',
            onConfirm: () => true
        });
    },

    async updateLeadStage(leadId, newStage) {
        showToast('Đang cập nhật trạng thái cơ hội...', 'info', 800);
        
        if (!window.supabaseClient) {
            const idx = this.leads.findIndex(l => l.id === leadId);
            if (idx !== -1) {
                this.leads[idx].stage = newStage;
                this.filteredLeads = [...this.leads];
                this.renderKanban();
                showToast('Đã chuyển trạng thái thành công (Offline Mode)', 'success');
            }
            return;
        }

        try {
            const { error } = await window.supabaseClient
                .from('opportunities')
                .update({ stage: newStage })
                .eq('id', leadId);

            if (error) throw error;

            const idx = this.leads.findIndex(l => l.id === leadId);
            if (idx !== -1) {
                this.leads[idx].stage = newStage;
            }
            this.filteredLeads = [...this.leads];
            this.renderKanban();
            showToast('Cập nhật trạng thái thành công!', 'success');
        } catch (e) {
            console.error('Update stage error:', e.message);
            showToast('Lỗi cập nhật trạng thái: ' + e.message, 'error');
        }
    },

    showAddLeadPanel() {
        if (this.customers.length === 0) {
            showToast('Vui lòng thêm khách hàng vào hệ thống trước khi tạo Cơ hội bán hàng!', 'warning');
            return;
        }

        let customerOptions = '';
        this.customers.forEach(c => {
            customerOptions += `<option value="${c.id}">${c.full_name} (${c.company || 'Cá nhân'})</option>`;
        });

        let employeeOptions = '';
        this.employees.forEach(e => {
            employeeOptions += `<option value="${e.id}">${e.full_name}</option>`;
        });

        const contentHTML = `
            <form id="add-lead-form" class="space-y-5">
                <div class="flex flex-col gap-2">
                    <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Khách hàng *</label>
                    <select name="customerId" required class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md">
                        ${customerOptions}
                    </select>
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Tên cơ hội / Gói dịch vụ quan tâm *</label>
                    <input name="title" required class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md" type="text" placeholder="Gói trẻ hóa da Thermage FLX" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Giá trị dự kiến (VND) *</label>
                        <input name="value" required class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md" type="number" placeholder="25000000" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Bước bán hàng</label>
                        <select name="stage" class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md">
                            ${this.stages.map(s => `<option value="${s.key}">${s.label}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Người phụ trách chuyên môn</label>
                    <select name="assigneeId" class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md">
                        ${employeeOptions}
                    </select>
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Ghi chú yêu cầu dịch vụ</label>
                    <textarea name="notes" rows="3" class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md" placeholder="Mong muốn cụ thể của khách hàng, da nhạy cảm..."></textarea>
                </div>
            </form>
        `;

        SlideOver.show({
            title: 'Tạo Cơ hội bán hàng mới',
            contentHTML: contentHTML,
            saveText: 'Tạo cơ hội',
            onSave: async () => {
                const form = document.getElementById('add-lead-form');
                if (!form.reportValidity()) return false;

                const formData = new FormData(form);
                const newLead = {
                    customer_id: formData.get('customerId'),
                    title: formData.get('title').trim(),
                    value: parseFloat(formData.get('value')),
                    stage: formData.get('stage'),
                    created_by: formData.get('assigneeId'),
                    notes: formData.get('notes').trim() || null
                };

                return await this.saveLead(newLead);
            }
        });
    },

    async saveLead(leadData) {
        if (!window.supabaseClient) {
            const mockId = Date.now().toString();
            const saved = { id: mockId, ...leadData, created_at: new Date().toISOString() };
            this.leads.unshift(saved);
            this.filteredLeads = [...this.leads];
            this.renderKanban();
            showToast('Tạo cơ hội bán hàng thành công (Offline Mode)', 'success');
            return true;
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('opportunities')
                .insert([leadData])
                .select()
                .single();

            if (error) throw error;

            this.leads.unshift(data);
            this.filteredLeads = [...this.leads];
            this.renderKanban();
            showToast('Đã thêm cơ hội bán hàng mới!', 'success');
            return true;
        } catch (e) {
            console.error('Save opportunity error:', e.message);
            showToast('Lỗi thêm cơ hội: ' + e.message, 'error');
            return false;
        }
    },

    showLeadDetailPanel(id) {
        const lead = this.leads.find(l => l.id === id);
        if (!lead) return;

        const customer = this.customers.find(c => c.id === lead.customer_id) || { full_name: 'Khách hàng ẩn' };
        
        // Show details in slideover
        const contentHTML = `
            <div class="space-y-6">
                <div class="bg-surface-container p-4 rounded-xl">
                    <p class="text-xs uppercase tracking-wider text-secondary font-bold">Khách hàng</p>
                    <p class="text-body-lg font-bold text-on-surface mt-1">${customer.full_name}</p>
                </div>
                <div class="bg-surface-container p-4 rounded-xl">
                    <p class="text-xs uppercase tracking-wider text-secondary font-bold">Tên cơ hội / Dịch vụ</p>
                    <p class="text-body-md font-bold text-[#EC7700] mt-1">${lead.title}</p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-surface-container p-4 rounded-xl">
                        <p class="text-xs uppercase tracking-wider text-secondary font-bold">Dự tính doanh thu</p>
                        <p class="text-body-lg font-bold text-[#EC7700] mt-1">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(lead.value || 0)}</p>
                    </div>
                    <div class="bg-surface-container p-4 rounded-xl">
                        <p class="text-xs uppercase tracking-wider text-secondary font-bold">Bước hiện tại</p>
                        <p class="text-body-md font-bold text-on-surface mt-1">${this.stages.find(s => s.key === lead.stage)?.label}</p>
                    </div>
                </div>
                <div class="bg-surface-container p-4 rounded-xl">
                    <p class="text-xs uppercase tracking-wider text-secondary font-bold">Ghi chú nội dung tư vấn</p>
                    <p class="text-body-sm text-secondary mt-1 whitespace-pre-line">${lead.notes || 'Không có ghi chú'}</p>
                </div>
                <div class="flex justify-between items-center gap-3 pt-6">
                    <button class="w-1/2 py-3 border border-outline-variant hover:bg-subtle-grey rounded-xl text-secondary text-sm font-bold transition-all" onclick="SlideOver.close(); LeadModule.confirmDelete('${id}')">Xóa cơ hội này</button>
                    <button class="w-1/2 py-3 bg-[#EC7700] text-white rounded-xl text-sm font-bold transition-all shadow-md" onclick="SlideOver.close(); LeadModule.showStageDropdown('${id}', event)">Đổi trạng thái</button>
                </div>
            </div>
        `;

        SlideOver.show({
            title: `Chi tiết cơ hội: ${customer.full_name}`,
            contentHTML: contentHTML,
            saveText: 'Đóng',
            onSave: () => true
        });
    },

    confirmDelete(id) {
        const lead = this.leads.find(l => l.id === id);
        if (!lead) return;

        Modal.show({
            title: 'Xác nhận xóa Cơ hội bán hàng',
            contentHTML: `<p>Bạn có chắc chắn muốn xóa cơ hội <strong>${lead.title}</strong>? Thao tác này không thể hoàn tác.</p>`,
            confirmText: 'Xác nhận xóa',
            onConfirm: async () => {
                if (!window.supabaseClient) {
                    this.leads = this.leads.filter(l => l.id !== id);
                    this.filteredLeads = [...this.leads];
                    this.renderKanban();
                    showToast('Đã xóa cơ hội thành công (Offline Mode)', 'success');
                    return true;
                }

                try {
                    const { error } = await window.supabaseClient
                        .from('opportunities')
                        .delete()
                        .eq('id', id);

                    if (error) throw error;

                    this.leads = this.leads.filter(l => l.id !== id);
                    this.filteredLeads = [...this.leads];
                    this.renderKanban();
                    showToast('Đã xóa cơ hội bán hàng thành công!', 'success');
                    return true;
                } catch (e) {
                    console.error('Delete lead error:', e.message);
                    showToast('Lỗi xóa cơ hội: ' + e.message, 'error');
                    return false;
                }
            }
        });
    },

    showFilterModal() {
        // Lọc cơ hội theo giá trị doanh số lớn/nhỏ
        const contentHTML = `
            <div class="space-y-4">
                <p class="text-body-sm text-secondary">Lọc cơ hội có giá trị tối thiểu:</p>
                <div class="flex gap-2">
                    <button class="flex-1 py-2 border border-outline-variant hover:bg-[#EC7700]/5 rounded-lg text-body-sm" onclick="Modal.close(); LeadModule.applyValueFilter(0)">Tất cả</button>
                    <button class="flex-1 py-2 border border-outline-variant hover:bg-[#EC7700]/5 rounded-lg text-body-sm" onclick="Modal.close(); LeadModule.applyValueFilter(20000000)">> 20 Triệu</button>
                    <button class="flex-1 py-2 border border-outline-variant hover:bg-[#EC7700]/5 rounded-lg text-body-sm" onclick="Modal.close(); LeadModule.applyValueFilter(50000000)">> 50 Triệu</button>
                </div>
            </div>
        `;

        Modal.show({
            title: 'Lọc nhanh Cơ hội bán hàng',
            contentHTML: contentHTML,
            confirmText: 'Đóng',
            onConfirm: () => true
        });
    },

    applyValueFilter(minValue) {
        this.filteredLeads = this.leads.filter(l => l.value >= minValue);
        this.renderKanban();
        showToast(`Đã lọc cơ hội lớn hơn ${new Intl.NumberFormat('vi-VN').format(minValue)} VND`, 'success');
    },

    showColumnMenu(stageKey) {
        showToast(`Tùy chọn cột: ${this.stages.find(s => s.key === stageKey)?.label}`, 'info');
    }
};

window.LeadModule = LeadModule;
