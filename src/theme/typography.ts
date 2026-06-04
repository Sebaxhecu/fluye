import { TextStyle } from 'react-native';
import { Colors } from './colors';

export const Typography: Record<string, TextStyle> = {
  // Display
  displayLarge: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },

  // Headings
  h1: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    color: Colors.textPrimary,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    color: Colors.textPrimary,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    color: Colors.textPrimary,
  },
  h4: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: Colors.textPrimary,
  },

  // Body
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    color: Colors.textSecondary,
  },

  // Labels
  labelLarge: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  labelMedium: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 16,
    color: Colors.textMuted,
  },

  // Numeric / financial
  amountLarge: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 36,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  amountMedium: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    color: Colors.textPrimary,
  },
  amountSmall: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    color: Colors.textPrimary,
  },

  // Button text
  buttonLarge: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    color: Colors.textOnPrimary,
  },
  buttonMedium: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: Colors.textOnPrimary,
  },
};
