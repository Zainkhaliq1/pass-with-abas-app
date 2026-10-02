// Pass With Abas — design tokens
// Matches the school's real branding: black, white, and a vivid brand green.
export const colors = {
  asphalt: '#0E1210',      // near-black — headers, nav, hero (matches brand backgrounds)
  asphaltLight: '#1C2420',
  signal: '#7ED321',       // brand green — primary accent / CTAs
  brandGreen: '#7ED321',   // alias, used for the "Abas" wordmark treatment
  go: '#2E7D5B',           // confirmed / success (kept distinct from brand accent)
  goLight: '#E4F2EC',
  cloud: '#F4F5F7',        // app background
  card: '#FFFFFF',
  ink: '#181C19',          // body text
  inkMuted: '#6B7280',
  border: '#E4E6EA',
  danger: '#C0392B',
  dangerLight: '#FBEAE8',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};

export const type = {
  display: { fontSize: 30, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
  h1: { fontSize: 22, fontWeight: '700', color: colors.ink },
  h2: { fontSize: 18, fontWeight: '700', color: colors.ink },
  body: { fontSize: 15, fontWeight: '400', color: colors.ink },
  bodyMuted: { fontSize: 14, fontWeight: '400', color: colors.inkMuted },
  label: { fontSize: 13, fontWeight: '600', color: colors.inkMuted },
};
