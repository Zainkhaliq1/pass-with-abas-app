# Supabase setup

This folder holds the database structure both apps share. You only need to touch
this once per Supabase project.

## 1. Run the schema

In your Supabase project: **SQL Editor → New query**, paste the contents of
`schema.sql`, and click **Run**. This creates all the tables, security rules,
and the two booking functions (`book_slot`, `cancel_booking`).

## 2. Run the seed

New query again, paste `seed.sql`, **Run**. This loads the current price list
(£40/hour lessons, £380 for a 10-hour block).

## 3. How instructor accounts work

There's no separate "make someone an instructor" step — anyone who signs up
through the **instructor app** becomes a real, bookable instructor automatically.
That's why the instructor app's sign-up screen says clearly that it's for staff
only. Practically:

- Only give the instructor app (or its Expo link/QR code) to your actual team.
- Each instructor creates their own account once, from their own phone.
- Their name, car and transmission immediately become visible to pupils in the
  student app.

If someone signs up by mistake, remove them in Supabase: **Table Editor →
instructors**, delete their row, then **Authentication → Users**, delete their
login too.

## 4. Where the keys live

Both apps have the project URL and a "publishable" (anon) key hardcoded in
`src/lib/supabaseClient.js`. This is safe — that key is meant to be public and
is restricted entirely by the Row Level Security policies in `schema.sql`. If
you ever rotate your Supabase keys, update both copies of that file.

## 5. Making changes to the schema later

Edit `schema.sql` (or add a new `.sql` file for a migration), paste it into the
SQL Editor, and run it. Supabase has no built-in migration tracking for a
project this size — just keep this folder's `.sql` files as the source of
truth and re-run what's changed.
