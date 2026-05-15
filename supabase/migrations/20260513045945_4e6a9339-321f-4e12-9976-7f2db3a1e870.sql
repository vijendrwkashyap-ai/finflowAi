
-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  monthly_income numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

-- expenses
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null check (amount >= 0),
  category text not null default 'Other',
  merchant text,
  note text,
  spent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.expenses enable row level security;
create policy "own expenses all" on public.expenses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index expenses_user_date_idx on public.expenses(user_id, spent_at desc);

-- subscriptions
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric not null check (amount >= 0),
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly','yearly','weekly')),
  next_charge_at date,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
create policy "own subs all" on public.subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
