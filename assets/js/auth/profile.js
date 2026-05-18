// profile.js - Quản lý đọc/ghi hồ sơ người dùng (Profiles) và phân quyền từ Database

const ProfileService = {
    // 1. Lấy thông tin Profile thực tế từ Database
    async getUserProfile(userId) {
        if (!window.supabaseClient) {
            return this._getMockProfile(userId);
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return { success: true, profile: data };
        } catch (error) {
            console.error('Fetch profile error:', error.message);
            // Fallback sang mock hoặc tạo profile mặc định
            return { success: false, error: error.message };
        }
    },

    // 2. Cập nhật hồ sơ (Họ tên, Avatar)
    async updateProfile(userId, updates) {
        if (!window.supabaseClient) {
            return this._updateMockProfile(userId, updates);
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('profiles')
                .update({
                    full_name: updates.fullName,
                    avatar_url: updates.avatarUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return { success: true, profile: data };
        } catch (error) {
            console.error('Update profile error:', error.message);
            return { success: false, error: error.message };
        }
    },

    // 3. Admin: Thay đổi vai trò (Role) của nhân viên khác
    async updateEmployeeRole(employeeId, newRole) {
        if (!window.supabaseClient) {
            showToast('Đang chạy Offline. Đã cập nhật quyền thành công (giả lập).', 'success');
            return { success: true };
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('profiles')
                .update({ role: newRole })
                .eq('id', employeeId)
                .select()
                .single();

            if (error) throw error;
            return { success: true, profile: data };
        } catch (error) {
            console.error('Update employee role error:', error.message);
            return { success: false, error: error.message };
        }
    },

    // Mock profiles cho chế độ Offline Dev
    _getMockProfile(userId) {
        const mockUserStr = localStorage.getItem('crm_mock_user');
        if (mockUserStr) {
            const mockUser = JSON.parse(mockUserStr);
            return {
                success: true,
                profile: {
                    id: mockUser.id,
                    email: mockUser.email,
                    full_name: mockUser.user_metadata.full_name || 'Quản trị viên',
                    avatar_url: mockUser.user_metadata.avatar_url || '',
                    role: mockUser.role || 'sales',
                    is_active: true
                }
            };
        }
        return { success: false, error: 'User not found' };
    },

    _updateMockProfile(userId, updates) {
        const mockUserStr = localStorage.getItem('crm_mock_user');
        if (mockUserStr) {
            const mockUser = JSON.parse(mockUserStr);
            mockUser.user_metadata.full_name = updates.fullName;
            mockUser.user_metadata.avatar_url = updates.avatarUrl;
            localStorage.setItem('crm_mock_user', JSON.stringify(mockUser));
            return {
                success: true,
                profile: {
                    id: mockUser.id,
                    email: mockUser.email,
                    full_name: updates.fullName,
                    avatar_url: updates.avatarUrl,
                    role: mockUser.role
                }
            };
        }
        return { success: false, error: 'User not found' };
    }
};

window.ProfileService = ProfileService;
