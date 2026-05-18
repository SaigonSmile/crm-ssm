-- ============================================================
-- SAIGON SMILE CRM — SEED DATA
-- Dữ liệu mẫu để demo và test phân quyền
-- LƯU Ý: Chạy SAU khi schema, functions, và RLS đã được tạo
-- ============================================================

-- 1. Pipeline Stages (Kanban Columns)
-- ============================================================
insert into public.pipeline_stages (id, name, position, color) values
    ('11111111-0000-0000-0000-000000000001', 'Mới nhận',       1, '#6B7280'),
    ('11111111-0000-0000-0000-000000000002', 'Đang liên hệ',   2, '#3B82F6'),
    ('11111111-0000-0000-0000-000000000003', 'Đã tư vấn',      3, '#F59E0B'),
    ('11111111-0000-0000-0000-000000000004', 'Chờ đặt lịch',   4, '#8B5CF6'),
    ('11111111-0000-0000-0000-000000000005', 'Đã đặt lịch',    5, '#EC7700'),
    ('11111111-0000-0000-0000-000000000006', 'Thành công',     6, '#22C55E'),
    ('11111111-0000-0000-0000-000000000007', 'Thất bại',       7, '#EF4444')
on conflict do nothing;

-- ============================================================
-- 2. Demo Users (Tạo thủ công trong Supabase Auth → sau đó seed profiles)
-- ============================================================
-- LƯU Ý: Bạn cần tạo 3 user này trong Supabase Dashboard > Authentication > Users
-- Sau đó trigger handle_new_user sẽ tự tạo profiles tương ứng.
-- Dưới đây là lệnh UPDATE để gán đúng role sau khi profiles được tạo.
--
-- Tài khoản mẫu để cấu hình trên Supabase:
--   admin@saigonsmile.com     → password: Admin@123!
--   teamlead@saigonsmile.com  → password: Lead@123!
--   sales@saigonsmile.com     → password: Sales@123!

-- Cập nhật role (thay <UUID> bằng ID thực từ Supabase Auth sau khi tạo user)
-- update public.profiles set role = 'admin'     where email = 'admin@saigonsmile.com';
-- update public.profiles set role = 'team_lead' where email = 'teamlead@saigonsmile.com';
-- update public.profiles set role = 'sales'     where email = 'sales@saigonsmile.com';

-- ============================================================
-- 3. Demo Customers
-- ============================================================
insert into public.customers (id, full_name, phone, email, gender, segment, source, interest, tags) values
    ('22222222-0000-0000-0000-000000000001', 'Nguyễn Thị Lan Anh', '0912345678', 'lananh@vingroup.com',     'female', 'VIP Diamond',      'Facebook',   ARRAY['Trẻ hóa da', 'Thermage FLX'], ARRAY['VIP']),
    ('22222222-0000-0000-0000-000000000002', 'Lê Thị Minh Thu',    '0988111222', 'minhthu@gmail.com',       'female', 'Tiềm năng cao',    'Website',    ARRAY['Meso căng bóng'], ARRAY[]),
    ('22222222-0000-0000-0000-000000000003', 'Phạm Thu Trang',     '0903999888', 'thutrang@fpt.com',        'female', 'Khách mới',        'Website',    ARRAY['Giảm béo'], ARRAY['Theo dõi']),
    ('22222222-0000-0000-0000-000000000004', 'Đặng Minh Hùng',    '0913444555', 'minhhung@masan.com',      'male',   'Doanh nghiệp',    'Giới thiệu', ARRAY['Trị nám', 'Chăm sóc da'], ARRAY[]),
    ('22222222-0000-0000-0000-000000000005', 'Vũ Kim Chi',         '0933222111', 'kimchi@vietcombank.com',  'female', 'VIP Platinum',     'Giới thiệu', ARRAY['Tắm trắng Collagen 4D'], ARRAY['VIP']),
    ('22222222-0000-0000-0000-000000000006', 'Hoàng Quốc Bảo',    '0944666777', 'quocbao@hoaphat.com',     'male',   'Đối tác',          'Facebook',   ARRAY['Ultherapy'], ARRAY[])
on conflict do nothing;

-- ============================================================
-- 4. Demo Opportunities (gán tạm created_by/assigned_to = null vì chưa có user UUID)
-- Sau khi tạo user thật, chạy UPDATE để gán đúng assigned_to
-- ============================================================
insert into public.opportunities (customer_id, title, expected_value, stage_id) values
    ('22222222-0000-0000-0000-000000000001', 'Thermage FLX + Trẻ hóa da',     35000000, '11111111-0000-0000-0000-000000000003'),
    ('22222222-0000-0000-0000-000000000002', 'Meso Căng bóng VIP',            22000000, '11111111-0000-0000-0000-000000000002'),
    ('22222222-0000-0000-0000-000000000003', 'Liệu trình Giảm béo 10 buổi',   18000000, '11111111-0000-0000-0000-000000000001'),
    ('22222222-0000-0000-0000-000000000004', 'Trị nám chuyên sâu',            15500000, '11111111-0000-0000-0000-000000000002'),
    ('22222222-0000-0000-0000-000000000005', 'Tắm trắng Collagen 4D 6 buổi',  42000000, '11111111-0000-0000-0000-000000000004'),
    ('22222222-0000-0000-0000-000000000006', 'Ultherapy nâng cơ mặt',         28000000, '11111111-0000-0000-0000-000000000002'),
    -- Cùng 1 khách hàng, cơ hội thứ 2 (test 1 KH → nhiều CH)
    ('22222222-0000-0000-0000-000000000001', 'Giảm béo bụng sau sinh',         19000000, '11111111-0000-0000-0000-000000000001')
on conflict do nothing;
