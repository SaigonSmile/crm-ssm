-- =========================================================================
-- SAIGON SMILE MEDICAL CRM - DATABASE INITIALIZATION SCHEMA FOR SUPABASE
-- Location: public schema
-- =========================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- =========================================================================
-- PART 1: TABLES DEFINITIONS
-- =========================================================================

-- 1. Profiles Table (Extends auth.users)
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text not null,
    email text unique not null,
    phone text,
    role text not null check (role in ('admin', 'team_lead', 'sales')) default 'sales',
    is_active boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Customers Table
create table public.customers (
    id uuid primary key default gen_random_uuid(),
    full_name text not null,
    phone text unique not null,
    email text,
    gender text check (gender in ('male', 'female', 'other')),
    segment text check (segment in ('VIP Gold', 'VIP Silver', 'Tiềm năng', 'Khách mới')) default 'Khách mới',
    interest text[] default '{}',
    address text,
    source text default 'Trực tiếp',
    notes text,
    created_by uuid references public.profiles(id) on delete set null default auth.uid(),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Opportunities Table (Leads / Sales Pipeline)
create table public.opportunities (
    id uuid primary key default gen_random_uuid(),
    customer_id uuid references public.customers(id) on delete cascade not null,
    title text not null,
    expected_value numeric(15, 2) default 0.00,
    stage text not null check (stage in ('moi_tao', 'da_lien_he', 'da_dat_lich', 'thanh_cong', 'that_bat')) default 'moi_tao',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tasks Table (Meetings / Caring Tasks)
create table public.tasks (
    id uuid primary key default gen_random_uuid(),
    customer_id uuid references public.customers(id) on delete cascade not null,
    title text not null,
    priority text not null check (priority in ('low', 'medium', 'high')) default 'medium',
    status text not null check (status in ('todo', 'done')) default 'todo',
    due_date timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Payments Table (Transactions)
create table public.payments (
    id uuid primary key default gen_random_uuid(),
    customer_id uuid references public.customers(id) on delete cascade not null,
    amount numeric(15, 2) not null check (amount > 0),
    method text not null check (method in ('transfer', 'cash', 'card')) default 'transfer',
    status text not null check (status in ('completed', 'pending', 'cancelled')) default 'completed',
    payment_date timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- PART 2: AUTOMATIC USER PROFILE TRIGGER
-- =========================================================================
-- Automatically creates a public.profiles entry whenever a user signs up on Supabase

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Nhân viên mới'),
    new.email,
    'sales', -- Default role assigned to new signups
    true
  );
  return new;
end;
$$ language plpgsql security definer;

-- Bind trigger to auth.users table
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================================
-- PART 3: ROW LEVEL SECURITY (RLS) & ACCESS POLICIES
-- =========================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.opportunities enable row level security;
alter table public.tasks enable row level security;
alter table public.payments enable row level security;

-- Helper Function to check user roles easily
create or replace function public.get_user_role(user_id uuid)
returns text as $$
  select role from public.profiles where id = user_id;
$$ language sql security definer;

-- -------------------------------------------------------------------------
-- 3.1 POLICIES FOR profiles
-- -------------------------------------------------------------------------
-- Authenticated users can read employee profiles (to map names in CRM)
create policy "Allow auth users to view profiles"
on public.profiles for select
to authenticated
using (true);

-- User can update their own profile details
create policy "Allow users to update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id);

-- Admins have full access
create policy "Allow admins full access to profiles"
on public.profiles for all
to authenticated
using (public.get_user_role(auth.uid()) = 'admin');

-- -------------------------------------------------------------------------
-- 3.2 POLICIES FOR customers
-- -------------------------------------------------------------------------
-- Admins & Team Leads can manage all customers. Sales can only view/manage their own.
create policy "Allow admin and team_lead full access to customers"
on public.customers for all
to authenticated
using (public.get_user_role(auth.uid()) in ('admin', 'team_lead'));

create policy "Allow sales to manage own customers"
on public.customers for all
to authenticated
using (
  public.get_user_role(auth.uid()) = 'sales' 
  and (created_by = auth.uid() or created_by is null)
);

-- -------------------------------------------------------------------------
-- 3.3 POLICIES FOR opportunities
-- -------------------------------------------------------------------------
-- Sales can only view/manage opportunities of customers they own
create policy "Allow admin and team_lead full access to opportunities"
on public.opportunities for all
to authenticated
using (public.get_user_role(auth.uid()) in ('admin', 'team_lead'));

create policy "Allow sales to manage own opportunities"
on public.opportunities for all
to authenticated
using (
  public.get_user_role(auth.uid()) = 'sales'
  and customer_id in (
    select id from public.customers where created_by = auth.uid()
  )
);

-- -------------------------------------------------------------------------
-- 3.4 POLICIES FOR tasks
-- -------------------------------------------------------------------------
-- Sales can only view/manage tasks of customers they own
create policy "Allow admin and team_lead full access to tasks"
on public.tasks for all
to authenticated
using (public.get_user_role(auth.uid()) in ('admin', 'team_lead'));

create policy "Allow sales to manage own tasks"
on public.tasks for all
to authenticated
using (
  public.get_user_role(auth.uid()) = 'sales'
  and customer_id in (
    select id from public.customers where created_by = auth.uid()
  )
);

-- -------------------------------------------------------------------------
-- 3.5 POLICIES FOR payments
-- -------------------------------------------------------------------------
-- Sales can only view/manage payments of customers they own
create policy "Allow admin and team_lead full access to payments"
on public.payments for all
to authenticated
using (public.get_user_role(auth.uid()) in ('admin', 'team_lead'));

create policy "Allow sales to manage own payments"
on public.payments for all
to authenticated
using (
  public.get_user_role(auth.uid()) = 'sales'
  and customer_id in (
    select id from public.customers where created_by = auth.uid()
  )
);

-- =========================================================================
-- PART 4: DATA SEEDING (Optional Mock Data for testing)
-- =========================================================================

-- Note: Seed profiles will be auto-generated when auth.users is populated.
-- You can manually insert initial profiles after adding users inside Supabase Auth panel:
--
-- INSERT INTO public.profiles (id, full_name, email, role, is_active)
-- VALUES 
--   ('auth-uuid-admin-here', 'Nguyễn Hoàng Minh', 'admin@saigonsmile.com.vn', 'admin', true),
--   ('auth-uuid-lead-here', 'Quốc Bảo', 'bao.q@saigonsmile.vn', 'team_lead', true),
--   ('auth-uuid-sales-here', 'Lê Thị Tuyết', 'tuyet.lt@saigonsmile.vn', 'sales', true);
