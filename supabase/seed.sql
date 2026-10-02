-- Pass With Abas — seed data
-- Run this AFTER schema.sql, once, in the Supabase SQL Editor.
-- Safe to re-run: uses upsert (on conflict ... do update).

insert into public.lesson_types (id, label, duration, price, sort_order) values
  ('beginner',    'Beginner Lesson',          '1 hour',   40,  1),
  ('manual',      'Manual Driving Lesson',    '1 hour',   40,  2),
  ('automatic',   'Automatic Driving Lesson', '1 hour',   40,  3),
  ('refresher',   'Refresher Lesson',         '1 hour',   40,  4),
  ('motorway',    'Motorway Driving Course',  '2 hours',  80,  5),
  ('advanced',    'Advanced Driving Course',  '2 hours',  80,  6),
  ('pass-plus',   'Pass Plus Course',         '2 hours',  80,  7),
  ('block-10',    '10-Hour Block Booking',    '10 hours', 380, 8)
on conflict (id) do update set
  label = excluded.label,
  duration = excluded.duration,
  price = excluded.price,
  sort_order = excluded.sort_order;

-- Instructors are NOT seeded here on purpose: each one needs a real Supabase Auth
-- account (so they can log into the instructor app), which this script can't create.
-- See supabase/README.md for how to create their accounts and link them to this table.
