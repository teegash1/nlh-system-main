create table public.inventory_categories (
  id uuid not null default gen_random_uuid (),
  name text not null,
  created_at timestamp with time zone not null default now(),
  constraint inventory_categories_pkey primary key (id),
  constraint inventory_categories_name_key unique (name)
) TABLESPACE pg_default;


create table public.inventory_items (
  id uuid not null default gen_random_uuid (),
  category_id uuid null,
  name text not null,
  unit text not null default 'pcs'::text,
  reorder_level numeric null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  constraint inventory_items_pkey primary key (id),
  constraint uq_inventory_items_category_name unique (category_id, name),
  constraint inventory_items_category_id_fkey foreign KEY (category_id) references inventory_categories (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_inventory_items_category on public.inventory_items using btree (category_id) TABLESPACE pg_default;


create table public.monthly_stocktake_rows (
  id uuid not null default gen_random_uuid (),
  item_id uuid not null,
  month_start date not null,
  qty_start text null,
  qty_additional text null,
  qty_end text null,
  cost text null,
  source text not null default 'excel_seed'::text,
  created_at timestamp with time zone not null default now(),
  constraint monthly_stocktake_rows_pkey primary key (id),
  constraint monthly_stocktake_rows_item_id_month_start_key unique (item_id, month_start),
  constraint monthly_stocktake_rows_item_id_fkey foreign KEY (item_id) references inventory_items (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_monthly_stocktake_item_month on public.monthly_stocktake_rows using btree (item_id, month_start) TABLESPACE pg_default;


create table public.profiles (
  id uuid not null,
  full_name text null,
  role text not null default 'viewer'::text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger trg_profiles_updated_at BEFORE
update on profiles for EACH row
execute FUNCTION set_updated_at ();

-- Auto-create profile on auth signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), ''),
    coalesce(new.raw_user_meta_data->>'role', 'viewer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();



create table public.stock_counts (
  id uuid not null default gen_random_uuid (),
  item_id uuid not null,
  count_date date not null,
  raw_value text not null,
  qty_numeric numeric null,
  qty_unit text null,
  source text not null default 'excel_seed'::text,
  created_by uuid null,
  created_at timestamp with time zone not null default now(),
  constraint stock_counts_pkey primary key (id),
  constraint stock_counts_item_id_count_date_key unique (item_id, count_date),
  constraint stock_counts_created_by_fkey foreign KEY (created_by) references auth.users (id) on delete set null,
  constraint stock_counts_item_id_fkey foreign KEY (item_id) references inventory_items (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_stock_counts_date on public.stock_counts using btree (count_date) TABLESPACE pg_default;

create index IF not exists idx_stock_counts_item_date on public.stock_counts using btree (item_id, count_date) TABLESPACE pg_default;

create table public.receipts (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  vendor text not null,
  category text not null,
  amount numeric not null,
  amount_received numeric null,
  balance numeric null,
  payment_method text not null,
  reference text null,
  receipt_date date not null,
  file_path text not null,
  status text not null default 'Pending'::text,
  created_at timestamp with time zone not null default now(),
  constraint receipts_pkey primary key (id),
  constraint receipts_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete cascade
) TABLESPACE pg_default;

create index IF not exists idx_receipts_user_date on public.receipts using btree (user_id, receipt_date) TABLESPACE pg_default;



-- RLS policies for receipts + profiles
alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

alter table public.receipts enable row level security;

drop policy if exists "Receipts are readable by owner" on public.receipts;
create policy "Receipts are readable by authenticated"
on public.receipts
for select
to authenticated
using (true);

create policy "Receipts are insertable by owner"
on public.receipts
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Receipts are updateable by owner"
on public.receipts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Receipts are deleteable by owner"
on public.receipts
for delete
to authenticated
using (auth.uid() = user_id);

create policy "Receipts status update by admin"
on public.receipts
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

-- Storage policies (bucket: receipts)
drop policy if exists "Receipts files read by owner" on storage.objects;
create policy "Receipts files read by authenticated"
on storage.objects
for select
to authenticated
using (bucket_id = 'receipts');

create policy "Receipts files uploaded by owner"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'receipts'
  and auth.uid()::text = split_part(name, '/', 1)
);

create policy "Receipts files delete by owner"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'receipts'
  and auth.uid()::text = split_part(name, '/', 1)
);




create table public.stock_moves (
  id uuid not null default gen_random_uuid (),
  item_id uuid not null,
  move_type text not null,
  quantity numeric not null,
  unit_cost numeric null,
  note text null,
  occurred_at timestamp with time zone not null default now(),
  created_by uuid null,
  created_at timestamp with time zone not null default now(),
  constraint stock_moves_pkey primary key (id),
  constraint stock_moves_created_by_fkey foreign KEY (created_by) references auth.users (id) on delete set null,
  constraint stock_moves_item_id_fkey foreign KEY (item_id) references inventory_items (id) on delete CASCADE,
  constraint stock_moves_move_type_check check (
    (
      move_type = any (array['in'::text, 'out'::text, 'adjust'::text])
    )
  ),
  constraint stock_moves_quantity_check check ((quantity > (0)::numeric))
) TABLESPACE pg_default;

create index IF not exists idx_stock_moves_item on public.stock_moves using btree (item_id) TABLESPACE pg_default;

create index IF not exists idx_stock_moves_occurred_at on public.stock_moves using btree (occurred_at) TABLESPACE pg_default;




create table public.stocktake_notes (
  id uuid not null default gen_random_uuid (),
  note_date date not null,
  note text not null,
  source text not null default 'excel_seed'::text,
  created_at timestamp with time zone not null default now(),
  constraint stocktake_notes_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_stocktake_notes_date on public.stocktake_notes using btree (note_date) TABLESPACE pg_default;




create view public.vw_latest_stock_count as
select distinct
  on (item_id) item_id,
  count_date,
  raw_value,
  qty_numeric,
  qty_unit
from
  stock_counts sc
order by
  item_id,
  count_date desc;




create view public.vw_stock_latest_date_snapshot as
with
  latest as (
    select
      max(stock_counts.count_date) as latest_date
    from
      stock_counts
  )
select
  i.id as item_id,
  latest.latest_date,
  sc.raw_value,
  sc.qty_numeric,
  sc.qty_unit
from
  inventory_items i
  cross join latest
  left join stock_counts sc on sc.item_id = i.id
  and sc.count_date = latest.latest_date;


-- Reminders (scheduler)
create table public.reminders (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  title text not null,
  notes text null,
  start_at timestamp with time zone not null,
  recurrence text not null default 'none'::text,
  color text not null default 'chart-1'::text,
  created_at timestamp with time zone not null default now(),
  constraint reminders_pkey primary key (id),
  constraint reminders_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete cascade,
  constraint reminders_recurrence_check check (
    recurrence = any (
      array[
        'none'::text,
        'weekly'::text,
        'biweekly'::text,
        'monthly'::text,
        'quarterly'::text
      ]
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_reminders_user_date on public.reminders using btree (user_id, start_at) TABLESPACE pg_default;

alter table public.reminders enable row level security;

drop policy if exists "Reminders are readable by owner" on public.reminders;
create policy "Reminders are readable by authenticated"
on public.reminders
for select
to authenticated
using (true);

create policy "Reminders are insertable by owner"
on public.reminders
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Reminders are updateable by owner"
on public.reminders
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Reminders are deleteable by owner"
on public.reminders
for delete
to authenticated
using (auth.uid() = user_id);


-- Shopping list (low stock purchasing)
create table public.shopping_list_items (
  id uuid not null default gen_random_uuid (),
  item_id uuid not null,
  desired_qty numeric not null default 0,
  unit_price numeric null,
  notes text null,
  excluded boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint shopping_list_items_pkey primary key (id),
  constraint shopping_list_items_item_unique unique (item_id),
  constraint shopping_list_items_item_fkey foreign key (item_id)
    references public.inventory_items (id) on delete cascade
) TABLESPACE pg_default;

alter table public.shopping_list_items
  add column if not exists excluded boolean not null default false;

create index if not exists idx_shopping_list_items_item on public.shopping_list_items using btree (item_id) TABLESPACE pg_default;

alter table public.shopping_list_items enable row level security;

create policy "Shopping list readable by authenticated"
on public.shopping_list_items
for select
to authenticated
using (true);

create policy "Shopping list insertable by authenticated"
on public.shopping_list_items
for insert
to authenticated
with check (true);

create policy "Shopping list updateable by authenticated"
on public.shopping_list_items
for update
to authenticated
using (true)
with check (true);

create policy "Shopping list deleteable by authenticated"
on public.shopping_list_items
for delete
to authenticated
using (true);

create or replace function public.set_updated_at_shopping_list_items()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_shopping_list_items_updated_at on public.shopping_list_items;
create trigger trg_shopping_list_items_updated_at
before update on public.shopping_list_items
for each row execute function public.set_updated_at_shopping_list_items();


-- Shopping list history (saved lists)
create table public.shopping_lists (
  id uuid not null default gen_random_uuid (),
  title text not null,
  status text not null default 'active'::text,
  created_by uuid null references auth.users (id) on delete set null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  completed_at timestamp with time zone null,
  constraint shopping_lists_pkey primary key (id),
  constraint shopping_lists_status_check check (status in ('active', 'done'))
) TABLESPACE pg_default;

create index if not exists idx_shopping_lists_status on public.shopping_lists using btree (status, created_at) TABLESPACE pg_default;

alter table public.shopping_lists enable row level security;

create policy "Shopping lists readable by authenticated"
on public.shopping_lists
for select
to authenticated
using (true);

create policy "Shopping lists insertable by authenticated"
on public.shopping_lists
for insert
to authenticated
with check (true);

create policy "Shopping lists updateable by authenticated"
on public.shopping_lists
for update
to authenticated
using (true)
with check (true);

create policy "Shopping lists deleteable by authenticated"
on public.shopping_lists
for delete
to authenticated
using (true);

create or replace function public.set_updated_at_shopping_lists()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_shopping_lists_updated_at on public.shopping_lists;
create trigger trg_shopping_lists_updated_at
before update on public.shopping_lists
for each row execute function public.set_updated_at_shopping_lists();


create table public.shopping_list_entries (
  id uuid not null default gen_random_uuid (),
  list_id uuid not null references public.shopping_lists (id) on delete cascade,
  item_id uuid not null references public.inventory_items (id) on delete cascade,
  item_name text not null,
  category text not null,
  unit text not null,
  current_qty numeric not null default 0,
  desired_qty numeric not null default 0,
  unit_price numeric null,
  status text not null default 'Low stock'::text,
  created_at timestamp with time zone not null default now(),
  constraint shopping_list_entries_pkey primary key (id)
) TABLESPACE pg_default;

create index if not exists idx_shopping_list_entries_list on public.shopping_list_entries using btree (list_id) TABLESPACE pg_default;
create index if not exists idx_shopping_list_entries_item on public.shopping_list_entries using btree (item_id) TABLESPACE pg_default;

alter table public.shopping_list_entries enable row level security;

create policy "Shopping list entries readable by authenticated"
on public.shopping_list_entries
for select
to authenticated
using (true);

create policy "Shopping list entries insertable by authenticated"
on public.shopping_list_entries
for insert
to authenticated
with check (true);

create policy "Shopping list entries updateable by authenticated"
on public.shopping_list_entries
for update
to authenticated
using (true)
with check (true);

create policy "Shopping list entries deleteable by authenticated"
on public.shopping_list_entries
for delete
to authenticated
using (true);


-- Notification read state
create table public.notification_reads (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  notification_key text not null,
  read_at timestamp with time zone not null default now(),
  constraint notification_reads_pkey primary key (id),
  constraint notification_reads_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete cascade,
  constraint notification_reads_unique unique (user_id, notification_key)
) TABLESPACE pg_default;

create index IF not exists idx_notification_reads_user_key on public.notification_reads using btree (user_id, notification_key) TABLESPACE pg_default;

alter table public.notification_reads enable row level security;

create policy "Notification reads are readable by owner"
on public.notification_reads
for select
to authenticated
using (auth.uid() = user_id);

create policy "Notification reads are insertable by owner"
on public.notification_reads
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Notification reads are deleteable by owner"
on public.notification_reads
for delete
to authenticated
using (auth.uid() = user_id);


-- Profile enhancements
alter table public.profiles
add column if not exists avatar_url text,
add column if not exists church_name text;


-- User settings (preferences)
create table public.user_settings (
  user_id uuid not null primary key,
  low_stock_alerts boolean not null default true,
  weekly_reports boolean not null default true,
  system_updates boolean not null default false,
  theme text not null default 'system'::text,
  last_backup_at timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint user_settings_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete cascade
) TABLESPACE pg_default;

create index IF not exists idx_user_settings_user on public.user_settings using btree (user_id) TABLESPACE pg_default;

alter table public.user_settings enable row level security;

create policy "User settings are readable by owner"
on public.user_settings
for select
to authenticated
using (auth.uid() = user_id);

create policy "User settings are insertable by owner"
on public.user_settings
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "User settings are updateable by owner"
on public.user_settings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "User settings are deleteable by owner"
on public.user_settings
for delete
to authenticated
using (auth.uid() = user_id);

create or replace function public.set_updated_at_user_settings()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_settings_updated_at on public.user_settings;
create trigger trg_user_settings_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at_user_settings();


-- Storage policies (bucket: avatars)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar files read by owner"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid()::text = split_part(name, '/', 1)
);

create policy "Avatar files uploaded by owner"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = split_part(name, '/', 1)
);

create policy "Avatar files update by owner"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid()::text = split_part(name, '/', 1)
)
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = split_part(name, '/', 1)
);

create policy "Avatar files delete by owner"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid()::text = split_part(name, '/', 1)
);
