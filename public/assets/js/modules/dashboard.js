// dashboard.js - Xử lý tính toán KPIs động từ DB, vẽ SVG Chart tương tác động, lời chào cá nhân hóa và các công việc khẩn cấp

const DashboardModule = {
    async init() {
        showToast('Đang cập nhật Dashboard...', 'info', 800);

        // 1. Chào hỏi theo tên thật từ Session Profile
        this.personalizeGreeting();

        // 2. Fetch toàn bộ dữ liệu thống kê
        await this.loadDashboardData();
    },

    personalizeGreeting() {
        const greetingEl = document.querySelector('h2.font-headline-lg');
        if (!greetingEl) return;

        const userJson = localStorage.getItem('crm_user') || localStorage.getItem('crm_mock_user');
        if (userJson) {
            try {
                const user = JSON.parse(userJson);
                const fullName = user.full_name || 'Thành viên';
                
                // Get time of day to greet
                const hr = new Date().getHours();
                let welcome = 'Chào buổi sáng';
                if (hr >= 12 && hr < 18) welcome = 'Chào buổi chiều';
                else if (hr >= 18) welcome = 'Chào buổi tối';

                greetingEl.innerHTML = `${welcome}, <span class="text-[#EC7700]">${fullName}</span>`;
            } catch (e) {
                console.error(e);
            }
        }
    },

    async loadDashboardData() {
        let stats = {
            todayLeads: 12,
            confirmedAppointments: 8,
            expectedRevenue: 262500000,
            overdueTasks: 3,
            serviceDistribution: {
                'Giảm béo': 30,
                'Trẻ hóa da': 25,
                'Làm trắng': 20,
                'Trị nám': 15,
                'Khác': 10
            },
            weeklyTrend: [15, 22, 18, 30, 24, 35, 28],
            urgentTasks: []
        };

        if (window.supabaseClient) {
            try {
                const now = new Date();
                const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

                // 1. Leads mới hôm nay
                const { count: todayLeadsCount } = await window.supabaseClient
                    .from('opportunities')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', startOfToday);
                stats.todayLeads = todayLeadsCount || 0;

                // 2. Lịch hẹn đã xác nhận (stage: da_dat_lich)
                const { count: confirmedCount } = await window.supabaseClient
                    .from('opportunities')
                    .select('*', { count: 'exact', head: true })
                    .eq('stage', 'da_dat_lich');
                stats.confirmedAppointments = confirmedCount || 0;

                // 3. Doanh thu dự kiến (Tổng tiền các opportunities active)
                const { data: revData } = await window.supabaseClient
                    .from('opportunities')
                    .select('value')
                    .not('stage', 'in', '("thanh_cong","that_bai")');
                stats.expectedRevenue = (revData || []).reduce((acc, curr) => acc + (parseFloat(curr.value) || 0), 0);

                // 4. Công việc quá hạn
                const { count: overdueCount } = await window.supabaseClient
                    .from('tasks')
                    .select('*', { count: 'exact', head: true })
                    .lt('due_date', now.toISOString())
                    .neq('status', 'done');
                stats.overdueTasks = overdueCount || 0;

                // 5. Thống kê phân bổ sản phẩm từ khách hàng
                const { data: custData } = await window.supabaseClient
                    .from('customers')
                    .select('interest');
                
                const interestCounts = {};
                (custData || []).forEach(c => {
                    if (c.interest && Array.isArray(c.interest)) {
                        c.interest.forEach(interest => {
                            interestCounts[interest] = (interestCounts[interest] || 0) + 1;
                        });
                    }
                });

                const totalInterests = Object.values(interestCounts).reduce((a, b) => a + b, 0);
                if (totalInterests > 0) {
                    stats.serviceDistribution = {};
                    Object.entries(interestCounts).forEach(([key, val]) => {
                        stats.serviceDistribution[key] = Math.round((val / totalInterests) * 100);
                    });
                }

                // 6. Lấy 3 công việc khẩn cấp chưa hoàn thành
                const { data: urgentTasks } = await window.supabaseClient
                    .from('tasks')
                    .select('*, customers(full_name)')
                    .neq('status', 'done')
                    .order('due_date', { ascending: true })
                    .limit(3);
                stats.urgentTasks = urgentTasks || [];

            } catch (e) {
                console.error('Error fetching dashboard stats from database:', e.message);
            }
        } else {
            // Chế độ Offline: Tạo mock urgent tasks khớp danh sách task
            stats.urgentTasks = [
                { id: 't1', title: 'Gửi báo giá Combo Trẻ hóa da "Trân Quý" cho chị Lan Anh', due_date: new Date().toISOString(), priority: 'high', customer_name: 'Nguyễn Thị Lan Anh' },
                { id: 't2', title: 'Gọi xác nhận lịch tư vấn Giảm béo cho chị Trang', due_date: new Date(Date.now() + 86400000).toISOString(), priority: 'medium', customer_name: 'Phạm Thu Trang' },
                { id: 't5', title: 'Kiểm tra phản hồi sau buổi tắm trắng đầu tiên của chị Kim Chi', due_date: new Date().toISOString(), priority: 'medium', customer_name: 'Vũ Kim Chi' }
            ];
        }

        // Render toàn bộ UI
        this.renderKPIs(stats);
        this.renderCharts(stats);
        this.renderUrgentTasks(stats.urgentTasks);
    },

    renderKPIs(stats) {
        const cards = document.querySelectorAll('.glass-card h3');
        if (cards.length >= 4) {
            cards[0].textContent = stats.todayLeads;
            cards[1].textContent = stats.confirmedAppointments;
            cards[2].textContent = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.expectedRevenue);
            cards[3].textContent = stats.overdueTasks;
        }
    },

    renderCharts(stats) {
        // 1. Line Chart (Xu hướng Leads)
        // Tạo SVG path mượt dựa trên xu hướng
        const svgPath = document.querySelector('svg path[fill="none"]');
        const svgFill = document.querySelector('svg path[opacity="0.1"]');
        if (svgPath && svgFill) {
            const trend = stats.weeklyTrend;
            const width = 700;
            const height = 240;
            const maxVal = Math.max(...trend, 10);
            
            let points = [];
            trend.forEach((val, i) => {
                const x = (i / (trend.length - 1)) * width;
                const y = height - (val / maxVal) * height + 30; // offset top padding
                points.push(`${x},${y}`);
            });

            // Vẽ đường cong mượt Cubic Bezier
            let pathD = `M ${points[0]}`;
            for (let i = 1; i < points.length; i++) {
                const [prevX, prevY] = points[i-1].split(',').map(Number);
                const [currX, currY] = points[i].split(',').map(Number);
                const cpX1 = prevX + (currX - prevX) / 2;
                const cpY1 = prevY;
                const cpX2 = prevX + (currX - prevX) / 2;
                const cpY2 = currY;
                pathD += ` C ${cpX1},${cpY1} ${cpX2},${cpY2} ${currX},${currY}`;
            }

            svgPath.setAttribute('d', pathD);
            svgFill.setAttribute('d', `${pathD} V 300 H 0 Z`);
        }

        // 2. Donut Chart (Phân bổ dịch vụ)
        const donut = document.querySelector('svg.transform circle[stroke="#EC7700"]');
        const legendContainer = document.querySelector('.lg\\:col-span-4 .space-y-3');
        if (donut && legendContainer) {
            legendContainer.innerHTML = '';
            
            const entries = Object.entries(stats.serviceDistribution).slice(0, 5); // Tối đa 5 dịch vụ
            let accumulatedPercent = 0;

            // Xóa các circles cũ ngoại trừ circle nền
            const svgDonut = donut.closest('svg');
            const circles = svgDonut.querySelectorAll('circle');
            circles.forEach((c, idx) => {
                if (idx > 0) c.remove();
            });

            // Bảng màu rực rỡ cao cấp của Saigon Smile
            const colors = ['#EC7700', '#3B82F6', '#22C55E', '#F59E0B', '#6B7280'];

            entries.forEach(([service, pct], i) => {
                const color = colors[i] || '#6B7280';
                
                // Thêm donut circle phân mảnh
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', '18');
                circle.setAttribute('cy', '18');
                circle.setAttribute('r', '16');
                circle.setAttribute('fill', 'transparent');
                circle.setAttribute('stroke', color);
                circle.setAttribute('stroke-width', '4');
                circle.setAttribute('stroke-dasharray', `${pct} 100`);
                circle.setAttribute('stroke-dashoffset', `-${accumulatedPercent}`);
                svgDonut.appendChild(circle);

                accumulatedPercent += pct;

                // Thêm Legend
                legendContainer.innerHTML += `
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full" style="background-color: ${color}"></span>
                            <span class="text-sm text-secondary truncate max-w-[150px]">${service}</span>
                        </div>
                        <span class="text-sm font-bold">${pct}%</span>
                    </div>
                `;
            });
        }
    },

    renderUrgentTasks(tasks) {
        const container = document.querySelector('.glass-card .space-y-4');
        if (!container) return;

        container.innerHTML = '';

        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="p-6 text-center text-secondary text-body-sm">
                    Tuyệt vời! Hiện tại không có công việc khẩn cấp nào cần xử lý.
                </div>
            `;
            return;
        }

        tasks.forEach(t => {
            let custName = t.customer_name;
            if (t.customers) custName = t.customers.full_name;
            if (!custName) custName = 'Khách vãng lai';

            let priorityColor = 'text-status-warning';
            let priorityLabel = 'Trung bình';
            let badgeBg = 'bg-orange-50';
            let icon = 'priority_high';

            if (t.priority === 'high') {
                priorityColor = 'text-[#EF4444]';
                priorityLabel = 'Cao';
                badgeBg = 'bg-red-50';
                icon = 'error';
            } else if (t.priority === 'low') {
                priorityColor = 'text-status-info';
                priorityLabel = 'Thấp';
                badgeBg = 'bg-blue-50';
                icon = 'info';
            }

            const item = document.createElement('div');
            item.className = 'flex items-center justify-between p-5 bg-white rounded-2xl border border-outline-variant/30 hover:border-[#EC7700]/30 transition-all cursor-pointer';
            item.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full ${badgeBg} ${priorityColor} flex items-center justify-center">
                        <span class="material-symbols-outlined">${icon}</span>
                    </div>
                    <div>
                        <h5 class="font-bold text-on-surface text-body-md line-clamp-1">${t.title}</h5>
                        <p class="text-xs text-secondary mt-1 flex items-center gap-2">
                            <span class="material-symbols-outlined text-sm">schedule</span> ${t.due_date ? new Date(t.due_date).toLocaleString('vi-VN') : 'Không hạn'}
                            <span class="w-1 h-1 rounded-full bg-outline-variant"></span>
                            <span class="font-bold uppercase tracking-tighter ${priorityColor}">${priorityLabel}</span>
                            <span class="w-1 h-1 rounded-full bg-outline-variant"></span>
                            <span class="italic text-secondary">${custName}</span>
                        </p>
                    </div>
                </div>
                <button class="px-4 py-2 bg-[#EC7700] text-white text-xs font-bold rounded-lg hover:shadow-lg transition-all active:scale-95 whitespace-nowrap" 
                    onclick="DashboardModule.completeUrgentTask('${t.id}', this, event)">
                    Hoàn tất
                </button>
            `;
            container.appendChild(item);
        });
    },

    async completeUrgentTask(id, btn, event) {
        event.stopPropagation();
        showToast('Đang cập nhật công việc...', 'info', 600);

        if (!window.supabaseClient) {
            showToast('Đã hoàn thành công việc khẩn cấp (Offline Mode)', 'success');
            await this.loadDashboardData();
            return;
        }

        try {
            const { error } = await window.supabaseClient
                .from('tasks')
                .update({ status: 'done' })
                .eq('id', id);

            if (error) throw error;

            showToast('Hoàn thành công việc thành công!', 'success');
            await this.loadDashboardData();
        } catch (e) {
            console.error('Complete urgent task error:', e.message);
            showToast('Lỗi hoàn thành công việc: ' + e.message, 'error');
        }
    }
};

window.DashboardModule = DashboardModule;
