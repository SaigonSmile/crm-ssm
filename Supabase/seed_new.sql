-- =========================================================================
-- SAIGON SMILE CRM — NEW SEED DATA (COMPATIBLE WITH NEW INIT.SQL)
-- Dữ liệu mẫu để demo, chạy thử và kiểm thử bảo mật phân tầng (RLS/RBAC)
-- LƯU Ý: Chạy SAU KHI bạn đã thực thi file init.sql trong Supabase SQL Editor
-- =========================================================================

-- =========================================================================
-- 1. TẠO TÀI KHOẢN MẪU & CẬP NHẬT PHÂN QUYỀN
-- =========================================================================
-- Đăng ký các tài khoản sau trong Supabase Dashboard > Authentication > Users:
--   - admin@saigonsmile.com    → mật khẩu tùy chọn (ví dụ: password123)
--   - teamlead@saigonsmile.com → mật khẩu tùy chọn
--   - sales@saigonsmile.com    → mật khẩu tùy chọn
--
-- Sau khi đăng ký xong, lấy UID của các user đó từ bảng auth.users và thay vào các lệnh dưới đây:

-- UPDATE public.profiles SET role = 'admin', phone = '0988111222' WHERE email = 'admin@saigonsmile.com';
-- UPDATE public.profiles SET role = 'team_lead', phone = '0988333444' WHERE email = 'teamlead@saigonsmile.com';
-- UPDATE public.profiles SET role = 'sales', phone = '0988555666' WHERE email = 'sales@saigonsmile.com';

-- =========================================================================
-- 2. DỮ LIỆU KHÁCH HÀNG MẪU (CUSTOMERS)
-- =========================================================================
-- Thay thế các UUID '33333333-...' bên dưới bằng UUID thực tế của Sales/Admin user của bạn nếu muốn kiểm thử RLS

INSERT INTO public.customers (id, full_name, phone, email, gender, segment, interest, address, source, notes, created_by)
VALUES
    (
        '22222222-0000-0000-0000-000000000001',
        'Nguyễn Thị Lan Anh',
        '0912345678',
        'lananh.nguyen@gmail.com',
        'female',
        'VIP Gold',
        ARRAY['Trẻ hóa da', 'Thermage FLX'],
        '144 Xuân Thủy, Cầu Giấy, Hà Nội',
        'Facebook',
        'Khách hàng thân thiết, ưu tiên xếp lịch hẹn buổi chiều.',
        NULL -- Thay bằng UID của Sales User để kiểm tra phân quyền RLS
    ),
    (
        '22222222-0000-0000-0000-000000000002',
        'Lê Văn Hoàng',
        '0988111222',
        'hoang.le@vinhomes.vn',
        'male',
        'Tiềm năng',
        ARRAY['Giảm béo', 'Thermage FLX'],
        'Park 7, Vinhomes Central Park, Bình Thạnh, TP.HCM',
        'Website',
        'Quan tâm sâu tới liệu trình giảm béo bụng Ultra Slim.',
        NULL
    ),
    (
        '22222222-0000-0000-0000-000000000003',
        'Phạm Thu Trang',
        '0903999888',
        'trang.pham@shopee.vn',
        'female',
        'VIP Silver',
        ARRAY['Tắm trắng'],
        'Tòa nhà Saigon Centre, Quận 1, TP.HCM',
        'Giới thiệu',
        'Đã mua gói tắm trắng Collagen 4D nhưng chưa kích hoạt liệu trình.',
        NULL
    )
ON CONFLICT (phone) DO NOTHING;

-- =========================================================================
-- 3. CƠ HỘI BÁN HÀNG MẪU (OPPORTUNITIES)
-- =========================================================================
INSERT INTO public.opportunities (id, customer_id, title, expected_value, stage)
VALUES
    (
        '33333333-0000-0000-0000-000000000001',
        '22222222-0000-0000-0000-000000000001',
        'Thermage FLX + Trẻ hóa da mặt',
        35000000.00,
        'da_dat_lich'
    ),
    (
        '33333333-0000-0000-0000-000000000002',
        '22222222-0000-0000-0000-000000000002',
        'Liệu trình giảm béo bụng Ultra Slim 10 buổi',
        22000000.00,
        'da_lien_he'
    )
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 4. LỊCH HẸN & NHIỆM VỤ MẪU (TASKS)
-- =========================================================================
INSERT INTO public.tasks (id, customer_id, title, priority, status, due_date)
VALUES
    (
        '44444444-0000-0000-0000-000000000001',
        '22222222-0000-0000-0000-000000000001',
        'Gọi điện thoại chăm sóc sau liệu trình Hifu',
        'high',
        'todo',
        NOW() + INTERVAL '1 day'
    ),
    (
        '44444444-0000-0000-0000-000000000002',
        '22222222-0000-0000-0000-000000000002',
        'Hẹn lịch tư vấn trực tiếp gói giảm béo tại chi nhánh Q1',
        'medium',
        'todo',
        NOW() + INTERVAL '2 days'
    )
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 5. LỊCH SỬ THANH TOÁN MẪU (PAYMENTS)
-- =========================================================================
INSERT INTO public.payments (id, customer_id, amount, method, status, payment_date)
VALUES
    (
        '55555555-0000-0000-0000-000000000001',
        '22222222-0000-0000-0000-000000000001',
        25000000.00,
        'transfer',
        'completed',
        NOW()
    )
ON CONFLICT (id) DO NOTHING;
