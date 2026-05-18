// payments.js - Quản lý thu chi dòng tiền (Payments), ghi nhận hóa đơn mới và vẽ biểu đồ dòng tiền trực quan

const PaymentModule = {
    payments: [],
    filteredPayments: [],
    customers: [],
    opportunities: [],
    
    // Pagination
    currentPage: 1,
    itemsPerPage: 5,

    async init() {
        showToast('Đang tải danh sách thanh toán...', 'info', 1000);

        // Bind events
        this.bindEvents();

        // Load dependencies
        await this.fetchCustomers();
        await this.fetchOpportunities();
        await this.fetchPayments();
    },

    bindEvents() {
        const addBtn = document.querySelector('main button[class*="bg-primary-container"]');
        if (addBtn) {
            addBtn.onclick = () => this.showAddPaymentPanel();
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

    async fetchOpportunities() {
        if (!window.supabaseClient) {
            this.opportunities = [
                { id: '101', customer_id: '4', title: 'Trị nám & Chăm sóc da Masan' },
                { id: '102', customer_id: '3', title: 'Giảm béo Ultra Slim FPT' },
                { id: '103', customer_id: '6', title: 'Ultherapy PwC' },
                { id: '104', customer_id: '1', title: 'Liệu trình trẻ hóa Thermage Vingroup' },
                { id: '105', customer_id: '5', title: 'Tắm trắng Collagen 4D VNA' },
                { id: '106', customer_id: '2', title: 'Meso Căng bóng VIP' }
            ];
            return;
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('opportunities')
                .select('id, customer_id, title');
            if (error) throw error;
            this.opportunities = data || [];
        } catch (e) {
            console.error('Fetch opportunities error:', e.message);
        }
    },

    async fetchPayments() {
        if (!window.supabaseClient) {
            // Mock Offline Payments
            this.payments = [
                { id: 'p1', customer_id: '2', opportunity_id: '106', amount: 25000000, method: 'transfer', status: 'completed', payment_date: new Date().toISOString(), notes: 'Thanh toán đợt 1 Hifu' },
                { id: 'p2', customer_id: '5', opportunity_id: '105', amount: 42000000, method: 'transfer', status: 'pending', payment_date: new Date(Date.now() - 3600000).toISOString(), notes: 'Chờ xác nhận từ ngân hàng' },
                { id: 'p3', customer_id: '1', opportunity_id: '104', amount: 15500000, method: 'cash', status: 'completed', payment_date: new Date(Date.now() - 86400000).toISOString(), notes: 'Đóng tiền mặt trực tiếp' },
                { id: 'p4', customer_id: '6', opportunity_id: '103', amount: 32000000, method: 'card', status: 'completed', payment_date: new Date(Date.now() - 86400000 * 2).toISOString(), notes: 'Quẹt thẻ Visa tại quầy' }
            ];
            this.filteredPayments = [...this.payments];
            this.updateOverview();
            this.renderTable();
            return;
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('payments')
                .select('*')
                .order('payment_date', { ascending: false });

            if (error) throw error;
            this.payments = data || [];
            this.filteredPayments = [...this.payments];
            this.updateOverview();
            this.renderTable();
        } catch (e) {
            console.error('Fetch payments error:', e.message);
            showToast('Lỗi tải lịch sử giao dịch: ' + e.message, 'error');
        }
    },

    updateOverview() {
        // Tính toán các metric
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const currentMonthPayments = this.payments.filter(p => new Date(p.payment_date) >= startOfThisMonth);
        const totalThisMonth = currentMonthPayments.reduce((sum, p) => sum + (p.status === 'completed' ? parseFloat(p.amount) : 0), 0);
        
        const totalCollected = this.payments.reduce((sum, p) => sum + (p.status === 'completed' ? parseFloat(p.amount) : 0), 0);
        const totalPending = this.payments.reduce((sum, p) => sum + (p.status === 'pending' ? parseFloat(p.amount) : 0), 0);

        // Cập nhật các ô Bento Card
        const spans = document.querySelectorAll('.glass-card span.text-3xl');
        if (spans.length >= 3) {
            spans[0].textContent = new Intl.NumberFormat('vi-VN').format(totalThisMonth);
            spans[1].textContent = new Intl.NumberFormat('vi-VN').format(totalCollected);
            spans[2].textContent = new Intl.NumberFormat('vi-VN').format(totalPending);
        }

        // Cập nhật progress bar
        const progressBar = document.querySelector('.glass-card .bg-status-success');
        const progressPercent = totalCollected + totalPending > 0 ? Math.round((totalCollected / (totalCollected + totalPending)) * 100) : 100;
        if (progressBar) {
            progressBar.style.width = `${progressPercent}%`;
            const progressDesc = progressBar.closest('.glass-card').querySelector('p.text-secondary');
            if (progressDesc) {
                progressDesc.textContent = `Thu hồi đạt ${progressPercent}% dòng tiền hóa đơn`;
            }
        }
    },

    renderTable() {
        const tbody = document.querySelector('table tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.filteredPayments.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-12 text-center text-secondary text-body-md">
                        Chưa ghi nhận giao dịch nào.
                    </td>
                </tr>
            `;
            this.renderPagination(0);
            return;
        }

        const totalItems = this.filteredPayments.length;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedData = this.filteredPayments.slice(startIndex, startIndex + this.itemsPerPage);

        paginatedData.forEach(p => {
            const customer = this.customers.find(c => c.id === p.customer_id) || { full_name: 'Khách vãng lai' };
            const opportunity = this.opportunities.find(o => o.id === p.opportunity_id) || { title: 'Thanh toán ngoài gói' };
            const initials = customer.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            let statusBadge = '';
            if (p.status === 'completed') {
                statusBadge = `
                    <span class="px-3 py-1 bg-status-success/10 text-status-success rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                        <span class="w-1.5 h-1.5 rounded-full bg-status-success"></span>
                        Hoàn thành
                    </span>
                `;
            } else if (p.status === 'pending') {
                statusBadge = `
                    <span class="px-3 py-1 bg-status-info/10 text-status-info rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                        <span class="w-1.5 h-1.5 rounded-full bg-status-info"></span>
                        Chờ xử lý
                    </span>
                `;
            } else {
                statusBadge = `
                    <span class="px-3 py-1 bg-status-error/10 text-status-error rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                        <span class="w-1.5 h-1.5 rounded-full bg-status-error"></span>
                        Đã hủy
                    </span>
                `;
            }

            const tr = document.createElement('tr');
            tr.className = 'hover:bg-subtle-grey transition-colors';
            tr.innerHTML = `
                <td class="px-6 py-5">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 bg-[#EC7700]/20 text-[#EC7700] rounded-full flex items-center justify-center font-bold text-sm">
                            ${initials}
                        </div>
                        <div>
                            <p class="font-body-md font-bold text-on-surface">${customer.full_name}</p>
                            <p class="text-xs text-secondary">Mã GD: #TX-${p.id.substring(0, 6).toUpperCase()}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-5 text-body-md text-on-surface">${opportunity.title}</td>
                <td class="px-6 py-5 font-bold text-[#EC7700]">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.amount || 0)}</td>
                <td class="px-6 py-5">${statusBadge}</td>
                <td class="px-6 py-5 text-body-sm text-secondary">${new Date(p.payment_date).toLocaleString('vi-VN')}</td>
                <td class="px-6 py-5">
                    <button class="w-8 h-8 rounded-full hover:bg-subtle-grey flex items-center justify-center text-secondary" onclick="PaymentModule.showPaymentMenu('${p.id}', event)">
                        <span class="material-symbols-outlined">more_vert</span>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        this.renderPagination(totalItems);
    },

    renderPagination(totalItems) {
        const pagContainer = document.querySelector('.p-6.bg-subtle-grey\\/30.border-t');
        if (!pagContainer) return;

        if (totalItems === 0) {
            pagContainer.innerHTML = '';
            return;
        }

        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, totalItems);

        let pagesHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                pagesHTML += `<button class="w-10 h-10 bg-[#EC7700] text-white rounded-lg flex items-center justify-center font-bold">${i}</button>`;
            } else {
                pagesHTML += `<button class="w-10 h-10 border border-outline-variant rounded-lg flex items-center justify-center hover:bg-white transition-colors" onclick="PaymentModule.setPage(${i})">${i}</button>`;
            }
        }

        pagContainer.innerHTML = `
            <p class="text-body-sm text-secondary">Hiển thị <span class="font-bold text-on-surface">${startItem}-${endItem}</span> trên tổng số <span class="font-bold text-on-surface">${totalItems}</span> giao dịch</p>
            <div class="flex gap-2">
                <button class="w-10 h-10 border border-outline-variant rounded-lg flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30" ${this.currentPage === 1 ? 'disabled' : ''} onclick="PaymentModule.setPage(${this.currentPage - 1})">
                    <span class="material-symbols-outlined">chevron_left</span>
                </button>
                ${pagesHTML}
                <button class="w-10 h-10 border border-outline-variant rounded-lg flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="PaymentModule.setPage(${this.currentPage + 1})">
                    <span class="material-symbols-outlined">chevron_right</span>
                </button>
            </div>
        `;
    },

    setPage(page) {
        this.currentPage = page;
        this.renderTable();
    },

    showAddPaymentPanel() {
        let customerOptions = '';
        this.customers.forEach(c => {
            customerOptions += `<option value="${c.id}">${c.full_name} (${c.company || 'Cá nhân'})</option>`;
        });

        let opportunityOptions = '<option value="">Thanh toán ngoài gói (không có cơ hội)</option>';
        this.opportunities.forEach(o => {
            opportunityOptions += `<option value="${o.id}">${o.title}</option>`;
        });

        const contentHTML = `
            <form id="add-payment-form" class="space-y-5">
                <div class="flex flex-col gap-2">
                    <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Khách hàng *</label>
                    <select name="customerId" required class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md">
                        ${customerOptions}
                    </select>
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Cơ hội bán hàng / Dịch vụ</label>
                    <select name="opportunityId" class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md">
                        ${opportunityOptions}
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Số tiền nhận (VND) *</label>
                        <input name="amount" required class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md" type="number" placeholder="15000000" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Phương thức</label>
                        <select name="method" class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md">
                            <option value="transfer">Chuyển khoản ngân hàng</option>
                            <option value="cash">Tiền mặt</option>
                            <option value="card">Thẻ (Visa/Mastercard)</option>
                        </select>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Trạng thái giao dịch</label>
                        <select name="status" class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md">
                            <option value="completed">Đã hoàn thành</option>
                            <option value="pending">Chờ xác nhận (Tạm giữ)</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Ngày giao dịch *</label>
                        <input name="paymentDate" required class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md" type="datetime-local" />
                    </div>
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Ghi chú thanh toán</label>
                    <textarea name="notes" rows="3" class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md" placeholder="Nội dung chuyển khoản hoặc số phiếu thu..."></textarea>
                </div>
            </form>
        `;

        SlideOver.show({
            title: 'Ghi nhận giao dịch Thanh toán',
            contentHTML: contentHTML,
            saveText: 'Lưu giao dịch',
            onSave: async () => {
                const form = document.getElementById('add-payment-form');
                if (!form.reportValidity()) return false;

                const formData = new FormData(form);
                const newPayment = {
                    customer_id: formData.get('customerId'),
                    opportunity_id: formData.get('opportunityId') || null,
                    amount: parseFloat(formData.get('amount')),
                    method: formData.get('method'),
                    status: formData.get('status'),
                    payment_date: formData.get('paymentDate') ? new Date(formData.get('paymentDate')).toISOString() : new Date().toISOString(),
                    notes: formData.get('notes').trim() || null
                };

                return await this.savePayment(newPayment);
            }
        });
    },

    async savePayment(paymentData) {
        if (!window.supabaseClient) {
            const mockId = Date.now().toString();
            const saved = { id: mockId, ...paymentData };
            this.payments.unshift(saved);
            this.filteredPayments = [...this.payments];
            this.updateOverview();
            this.renderTable();
            showToast('Ghi nhận thanh toán thành công (Offline Mode)', 'success');
            return true;
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('payments')
                .insert([paymentData])
                .select()
                .single();

            if (error) throw error;

            this.payments.unshift(data);
            this.filteredPayments = [...this.payments];
            this.updateOverview();
            this.renderTable();
            showToast('Ghi nhận giao dịch thanh toán thành công!', 'success');
            return true;
        } catch (e) {
            console.error('Save payment error:', e.message);
            showToast('Lỗi lưu giao dịch: ' + e.message, 'error');
            return false;
        }
    },

    showPaymentMenu(id, event) {
        event.stopPropagation();
        const payment = this.payments.find(p => p.id === id);
        if (!payment) return;

        const contentHTML = `
            <div class="space-y-4">
                <button class="w-full text-left px-4 py-3 hover:bg-subtle-grey rounded-xl transition-all flex items-center gap-3 text-on-surface" onclick="Modal.close(); PaymentModule.showPaymentDetail('${id}')">
                    <span class="material-symbols-outlined text-secondary">visibility</span>
                    <span>Chi tiết giao dịch</span>
                </button>
                <button class="w-full text-left px-4 py-3 hover:bg-subtle-grey rounded-xl transition-all flex items-center gap-3 text-status-error" onclick="Modal.close(); PaymentModule.confirmDelete('${id}')">
                    <span class="material-symbols-outlined">delete</span>
                    <span>Xóa giao dịch này</span>
                </button>
            </div>
        `;

        Modal.show({
            title: 'Lựa chọn thao tác hóa đơn',
            contentHTML: contentHTML,
            confirmText: 'Đóng',
            onConfirm: () => true
        });
    },

    showPaymentDetail(id) {
        const payment = this.payments.find(p => p.id === id);
        if (!payment) return;

        const customer = this.customers.find(c => c.id === payment.customer_id) || { full_name: 'Khách vãng lai' };
        const opportunity = this.opportunities.find(o => o.id === payment.opportunity_id) || { title: 'Thanh toán ngoài gói' };

        const contentHTML = `
            <div class="space-y-4">
                <div>
                    <span class="text-xs uppercase tracking-wider text-secondary font-bold">Khách hàng thanh toán</span>
                    <p class="text-body-md font-bold text-on-surface mt-1">${customer.full_name}</p>
                </div>
                <div>
                    <span class="text-xs uppercase tracking-wider text-secondary font-bold">Gói dịch vụ liên kết</span>
                    <p class="text-body-sm text-secondary mt-1">${opportunity.title}</p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <span class="text-xs uppercase tracking-wider text-secondary font-bold">Số tiền</span>
                        <p class="text-body-lg font-bold text-[#EC7700] mt-1">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payment.amount || 0)}</p>
                    </div>
                    <div>
                        <span class="text-xs uppercase tracking-wider text-secondary font-bold">Phương thức</span>
                        <p class="text-body-sm font-bold text-on-surface mt-1 uppercase">${payment.method}</p>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <span class="text-xs uppercase tracking-wider text-secondary font-bold">Trạng thái</span>
                        <p class="text-body-sm font-bold text-on-surface mt-1 uppercase">${payment.status}</p>
                    </div>
                    <div>
                        <span class="text-xs uppercase tracking-wider text-secondary font-bold">Thời gian GD</span>
                        <p class="text-body-sm font-bold text-secondary mt-1">${new Date(payment.payment_date).toLocaleString('vi-VN')}</p>
                    </div>
                </div>
                <div>
                    <span class="text-xs uppercase tracking-wider text-secondary font-bold">Ghi chú giao dịch</span>
                    <p class="text-body-sm text-secondary mt-1 whitespace-pre-line">${payment.notes || 'Không có ghi chú.'}</p>
                </div>
            </div>
        `;

        Modal.show({
            title: 'Chi tiết biên lai giao dịch',
            contentHTML: contentHTML,
            confirmText: 'Đóng',
            onConfirm: () => true
        });
    },

    confirmDelete(id) {
        Modal.show({
            title: 'Xác nhận xóa giao dịch',
            contentHTML: '<p>Bạn có chắc chắn muốn xóa giao dịch thanh toán này khỏi sổ cái?</p>',
            confirmText: 'Xác nhận xóa',
            onConfirm: async () => {
                if (!window.supabaseClient) {
                    this.payments = this.payments.filter(p => p.id !== id);
                    this.filteredPayments = [...this.payments];
                    this.updateOverview();
                    this.renderTable();
                    showToast('Đã xóa giao dịch (Offline Mode)', 'success');
                    return true;
                }

                try {
                    const { error } = await window.supabaseClient
                        .from('payments')
                        .delete()
                        .eq('id', id);

                    if (error) throw error;

                    this.payments = this.payments.filter(p => p.id !== id);
                    this.filteredPayments = [...this.payments];
                    this.updateOverview();
                    this.renderTable();
                    showToast('Xóa giao dịch thành công!', 'success');
                    return true;
                } catch (e) {
                    console.error('Delete payment error:', e.message);
                    showToast('Lỗi xóa giao dịch: ' + e.message, 'error');
                    return false;
                }
            }
        });
    }
};

window.PaymentModule = PaymentModule;
