-- Pass With Abas — shared database schema
-- Run this once in your Supabase project's SQL Editor (Dashboard → SQL Editor → New query → paste → Run).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE throughout.

-- ========== INSTRUCTORS ==========
-- One row per instructor, linked 1:1 to a Supabase Auth user (created on sign-up in the instructor app,
-- but you should only share the instructor app's sign-up with real staff).
-- Created before PUPILS because the pupils policies below reference this table.
create table if not exists public.instructors (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  car text,
  transmission text[] not null default '{}', -- e.g. '{Manual}' or '{Automatic}'
  years_experience int,
  created_at timestamptz not null default now()
);

alter table public.instructors enable row level security;

drop policy if exists "Anyone signed in can view instructors" on public.instructors;
create policy "Anyone signed in can view instructors" on public.instructors
  for select using (auth.role() = 'authenticated');

drop policy if exists "Instructors can update own profile" on public.instructors;
create policy "Instructors can update own profile" on public.instructors
  for update using (auth.uid() = id);

drop policy if exists "Instructors can insert own profile" on public.instructors;
create policy "Instructors can insert own profile" on public.instructors
  for insert with check (auth.uid() = id);


-- ========== PUPILS (students) ==========
-- One row per pupil, linked 1:1 to a Supabase Auth user (created on sign-up in the student app).
create table if not exists public.pupils (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  address text,
  experience text, -- e.g. "Complete beginner", "A few lessons before", "Failed test once"
  created_at timestamptz not null default now()
);

alter table public.pupils enable row level security;

drop policy if exists "Pupils can view own profile" on public.pupils;
create policy "Pupils can view own profile" on public.pupils
  for select using (auth.uid() = id);

drop policy if exists "Pupils can update own profile" on public.pupils;
create policy "Pupils can update own profile" on public.pupils
  for update using (auth.uid() = id);

drop policy if exists "Pupils can insert own profile" on public.pupils;
create policy "Pupils can insert own profile" on public.pupils
  for insert with check (auth.uid() = id);

drop policy if exists "Instructors can view all pupils" on public.pupils;
create policy "Instructors can view all pupils" on public.pupils
  for select using (exists (select 1 from public.instructors i where i.id = auth.uid()));


-- ========== LESSON TYPES ==========
-- Editable price list, shared by both apps.
create table if not exists public.lesson_types (
  id text primary key,
  label text not null,
  duration text not null,
  price numeric not null,
  sort_order int not null default 0
);

alter table public.lesson_types enable row level security;

drop policy if exists "Anyone can view lesson types" on public.lesson_types;
create policy "Anyone can view lesson types" on public.lesson_types
  for select using (true);


-- ========== AVAILABILITY SLOTS ==========
-- An instructor opens a slot; a pupil books it. 'status' moves open -> booked (or -> cancelled if the
-- instructor removes it before anyone books).
create table if not exists public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.instructors(id) on delete cascade,
  date date not null,
  time text not null, -- e.g. "10:00"
  status text not null default 'open' check (status in ('open', 'booked', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists idx_availability_instructor_date on public.availability_slots(instructor_id, date);

alter table public.availability_slots enable row level security;

drop policy if exists "Anyone signed in can view open slots" on public.availability_slots;
create policy "Anyone signed in can view open slots" on public.availability_slots
  for select using (auth.role() = 'authenticated');

drop policy if exists "Instructors manage own slots" on public.availability_slots;
create policy "Instructors manage own slots" on public.availability_slots
  for all using (auth.uid() = instructor_id) with check (auth.uid() = instructor_id);


-- ========== BOOKINGS ==========
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.availability_slots(id) on delete cascade,
  pupil_id uuid not null references public.pupils(id) on delete cascade,
  instructor_id uuid not null references public.instructors(id) on delete cascade,
  lesson_type_id text not null references public.lesson_types(id),
  price numeric not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

drop policy if exists "Pupils view own bookings" on public.bookings;
create policy "Pupils view own bookings" on public.bookings
  for select using (auth.uid() = pupil_id);

drop policy if exists "Instructors view their bookings" on public.bookings;
create policy "Instructors view their bookings" on public.bookings
  for select using (auth.uid() = instructor_id);

drop policy if exists "Instructors update their bookings" on public.bookings;
create policy "Instructors update their bookings" on public.bookings
  for update using (auth.uid() = instructor_id);


-- ========== RPC: book_slot ==========
-- Atomically books an open slot so two pupils can never grab the same slot at once.
-- Call from the app as: supabase.rpc('book_slot', { p_slot_id, p_lesson_type_id })
create or replace function public.book_slot(p_slot_id uuid, p_lesson_type_id text)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slot public.availability_slots;
  v_lesson public.lesson_types;
  v_booking public.bookings;
begin
  -- Lock the slot row so concurrent requests queue instead of racing.
  select * into v_slot from public.availability_slots where id = p_slot_id for update;

  if v_slot is null then
    raise exception 'Slot not found';
  end if;

  if v_slot.status <> 'open' then
    raise exception 'This slot has already been booked';
  end if;

  select * into v_lesson from public.lesson_types where id = p_lesson_type_id;
  if v_lesson is null then
    raise exception 'Unknown lesson type';
  end if;

  update public.availability_slots set status = 'booked' where id = p_slot_id;

  insert into public.bookings (slot_id, pupil_id, instructor_id, lesson_type_id, price)
  values (p_slot_id, auth.uid(), v_slot.instructor_id, p_lesson_type_id, v_lesson.price)
  returning * into v_booking;

  return v_booking;
end;
$$;


-- ========== RPC: cancel_booking ==========
-- Cancels a booking and re-opens its slot, in one transaction.
create or replace function public.cancel_booking(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings;
begin
  select * into v_booking from public.bookings where id = p_booking_id for update;

  if v_booking is null then
    raise exception 'Booking not found';
  end if;

  if v_booking.pupil_id <> auth.uid() and v_booking.instructor_id <> auth.uid() then
    raise exception 'Not authorized to cancel this booking';
  end if;

  update public.bookings set status = 'cancelled' where id = p_booking_id;
  update public.availability_slots set status = 'open' where id = v_booking.slot_id;
end;
$$;
