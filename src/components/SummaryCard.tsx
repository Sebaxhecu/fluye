import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

interface SummaryCardProps {
  title: string;
  amount: string;
  subtitle?: string;
  variant?: 'default' | 'gradient' | 'success';
  style?: ViewStyle;
  icon?: string;
}

export function SummaryCard({
  title,
  amount,
  subtitle,
  variant = 'default',
  style,
  icon,
}: SummaryCardProps) {
  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, styles.gradientCard, style]}
      >
        <View style={styles.cardInner}>
          {icon ? <Text style={styles.iconGradient}>{icon}</Text> : null}
          <Text style={[styles.titleGradient]}>{title}</Text>
          <Text style={[styles.amountGradient]}>{amount}</Text>
          {subtitle ? <Text style={styles.subtitleGradient}>{subtitle}</Text> : null}
        </View>
      </LinearGradient>
    );
  }

  if (variant === 'success') {
    return (
      <View style={[styles.card, styles.successCard, style]}>
        <View style={styles.cardInner}>
          {icon ? <Text style={styles.iconSuccess}>{icon}</Text> : null}
          <Text style={[styles.title, { color: Colors.success }]}>{title}</Text>
          <Text style={[styles.amount, { color: Colors.success }]}>{amount}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, styles.defaultCard, style]}>
      <View style={styles.cardInner}>
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.amount}>{amount}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    flex: 1,
    minHeight: 110,
  },
  gradientCard: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  successCard: {
    backgroundColor: Colors.successLight,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  defaultCard: {
    backgroundColor: Colors.cardBackground,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardInner: {
    flex: 1,
    justifyContent: 'space-between',
  },
  icon: {
    fontSize: 22,
    marginBottom: 6,
  },
  iconGradient: {
    fontSize: 22,
    marginBottom: 6,
  },
  iconSuccess: {
    fontSize: 22,
    marginBottom: 6,
  },
  title: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  titleGradient: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  amount: {
    ...Typography.amountMedium,
    color: Colors.textPrimary,
  },
  amountGradient: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  subtitle: {
    ...Typography.bodySmall,
    marginTop: 4,
  },
  subtitleGradient: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
});
