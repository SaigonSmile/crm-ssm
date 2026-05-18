// customers.js - Xử lý hiển thị, bộ lọc, tìm kiếm, phân trang và CRUD hồ sơ Khách hàng (Customers)

const CustomerModule = {
    customers: [],
    filteredCustomers: [],
    employees: [],
    
    // Pagination state
    currentPage: 1,
    itemsPerPage: 8,

    async init() {
        showToast('Đang tải danh sách khách hàng...', 'info', 1000);
        
        // 1. Gắn các event handlers vào UI
        this.bindEvents();

        // 2. Fetch danh sách nhân viên để gán người phụ trách
        await this.fetchEmployees();

        // 3. Fetch dữ liệu khách hàng thực tế
        await this.fetchCustomers();
    },

    bindEvents() {
        // Search Input
        const searchInput = document.getElementById('customer-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentPage = 1;
                this.applyFilters(e.target.value.trim());
            });
        }

        // Segment Select Filter
        const segmentFilter = document.getElementById('customer-segment-filter');
        if (segmentFilter) {
            segmentFilter.addEventListener('change', () => {
                this.currentPage = 1;
                this.applyFilters();
            });
        }

        // Interest Select Filter
        const interestFilter = document.getElementById('customer-interest-filter');
        if (interestFilter) {
            interestFilter.addEventListener('change', () => {
                this.currentPage = 1;
                this.applyFilters();
            });
        }

        // Add Customer Button
        const addBtn = document.getElementById('add-customer-btn');
        if (addBtn) {
            addBtn.onclick = () => this.showAddCustomerPanel();
        }

        // Export CSV Button
        const exportBtn = document.getElementById('export-csv-btn');
        if (exportBtn) {
            exportBtn.onclick = () => {
                if (typeof CSVEngine !== 'undefined') {
                    CSVEngine.export(this.filteredCustomers);
                } else {
                    showToast('Động cơ CSV chưa được nạp!', 'error');
                }
            };
        }

        // Import CSV Button
        const importBtn = document.getElementById('import-csv-btn');
        if (importBtn) {
            importBtn.onclick = () => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = '.csv';
                fileInput.onchange = async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    showToast('Đang phân tích file CSV...', 'info', 1000);
                    try {
                        if (typeof CSVEngine !== 'undefined') {
                            const importedRecords = await CSVEngine.import(file);
                            if (importedRecords.length === 0) {
                                showToast('Không tìm thấy dòng hợp lệ nào trong file CSV!', 'warning');
                                return;
                            }

                            showToast(`Đang nhập ${importedRecords.length} khách hàng...`, 'info', 1000);
                            let successCount = 0;
                            for (const rec of importedRecords) {
                                const success = await this.saveCustomer({
                                    full_name: rec.full_name,
                                    phone: rec.phone,
                                    email: rec.email || null,
                                    segment: rec.segment || 'Khách mới',
                                    address: rec.address || null,
                                    interest: rec.interest || []
                                });
                                if (success) successCount++;
                            }
                            showToast(`Đã nhập thành công ${successCount}/${importedRecords.length} khách hàng!`, 'success');
                        } else {
                            showToast('Động cơ CSV chưa được nạp!', 'error');
                        }
                    } catch (err) {
                        showToast('Lỗi nhập CSV: ' + err.message, 'error');
                    }
                };
                fileInput.click();
            };
        }
    },

    async fetchEmployees() {
        if (!window.supabaseClient) {
            this.employees = [
                { id: '1', full_name: 'Mai Linh', role: 'sales' },
                { id: '2', full_name: 'Quốc Bảo', role: 'sales' },
                { id: '3', full_name: 'Thu Hà', role: 'sales' }
            ];
            return;
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('profiles')
                .select('id, full_name, role');
            if (error) throw error;
            this.employees = data || [];
        } catch (e) {
            console.error('Fetch employees error:', e.message);
        }
    },

    async fetchCustomers() {
        if (!window.supabaseClient) {
            // Chế độ Offline Dev - Đọc dữ liệu tĩnh
            this.customers = [
                { id: '1', full_name: 'Nguyễn Thị Lan Anh', phone: '0912345678', email: 'lananh.nguyen@gmail.com', company: 'Vietcombank H.O', segment: 'VIP Gold', interest: ['Trẻ hóa da'], created_at: '2023-05-12', created_by: '1' },
                { id: '2', full_name: 'Lê Văn Hoàng', phone: '0988111222', email: 'hoang.le@vinhomes.vn', company: 'Vinhomes Group', segment: 'Tiềm năng', interest: ['Giảm béo'], created_at: '2023-05-15', created_by: '2' },
                { id: '3', full_name: 'Phạm Thu Trang', phone: '0903999888', email: 'trang.pham@shopee.com', company: 'Shopee Vietnam', segment: 'VIP Silver', interest: ['Tắm trắng'], created_at: '2023-05-20', created_by: '3' },
                { id: '4', full_name: 'Đặng Minh Hùng', phone: '0913444555', email: 'hung.dang@techcombank.com', company: 'Techcombank', segment: 'Tiềm năng', interest: ['Trị nám'], created_at: '2023-05-22', created_by: '1' },
                { id: '5', full_name: 'Vũ Kim Chi', phone: '0933222111', email: 'chi.vu@lifestyle.vn', company: 'Freelancer', segment: 'VIP Gold', interest: ['Trị nám'], created_at: '2023-05-25', created_by: '3' },
                { id: '6', full_name: 'Hoàng Quốc Bảo', phone: '0944666777', email: 'bao.hoang@pwc.com', company: 'PwC Vietnam', segment: 'VIP Silver', interest: ['Trẻ hóa da'], created_at: '2023-05-30', created_by: '2' }
            ];
            this.applyFilters();
            return;
        }

        try {
            // RLS của Supabase sẽ tự động lọc chỉ trả về những hàng User được phép xem!
            const { data, error } = await window.supabaseClient
                .from('customers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            this.customers = data || [];
            this.applyFilters();
        } catch (e) {
            console.error('Fetch customers error:', e.message);
            showToast('Không tải được danh sách từ server: ' + e.message, 'error');
        }
    },

    applyFilters(searchVal = null) {
        if (searchVal === null) {
            searchVal = document.getElementById('customer-search-input')?.value.trim() || '';
        }
        searchVal = searchVal.toLowerCase();

        const segmentVal = document.getElementById('customer-segment-filter')?.value || 'Phân khúc: Tất cả';
        const interestVal = document.getElementById('customer-interest-filter')?.value || 'Sản phẩm: Tất cả';

        this.filteredCustomers = this.customers.filter(c => {
            // 1. Search filter
            const matchSearch = !searchVal || 
                (c.full_name && c.full_name.toLowerCase().includes(searchVal)) ||
                (c.phone && c.phone.includes(searchVal)) ||
                (c.email && c.email.toLowerCase().includes(searchVal));

            // 2. Segment filter
            const matchSegment = segmentVal === 'Phân khúc: Tất cả' || c.segment === segmentVal;

            // 3. Interest filter
            const matchInterest = interestVal === 'Sản phẩm: Tất cả' || 
                (c.interest && c.interest.some(i => i.toLowerCase().includes(interestVal.toLowerCase())));

            return matchSearch && matchSegment && matchInterest;
        });

        this.renderTable();
    },

    renderTable() {
        const tbody = document.getElementById('customer-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.filteredCustomers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="px-6 py-12 text-center text-secondary text-body-md">
                        Không tìm thấy khách hàng nào khớp bộ lọc.
                    </td>
                </tr>
            `;
            this.renderPagination(0);
            return;
        }

        // Tính phân trang
        const totalItems = this.filteredCustomers.length;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedData = this.filteredCustomers.slice(startIndex, startIndex + this.itemsPerPage);

        paginatedData.forEach(c => {
            // Lấy initials tên
            const initials = c.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            
            // Tìm nhân viên phụ trách/tạo
            const creator = this.employees.find(e => e.id === c.created_by) || { full_name: 'Chưa gán', initials: 'CG' };
            const creatorInitials = creator.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            // Định dạng Segment style
            let segmentBadge = 'bg-subtle-grey text-secondary';
            if (c.segment && c.segment.includes('VIP')) {
                segmentBadge = c.segment.includes('Gold') ? 'bg-[#EC7700]/10 text-[#EC7700]' : 'bg-secondary-container text-on-secondary-container';
            } else if (c.segment === 'Tiềm năng') {
                segmentBadge = 'bg-status-info/10 text-status-info';
            }

            const tr = document.createElement('tr');
            tr.className = 'hover:bg-subtle-grey transition-colors group';
            tr.innerHTML = `
                <td class="px-6 py-4"><input class="rounded border-outline-variant text-[#EC7700] focus:ring-[#EC7700]" type="checkbox"/></td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-[#EC7700]/20 text-[#EC7700] flex items-center justify-center font-bold text-sm">
                            ${initials}
                        </div>
                        <div>
                            <p class="font-body-md font-bold text-on-surface cursor-pointer hover:text-[#EC7700] transition-colors" onclick="CustomerModule.viewDetail('${c.id}')">${c.full_name}</p>
                            <p class="text-xs text-secondary">${c.email || 'Không có email'}</p>
                            <p class="text-xs text-secondary md:hidden">${c.phone}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 text-body-sm text-on-surface-variant">${c.company || '-'}</td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-[11px] font-bold ${segmentBadge} uppercase">${c.segment || 'Mới'}</span>
                </td>
                <td class="px-6 py-4 text-body-sm">${(c.interest || []).join(', ') || '-'}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-full bg-status-warning/20 flex items-center justify-center text-[10px] text-status-warning font-bold">${creatorInitials}</div>
                        <span class="text-body-sm">${creator.full_name}</span>
                    </div>
                </td>
                <td class="px-6 py-4 text-body-sm text-secondary">${new Date(c.created_at).toLocaleDateString('vi-VN')}</td>
                <td class="px-6 py-4 text-right">
                    <button class="text-secondary hover:text-primary transition-colors p-2" onclick="CustomerModule.showCustomerMenu('${c.id}', event)">
                        <span class="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        this.renderPagination(totalItems);
    },

    renderPagination(totalItems) {
        const pagContainer = document.getElementById('customer-pagination');
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
                pagesHTML += `<button class="w-8 h-8 flex items-center justify-center rounded-lg bg-[#EC7700] text-white font-button">${i}</button>`;
            } else {
                pagesHTML += `<button class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-subtle-grey text-on-surface font-button" onclick="CustomerModule.setPage(${i})">${i}</button>`;
            }
        }

        pagContainer.innerHTML = `
            <p class="text-body-sm text-secondary">Hiển thị <span class="font-bold text-on-surface">${startItem}-${endItem}</span> trên <span class="font-bold text-on-surface">${totalItems}</span> khách hàng</p>
            <div class="flex items-center gap-1">
                <button class="p-2 text-secondary hover:bg-subtle-grey rounded-lg disabled:opacity-30" ${this.currentPage === 1 ? 'disabled' : ''} onclick="CustomerModule.setPage(${this.currentPage - 1})">
                    <span class="material-symbols-outlined">chevron_left</span>
                </button>
                ${pagesHTML}
                <button class="p-2 text-secondary hover:bg-subtle-grey rounded-lg disabled:opacity-30" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="CustomerModule.setPage(${this.currentPage + 1})">
                    <span class="material-symbols-outlined">chevron_right</span>
                </button>
            </div>
        `;
    },

    setPage(page) {
        this.currentPage = page;
        this.renderTable();
    },

    // Hiển thị Panel trượt phải thêm khách hàng
    showAddCustomerPanel() {
        const contentHTML = `
            <form id="add-customer-form" class="space-y-5">
                <div class="flex flex-col gap-2">
                    <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Họ và tên *</label>
                    <input name="fullName" required class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md" type="text" placeholder="Nguyễn Thị A" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Số điện thoại *</label>
                    <input name="phone" required class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md" type="tel" placeholder="09xxxxxxx" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Email</label>
                    <input name="email" class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md" type="email" placeholder="email@gmail.com" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Giới tính</label>
                        <select name="gender" class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md">
                            <option value="female">Nữ</option>
                            <option value="male">Nam</option>
                            <option value="other">Khác</option>
                        </select>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Phân khúc</label>
                        <select name="segment" class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md">
                            <option value="Khách mới">Khách mới</option>
                            <option value="Tiềm năng">Tiềm năng</option>
                            <option value="VIP Gold">VIP Gold</option>
                            <option value="VIP Silver">VIP Silver</option>
                        </select>
                    </div>
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Công ty</label>
                    <input name="company" class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md" type="text" placeholder="Tên doanh nghiệp" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Sản phẩm quan tâm (Chọn nhiều, cách nhau bằng dấu phẩy)</label>
                    <input name="interests" class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md" type="text" placeholder="Trẻ hóa da, Meso căng bóng, Giảm béo" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold">Ghi chú</label>
                    <textarea name="notes" rows="3" class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-subtle-grey focus:ring-2 focus:ring-[#EC7700] focus:bg-white transition-all text-body-md" placeholder="Nhu cầu cụ thể hoặc lịch sử tư vấn..."></textarea>
                </div>
            </form>
        `;

        SlideOver.show({
            title: 'Thêm khách hàng mới',
            contentHTML: contentHTML,
            saveText: 'Tạo khách hàng',
            onSave: async () => {
                const form = document.getElementById('add-customer-form');
                if (!form.reportValidity()) return false;

                const formData = new FormData(form);
                const interestsArr = formData.get('interests')
                    ? formData.get('interests').split(',').map(i => i.trim()).filter(Boolean)
                    : [];

                const newCustomer = {
                    full_name: formData.get('fullName').trim(),
                    phone: formData.get('phone').trim(),
                    email: formData.get('email').trim() || null,
                    gender: formData.get('gender'),
                    segment: formData.get('segment'),
                    company: formData.get('company').trim() || null,
                    interest: interestsArr,
                    notes: formData.get('notes').trim() || null
                };

                return await this.saveCustomer(newCustomer);
            }
        });
    },

    async saveCustomer(customerData) {
        if (!window.supabaseClient) {
            // offline mode saving simulation
            const mockId = Date.now().toString();
            const savedData = { 
                id: mockId, 
                ...customerData, 
                created_at: new Date().toISOString(), 
                created_by: '1' 
            };
            this.customers.unshift(savedData);
            this.applyFilters();
            showToast('Tạo khách hàng thành công (Offline Mode)', 'success');
            return true;
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('customers')
                .insert([customerData])
                .select()
                .single();

            if (error) {
                if (error.code === '23505') {
                    showToast('Số điện thoại này đã tồn tại trong hệ thống!', 'error');
                    return false;
                }
                throw error;
            }

            this.customers.unshift(data);
            this.applyFilters();
            showToast('Đã thêm khách hàng thành công!', 'success');
            return true;
        } catch (e) {
            console.error('Save customer error:', e.message);
            showToast('Lỗi lưu khách hàng: ' + e.message, 'error');
            return false;
        }
    },

    async deleteCustomer(id) {
        if (!window.supabaseClient) {
            this.customers = this.customers.filter(c => c.id !== id);
            this.applyFilters();
            showToast('Đã xóa khách hàng thành công (Offline Mode)', 'success');
            return true;
        }

        try {
            const { error } = await window.supabaseClient
                .from('customers')
                .delete()
                .eq('id', id);

            if (error) throw error;
            
            this.customers = this.customers.filter(c => c.id !== id);
            this.applyFilters();
            showToast('Đã xóa khách hàng thành công!', 'success');
            return true;
        } catch (e) {
            console.error('Delete customer error:', e.message);
            showToast('Lỗi xóa khách hàng: ' + e.message, 'error');
            return false;
        }
    },

    // Xem hồ sơ khách hàng chi tiết hoặc các tùy chọn
    showCustomerMenu(id, event) {
        event.stopPropagation();
        const customer = this.customers.find(c => c.id === id);
        if (!customer) return;

        // Tạo menu tuỳ chọn đơn giản qua Modal
        const contentHTML = `
            <div class="space-y-4">
                <button class="w-full text-left px-4 py-3 hover:bg-subtle-grey rounded-xl transition-all flex items-center gap-3 text-on-surface" onclick="Modal.close(); CustomerModule.viewDetail('${id}')">
                    <span class="material-symbols-outlined text-secondary">visibility</span>
                    <span>Xem thông tin chi tiết / Hồ sơ bệnh án</span>
                </button>
                <button class="w-full text-left px-4 py-3 hover:bg-subtle-grey rounded-xl transition-all flex items-center gap-3 text-status-error" onclick="Modal.close(); CustomerModule.confirmDelete('${id}')">
                    <span class="material-symbols-outlined">delete</span>
                    <span>Xóa khách hàng khỏi hệ thống</span>
                </button>
            </div>
        `;

        Modal.show({
            title: `Lựa chọn thao tác: ${customer.full_name}`,
            contentHTML: contentHTML,
            confirmText: 'Đóng',
            cancelText: 'Hủy',
            onConfirm: () => true
        });
    },

    confirmDelete(id) {
        const customer = this.customers.find(c => c.id === id);
        if (!customer) return;

        Modal.show({
            title: 'Xác nhận xóa khách hàng',
            contentHTML: `<p>Bạn có chắc chắn muốn xóa khách hàng <strong>${customer.full_name}</strong>? Toàn bộ các cơ hội bán hàng và công việc liên quan sẽ bị xóa vĩnh viễn.</p>`,
            confirmText: 'Xác nhận xóa',
            onConfirm: () => this.deleteCustomer(id)
        });
    },

    viewDetail(id) {
        showToast('Đang chuyển tới hồ sơ chi tiết...', 'info', 800);
        setTimeout(() => {
            window.location.href = `customer-detail.html?id=${id}`;
        }, 600);
    }
};

window.CustomerModule = CustomerModule;
