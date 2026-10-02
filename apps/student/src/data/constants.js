// Small constants that aren't worth a database round-trip.

// Real cancellation policy from Pass With Abas Terms & Conditions.
export const CANCELLATION_POLICY =
  "Lessons cancelled or rearranged with less than 48 hours' notice are charged at the full lesson cost. " +
  'For intensive courses or block bookings, at least one week\'s notice is required for cancellations or significant changes. ' +
  'Administrative fees may apply.';

// Instructors in the database don't carry a UI color, so pick one
// deterministically from their id — keeps each instructor's avatar a
// consistent color across screens without storing design detail in SQL.
const AVATAR_COLORS = ['#0E1210', '#2E7D5B', '#4B5563', '#1F2A24', '#6B8E23', '#3B7A3B', '#5B6B5E', '#7ED321'];
export function colorForInstructor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
