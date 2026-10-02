# Pass With Abas — Driving School App

A cross-platform (iPhone + Android) booking app built with **Expo** and React Native.

## What it does
- **Home** — hero intro, next upcoming lesson, quick "Book a lesson" CTA
- **Instructors** — browse instructors with ratings, specialties, transmission type
- **Book** — 4-step flow: pick instructor → pick lesson type → pick date/time → confirm
- **My Lessons** — view and cancel upcoming bookings (persisted on-device)
- **Profile** — school contact info and settings

Bookings are stored locally on the device with `AsyncStorage`, so they persist between
app launches. Availability and instructors are mock data in `src/data/mockData.js` —
swap that file for real API calls once you have a backend.

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

The app will load directly on your phone — no App Store submission needed for testing.

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
App.js                      Root component
src/
  theme/colors.js           Design tokens (colors, spacing, type)
  data/mockData.js          Instructors + generated availability (replace with API)
  context/BookingContext.js Booking state + AsyncStorage persistence
  navigation/AppNavigator.js Bottom tab navigation
  screens/                  Home, Instructors, Book, MyLessons, Profile
  components/               PrimaryButton, InstructorCard, LessonCard
```

## Next steps to make this production-ready
- Replace mock data with a real backend (e.g. a small API + database) so instructors,
  availability, and bookings sync across devices instead of living only on-device.
- Add authentication (sign up / log in) so bookings are tied to a real student account.
- Add push notifications for lesson reminders (`expo-notifications`).
- Add payment collection at booking time (e.g. Stripe).
