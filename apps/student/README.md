# Pass With Abas — Student App

The pupil-facing app: sign up, browse instructors, and book real available
lesson slots. Built with Expo (React Native), backed by a shared Supabase
database (see `../../supabase/README.md`).

## What it does
- **Sign up / Sign in** — pupils create an account with name, phone, address
  and driving experience
- **Home** — welcome back, next upcoming lesson, quick "Book a lesson" CTA
- **Instructors** — browse real instructors (car, transmission, experience)
- **Book** — 4-step flow: pick instructor → pick lesson type → pick a real
  open time slot → confirm (this books atomically — two pupils can never grab
  the same slot)
- **My Lessons** — view and cancel upcoming bookings, synced live
- **Profile** — your own details, school contact info, sign out

## Run it (both iPhone and Android)

1. Install [Node.js](https://nodejs.org) (LTS) if you don't have it.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npx expo start
   ```
4. On your phone, install the **Expo Go** app (App Store / Google Play).
5. Scan the QR code shown in the terminal / browser with:
   - **iPhone**: the Camera app (it will prompt to open in Expo Go)
   - **Android**: the Expo Go app's built-in scanner

## Building real installable apps later
When you're ready to publish to the App Store / Google Play, use
[EAS Build](https://docs.expo.dev/build/introduction/):
```bash
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

## Project structure
```
App.js                        Root component
src/
  theme/colors.js             Design tokens (colors, spacing, type)
  lib/supabaseClient.js       Shared Supabase connection
  data/constants.js           Cancellation policy text + avatar color helper
  context/AuthContext.js      Sign up / sign in / session + pupil profile
  context/BookingContext.js   Live instructors, lesson types, availability, bookings
  navigation/AppNavigator.js  Auth gate + bottom tab navigation
  screens/                    SignIn, SignUp, Home, Instructors, Book, MyLessons, Profile
  components/                 PrimaryButton, TextField, InstructorCard, LessonCard
```

## Next steps
- Add push notifications for lesson reminders (`expo-notifications`).
- Add payment collection at booking time (e.g. Stripe).
- Add password reset (Supabase supports this out of the box — `supabase.auth.resetPasswordForEmail`).
