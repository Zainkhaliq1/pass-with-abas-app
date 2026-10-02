// Mock data so the app is usable end-to-end without a backend.
// Swap this for real API calls once Pass With Abas has a server.

// Real team from passwithabas.co.uk/our-team. The site doesn't publish
// per-instructor years of experience or ratings (beyond Abas as founder,
// and Zain at 1 year as you confirmed), so those fields are left out
// rather than invented — add them here once you have the real numbers.
export const INSTRUCTORS = [
  {
    id: 'abas',
    name: 'Abas',
    title: 'Founder & Lead Instructor',
    years: 19,
    bio: '19 years teaching learners across Wakefield, with over 2,500 test passes.',
    transmission: ['Manual'],
    car: 'Audi A3',
    color: '#0E1210',
  },
  {
    id: 'haleema',
    name: 'Haleema',
    title: 'Instructor',
    transmission: ['Automatic'],
    car: 'Toyota Yaris Hybrid',
    color: '#2E7D5B',
  },
  {
    id: 'imran',
    name: 'Imran',
    title: 'Instructor',
    transmission: ['Manual'],
    car: 'VW Golf',
    color: '#4B5563',
  },
  {
    id: 'ali',
    name: 'Ali',
    title: 'Instructor',
    transmission: ['Manual'],
    car: 'Mercedes-Benz A-Class',
    color: '#1F2A24',
  },
  {
    id: 'khubaiba',
    name: 'Khubaiba Khan',
    title: 'Instructor',
    transmission: ['Automatic'],
    car: 'Toyota Yaris',
    color: '#6B8E23',
  },
  {
    id: 'zain',
    name: 'Zain',
    title: 'Instructor',
    years: 1,
    bio: 'Newest member of the team — enthusiastic, patient, and great with complete beginners.',
    transmission: ['Automatic'],
    car: 'Toyota Corolla',
    color: '#3B7A3B',
  },
  {
    id: 'flimon',
    name: 'Flimon',
    title: 'Instructor',
    transmission: ['Automatic'],
    car: 'Toyota Corolla',
    color: '#5B6B5E',
  },
];

// Generates the next N weekdays with a few open slots each, so the app
// always shows "available" times relative to today.
export function generateAvailability(days = 10) {
  const times = ['08:00', '10:00', '12:30', '15:00', '17:30'];
  const out = [];
  const today = new Date();
  let added = 0;
  let offset = 1;
  while (added < days) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    offset += 1;
    const day = d.getDay();
    if (day === 0) continue; // skip Sunday
    const dateStr = d.toISOString().slice(0, 10);
    INSTRUCTORS.forEach((instr) => {
      times.forEach((t, i) => {
        // deterministic pseudo-availability so it looks realistic but stable
        const seed = (d.getDate() + instr.id.length + i) % 3;
        if (seed !== 0) {
          out.push({
            id: `${instr.id}-${dateStr}-${t}`,
            instructorId: instr.id,
            date: dateStr,
            time: t,
          });
        }
      });
    });
    added += 1;
  }
  return out;
}

// Real cancellation policy from Pass With Abas Terms & Conditions.
export const CANCELLATION_POLICY =
  "Lessons cancelled or rearranged with less than 48 hours' notice are charged at the full lesson cost. " +
  'For intensive courses or block bookings, at least one week\'s notice is required for cancellations or significant changes. ' +
  'Administrative fees may apply.';

// Real pricing: £40/hour, £380 for a 10-hour block.
export const LESSON_TYPES = [
  { id: 'beginner', label: 'Beginner Lesson', duration: '1 hour', price: 40 },
  { id: 'manual', label: 'Manual Driving Lesson', duration: '1 hour', price: 40 },
  { id: 'automatic', label: 'Automatic Driving Lesson', duration: '1 hour', price: 40 },
  { id: 'refresher', label: 'Refresher Lesson', duration: '1 hour', price: 40 },
  { id: 'motorway', label: 'Motorway Driving Course', duration: '2 hours', price: 80 },
  { id: 'advanced', label: 'Advanced Driving Course', duration: '2 hours', price: 80 },
  { id: 'pass-plus', label: 'Pass Plus Course', duration: '2 hours', price: 80 },
  { id: 'block-10', label: '10-Hour Block Booking', duration: '10 hours', price: 380 },
];
