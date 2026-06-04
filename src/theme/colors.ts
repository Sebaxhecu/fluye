export const Colors = {
  // Primary palette
  primary: '#1A56DB',
  primaryLight: '#3B82F6',
  primaryVeryLight: '#EFF6FF',
  primaryDark: '#1E3A5F',

  // Backgrounds
  background: '#F8FAFF',
  cardBackground: '#FFFFFF',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textOnPrimary: '#FFFFFF',

  // Semantic
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',

  // UI elements
  border: '#E2E8F0',
  borderFocus: '#1A56DB',
  divider: '#F1F5F9',
  inputBackground: '#F8FAFF',

  // Shadows
  shadowColor: '#0F172A',

  // Gradient stops
  gradientStart: '#1A56DB',
  gradientEnd: '#3B82F6',
} as const;

export type ColorKey = keyof typeof Colors;
