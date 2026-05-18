-- ============================================================
-- SAIGON SMILE CRM — SCHEMA v2.0
-- Đã cập nhật: Tách customers + opportunities (1 KH → nhiều CH)
-- Chỉ Admin được tạo tài khoản (signUp tắt trên client)
-- ============================================================

-- 1. EXTENSIONS & ENUMS
-- ============================================================
create extension if not exists "uuid-ossp";

create type user_role as enum ('admin', 'team_lead', 'sales');
create type task_priority as enum ('low', 'medium', 'high');
create type task_status as enum ('todo', 'in_progress', 'done');
create type payment_status as enum ('pending', 'completed', 'cancelled');
create type payment_method as enum ('cash', 'transfer', 'card');

-- 2. PROFILES — Thông tin hồ sơ người dùng (1-1 với auth.users)
-- ============================================================
create table public.profiles (
    id          uuid references auth.users on delete cascade primary key,
    email       text unique not null,
    full_name   text,
    avatar_url  text,
    role        user_role default 'sales' not null,
    is_active   boolean default true,
    created_at  timestamptz default now() not null,
    updated_at  timestamptz default now() not null
);

-- 3. TEAMS — Quản lý nhóm / chi nhánh
-- ============================================================
create table public.teams (
    id          uuid default gen_random_uuid() primary key,
    name        text not null,
    manager_id  uuid references public.profiles(id) on delete set null,
    created_at  timestamptz default now() not null
);

-- 4. TEAM_MEMBERS — Thành viên trong nhóm
-- ============================================================
create table public.team_members (
    id      uuid default gen_random_uuid() primary key,
    team_id uuid references public.teams(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    unique(team_id, user_id)
);

-- 5. PIPELINE_STAGES — Các bước Kanban
-- ============================================================
create table public.pipeline_stages (
    id          uuid default gen_random_uuid() primary key,
    name        text not null,
    position    int not null,
    color       text default '#6B7280', -- Tailwind-compatible hex
    created_at  timestamptz default now() not null
);

-- 6. CUSTOMERS — Hồ sơ Khách hàng (tách khỏi cơ hội)
-- ============================================================
create table public.customers (
    id          uuid default gen_random_uuid() primary key,
    full_name   text not null,
    phone       text not null,
    email       text,
    gender      text check (gender in ('male', 'female', 'other')),
    birthday    date,
    address     text,
    company     text,
    segment     text,                  -- VIP, Khách mới, Tiềm năng cao
    source      text,                  -- Facebook, Website, Giới thiệu
    interest    text[],                -- Mảng dịch vụ quan tâm
    notes       text,
    tags        text[],                -- Dùng cho Danh sách khách hàng
    created_by  uuid references public.profiles(id) default auth.uid(),
    created_at  timestamptz default now() not null,
    updated_at  timestamptz default now() not null
);

-- Index tìm kiếm nhanh theo SĐT (unique để chống trùng)
create unique index idx_customers_phone on public.customers(phone);
create index idx_customers_segment on public.customers(segment);
create index idx_customers_created_by on public.customers(created_by);

-- 7. OPPORTUNITIES — Cơ hội bán hàng (nhiều cơ hội / 1 khách)
-- ============================================================
create table public.opportunities (
    id              uuid default gen_random_uuid() primary key,
    customer_id     uuid references public.customers(id) on delete cascade not null,
    title           text not null,             -- VD: "Combo Thermage FLX"
    expected_value  numeric(15, 2) default 0,
    stage_id        uuid references public.pipeline_stages(id),
    assigned_to     uuid references public.profiles(id),
    created_by      uuid references public.profiles(id) default auth.uid(),
    closed_at       timestamptz,               -- Khi chuyển sang Thành công/Thất bại
    created_at      timestamptz default now() not null,
    updated_at      timestamptz default now() not null
);

create index idx_opportunities_customer_id on public.opportunities(customer_id);
create index idx_opportunities_assigned_to on public.opportunities(assigned_to);
create index idx_opportunities_stage_id on public.opportunities(stage_id);

-- 8. TASKS — Công việc gắn với cơ hội
-- ============================================================
create table public.tasks (
    id              uuid default gen_random_uuid() primary key,
    opportunity_id  uuid references public.opportunities(id) on delete set null,
    customer_id     uuid references public.customers(id) on delete set null,
    title           text not null,
    description     text,
    due_date        timestamptz,
    priority        task_priority default 'medium',
    status          task_status default 'todo',
    assigned_to     uuid references public.profiles(id),
    created_by      uuid references public.profiles(id) default auth.uid(),
    created_at      timestamptz default now() not null,
    updated_at      timestamptz default now() not null
);

create index idx_tasks_assigned_to on public.tasks(assigned_to);
create index idx_tasks_due_date on public.tasks(due_date);
create index idx_tasks_status on public.tasks(status);

-- 9. PAYMENTS — Giao dịch thanh toán
-- ============================================================
create table public.payments (
    id              uuid default gen_random_uuid() primary key,
    opportunity_id  uuid references public.opportunities(id) on delete set null,
    customer_id     uuid references public.customers(id),
    amount          numeric(15, 2) not null,
    method          payment_method default 'transfer',
    status          payment_status default 'pending',
    notes           text,
    payment_date    timestamptz default now(),
    recorded_by     uuid references public.profiles(id) default auth.uid()
);

create index idx_payments_customer_id on public.payments(customer_id);

-- 10. ACTIVITY_LOGS — Nhật ký hành động
-- ============================================================
create table public.activity_logs (
    id          uuid default gen_random_uuid() primary key,
    user_id     uuid references public.profiles(id),
    action      text not null,   -- 'CREATE_CUSTOMER', 'UPDATE_STAGE', etc.
    target_id   uuid,
    target_type text,            -- 'customer', 'opportunity', 'task'
    metadata    jsonb,           -- Dữ liệu thêm (VD: stage_from → stage_to)
    created_at  timestamptz default now()
);

create index idx_activity_logs_user on public.activity_logs(user_id);
create index idx_activity_logs_target on public.activity_logs(target_id);
