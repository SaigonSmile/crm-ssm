// auth.js - Quản lý đăng nhập, Google OAuth, Đăng xuất và bảo vệ tuyến đường (Route Guard)

const AuthService = {
    // 1. Đăng nhập bằng Email/Password
    async signInWithEmail(email, password) {
        if (!window.supabaseClient) {
            return this._mockLogin(email, password);
        }

        try {
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Sign in error:', error.message);
            return { success: false, error: error.message };
        }
    },

    // 2. Đăng nhập bằng Google OAuth (Chỉ chấp nhận miền công ty nếu cần cấu hình)
    async signInWithGoogle() {
        if (!window.supabaseClient) {
            showToast('Đang chạy chế độ offline. Chuyển hướng tới Dashboard...', 'info');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            return;
        }

        try {
            const redirectTo = window.location.origin.includes('file://') 
                ? 'http://localhost:5173/dashboard.html' // Thường dùng khi chạy Vite local
                : window.location.origin + '/dashboard.html';

            const { error } = await window.supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectTo
                }
            });

            if (error) throw error;
        } catch (error) {
            console.error('Google Auth error:', error.message);
            showToast('Lỗi đăng nhập Google: ' + error.message, 'error');
        }
    },

    // 3. Đăng xuất
    async signOut() {
        if (window.supabaseClient) {
            await window.supabaseClient.auth.signOut();
        }
        localStorage.removeItem('crm_mock_user');
        window.location.href = 'login.html';
    },

    // 4. Kiểm tra phiên đăng nhập (Route Guard)
    async checkSession() {
        // Nếu ở trang login, và đã có session -> chuyển về dashboard
        const isLoginPage = window.location.pathname.includes('login') || window.location.pathname === '/' || window.location.pathname.endsWith('/CRM/');
        
        let user = null;

        if (window.supabaseClient) {
            const { data: { session } } = await window.supabaseClient.auth.getSession();
            if (session) {
                user = session.user;
            }
        }

        // Kiểm tra mock user (Offline mode / Dev local)
        if (!user) {
            const mockUserStr = localStorage.getItem('crm_mock_user');
            if (mockUserStr) {
                user = JSON.parse(mockUserStr);
            }
        }

        if (isLoginPage) {
            if (user) {
                window.location.href = 'dashboard.html';
            }
        } else {
            // Các trang khác bắt buộc phải đăng nhập
            if (!user) {
                window.location.href = 'login.html';
            }
        }

        return user;
    },

    // Mock Login phục vụ chạy Demo offline / chưa có Supabase
    _mockLogin(email, password) {
        if (email.includes('@saigonsmile.com') || email === 'admin@saigonsmile.com') {
            let role = 'sales';
            if (email.startsWith('admin')) role = 'admin';
            if (email.startsWith('teamlead')) role = 'team_lead';

            const mockUser = {
                id: 'mock-uuid-12345',
                email: email,
                role: role,
                user_metadata: {
                    full_name: email.split('@')[0].toUpperCase(),
                    avatar_url: ''
                }
            };
            localStorage.setItem('crm_mock_user', JSON.stringify(mockUser));
            return { success: true, user: mockUser };
        } else {
            return { success: false, error: 'Email hoặc mật khẩu không chính xác hoặc không thuộc miền công ty.' };
        }
    }
};

// Xuất global để các file HTML sử dụng dễ dàng
window.AuthService = AuthService;
