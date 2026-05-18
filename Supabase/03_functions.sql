-- ============================================================
-- SAIGON SMILE CRM — TRIGGER & HELPER FUNCTIONS
-- ============================================================

-- FUNCTION: Tự động tạo profile khi có user mới trong auth.users
-- Trigger này đảm bảo MỌI phương thức đăng nhập (Email/Google) đều
-- tạo ra đúng 1 bản ghi trong bảng profiles (ON CONFLICT DO UPDATE)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, full_name, avatar_url, role)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'avatar_url',
        'sales'  -- Mặc định: sales. Admin phân quyền lại sau trong Settings
    )
    on conflict (id) do update
        set email      = excluded.email,
            full_name  = coalesce(public.profiles.full_name, excluded.full_name),
            avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
            updated_at = now();
    return new;
end;
$$ language plpgsql security definer;

-- Gắn trigger vào auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- FUNCTION: Helper kiểm tra quyền Admin
-- ============================================================
create or replace function public.is_admin()
returns boolean as $$
    select exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
    );
$$ language sql security definer stable;

-- FUNCTION: Helper kiểm tra quyền Team Lead của một user cụ thể
-- ============================================================
create or replace function public.is_team_lead_of_user(target_user_id uuid)
returns boolean as $$
    select exists (
        select 1 from public.teams t
        join public.team_members tm on t.id = tm.team_id
        where t.manager_id = auth.uid() and tm.user_id = target_user_id
    );
$$ language sql security definer stable;

-- FUNCTION: Helper — lấy toàn bộ user_id trong team mà auth.uid() là manager
-- ============================================================
create or replace function public.get_my_team_user_ids()
returns setof uuid as $$
    select tm.user_id
    from public.teams t
    join public.team_members tm on t.id = tm.team_id
    where t.manager_id = auth.uid();
$$ language sql security definer stable;

-- FUNCTION: Tự động cập nhật updated_at
-- ============================================================
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Gắn trigger updated_at cho các bảng
create trigger handle_profiles_updated_at before update on public.profiles
    for each row execute procedure public.update_updated_at_column();

create trigger handle_customers_updated_at before update on public.customers
    for each row execute procedure public.update_updated_at_column();

create trigger handle_opportunities_updated_at before update on public.opportunities
    for each row execute procedure public.update_updated_at_column();

create trigger handle_tasks_updated_at before update on public.tasks
    for each row execute procedure public.update_updated_at_column();
