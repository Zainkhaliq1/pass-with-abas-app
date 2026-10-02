# Pass With Abas

Two apps sharing one live backend, for the real driving school in Wakefield.

- **apps/student** — pupils sign up, browse instructors, and book real
  available lesson slots.
- **apps/instructor** — staff sign in, open up their own availability, see
  who's booked in, and view pupil contact details.
- **supabase/** — the shared database (schema + seed data) both apps talk to.
  See `supabase/README.md` for one-time setup.

Both apps are plain Expo (React Native) projects — run with Expo Go on
iPhone or Android.

## Running either app

```bash
cd apps/student      # or apps/instructor
npm install
npx expo start
```

Scan the QR code with Expo Go (iPhone: use the Camera app; Android: use the
scanner inside Expo Go).

## How they connect

Both apps use [Supabase](https://supabase.com) for the database, sign-in, and
real-time updates — a pupil booking a slot instantly disappears from every
other pupil's list, and shows up on the instructor's dashboard straight away.

The connection details are in each app's `src/lib/supabaseClient.js`. See
`supabase/README.md` for how the two apps and the database fit together, and
how to safely let new instructors sign up.

## Making changes going forward

This project lives on GitHub, so any future change — a new lesson type, a
design tweak, a new screen — can be made by editing these files and pushing.
Nothing is ever only "in a conversation" anymore.
