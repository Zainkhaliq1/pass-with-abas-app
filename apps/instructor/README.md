# Pass With Abas — Instructor App

The staff-facing app: see who's booked in, open up your own availability, and
view pupil details before each lesson. Built with Expo (React Native), backed
by the same shared Supabase database as the student app.

**Only give this app to real instructors** — anyone who signs up here
immediately appears as a bookable instructor in the student app. See
`../../supabase/README.md` for how to remove an account made by mistake.

## What it does
- **Sign up / Sign in** — instructors create an account with name, car, and
  transmission taught
- **Dashboard** — upcoming bookings grouped by day, with the pupil's name,
  experience level, and a one-tap call button; mark a lesson complete or
  cancel it
- **Availability** — add the exact dates/times you're free to teach (pupils
  can only book what you open here, so availability never gets overrun);
  remove a slot you haven't been booked for
- **Pupils** — the full list of everyone signed up, with contact details
- **Profile** — your own details, sign out

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go, same as the student app.

## Project structure
```
App.js                        Root component
src/
  theme/colors.js             Design tokens (same palette as the student app)
  lib/supabaseClient.js       Shared Supabase connection
  context/AuthContext.js      Sign up / sign in / session + instructor profile
  context/DataContext.js      Live bookings, own availability, pupil roster
  navigation/AppNavigator.js  Auth gate + bottom tab navigation
  screens/                    SignIn, SignUp, Dashboard, Availability, Pupils, Profile
  components/                 PrimaryButton, TextField
```

## Next steps
- Add push notifications when a pupil books or cancels a lesson.
- Add a simple calendar view instead of a flat list, once the instructor team grows.
