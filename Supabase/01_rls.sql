-- ============================================================
-- SAIGON SMILE CRM — ROW LEVEL SECURITY (RLS) POLICIES
-- Phải chạy SAU khi schema và functions đã được tạo
-- ============================================================

-- Bật RLS cho tất cả bảng public
alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.customers enable row level security;
alter table public.opportunities enable row level security;
alter table public.tasks enable row level security;
alter table public.payments enable row level security;
alter table public.activity_logs enable row level security;

-- ============================================================
-- BẢNG: profiles
-- ============================================================
-- User xem được profile của chính mình
create policy "profiles: users see own profile"
    on public.profiles for select
    using (id = auth.uid());

-- Admin xem tất cả profiles
create policy "profiles: admins see all"
    on public.profiles for select
    using (public.is_admin());

-- User cập nhật profile của chính mình
create policy "profiles: users update own"
    on public.profiles for update
    using (id = auth.uid());

-- Chỉ Admin mới được cập nhật role của người khác
create policy "profiles: admin update all"
    on public.profiles for update
    using (public.is_admin());

-- ============================================================
-- BẢNG: customers
-- ============================================================
-- Admin: toàn quyền
create policy "customers: admin full access"
    on public.customers for all
    using (public.is_admin());

-- Team Lead: xem customers được giao cho team của mình
-- (thông qua opportunities.assigned_to nằm trong team của họ)
create policy "customers: team lead sees team customers"
    on public.customers for select
    using (
        exists (
            select 1 from public.opportunities o
            where o.customer_id = customers.id
            and o.assigned_to in (select public.get_my_team_user_ids())
        )
    );

-- Sales: chỉ xem customers có opportunity được giao cho mình
create policy "customers: sales sees own customers"
    on public.customers for select
    using (
        created_by = auth.uid()
        or exists (
            select 1 from public.opportunities o
            where o.customer_id = customers.id
            and o.assigned_to = auth.uid()
        )
    );

-- Sales: tạo customers mới
create policy "customers: sales can insert"
    on public.customers for insert
    with check (auth.uid() is not null);

-- Sales: cập nhật customers mà mình có quyền xem
create policy "customers: sales update own"
    on public.customers for update
    using (
        created_by = auth.uid()
        or exists (
            select 1 from public.opportunities o
            where o.customer_id = customers.id
            and o.assigned_to = auth.uid()
        )
    );

-- ============================================================
-- BẢNG: opportunities
-- ============================================================
create policy "opportunities: admin full access"
    on public.opportunities for all
    using (public.is_admin());

create policy "opportunities: team lead sees team"
    on public.opportunities for select
    using (
        assigned_to in (select public.get_my_team_user_ids())
        or assigned_to = auth.uid()
    );

create policy "opportunities: sales sees own"
    on public.opportunities for select
    using (
        assigned_to = auth.uid()
        or created_by = auth.uid()
    );

create policy "opportunities: sales insert"
    on public.opportunities for insert
    with check (auth.uid() is not null);

create policy "opportunities: sales update own"
    on public.opportunities for update
    using (
        assigned_to = auth.uid()
        or created_by = auth.uid()
        or public.is_team_lead_of_user(assigned_to)
    );

-- ============================================================
-- BẢNG: tasks
-- ============================================================
create policy "tasks: admin full access"
    on public.tasks for all
    using (public.is_admin());

create policy "tasks: team lead sees team tasks"
    on public.tasks for select
    using (
        assigned_to in (select public.get_my_team_user_ids())
        or assigned_to = auth.uid()
    );

create policy "tasks: sales sees own tasks"
    on public.tasks for select
    using (assigned_to = auth.uid() or created_by = auth.uid());

create policy "tasks: sales insert"
    on public.tasks for insert
    with check (auth.uid() is not null);

create policy "tasks: sales update own"
    on public.tasks for update
    using (assigned_to = auth.uid() or created_by = auth.uid());

-- ============================================================
-- BẢNG: payments
-- ============================================================
create policy "payments: admin full access"
    on public.payments for all
    using (public.is_admin());

create policy "payments: team lead sees team payments"
    on public.payments for select
    using (
        recorded_by in (select public.get_my_team_user_ids())
        or recorded_by = auth.uid()
    );

create policy "payments: sales sees own"
    on public.payments for select
    using (recorded_by = auth.uid());

create policy "payments: sales insert"
    on public.payments for insert
    with check (auth.uid() is not null);

-- ============================================================
-- BẢNG: activity_logs
-- ============================================================
-- Chỉ Admin đọc toàn bộ logs
create policy "activity_logs: admin read all"
    on public.activity_logs for select
    using (public.is_admin());

-- User chỉ đọc logs của chính mình
create policy "activity_logs: user read own"
    on public.activity_logs for select
    using (user_id = auth.uid());

-- Tất cả authenticated users đều có thể ghi logs
create policy "activity_logs: authenticated insert"
    on public.activity_logs for insert
    with check (auth.uid() is not null);

-- ============================================================
-- BẢNG: teams & team_members (Admin chỉ được quản lý)
-- ============================================================
create policy "teams: admin full access"
    on public.teams for all
    using (public.is_admin());

create policy "teams: all can read"
    on public.teams for select
    using (auth.uid() is not null);

create policy "team_members: admin full access"
    on public.team_members for all
    using (public.is_admin());

create policy "team_members: all can read own membership"
    on public.team_members for select
    using (user_id = auth.uid() or public.is_admin());
