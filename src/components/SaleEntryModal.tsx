import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { SaleEntry } from '../types';

interface SaleEntryModalProps {
  visible: boolean;
  date: string;
  existingEntry?: SaleEntry;
  defaultProfitPercentage: number;
  onSave: (salesAmount: number, profitPercentage: number) => Promise<void>;
  onClose: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function parseCurrencyInput(text: string): number {
  const cleaned = text.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function SaleEntryModal({
  visible,
  date,
  existingEntry,
  defaultProfitPercentage,
  onSave,
  onClose,
}: SaleEntryModalProps) {
  const [salesInput, setSalesInput] = useState('');
  const [profitInput, setProfitInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [salesFocused, setSalesFocused] = useState(false);
  const [profitFocused, setProfitFocused] = useState(false);

  const slideAnim = useRef(new Animated.Value(400)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset form
      if (existingEntry) {
        setSalesInput(String(existingEntry.salesAmount));
        setProfitInput(String(existingEntry.profitPercentage));
      } else {
        setSalesInput('');
        setProfitInput(String(defaultProfitPercentage));
      }

      // Animate in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 400,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, existingEntry, defaultProfitPercentage]);

  const salesAmount = parseCurrencyInput(salesInput);
  const profitPercentage = parseFloat(profitInput.replace(',', '.')) || 0;
  const estimatedProfit = (salesAmount * profitPercentage) / 100;

  const formattedDate = (() => {
    try {
      const parsed = parseISO(date);
      const label = format(parsed, "EEEE d 'de' MMMM", { locale: es });
      return label.charAt(0).toUpperCase() + label.slice(1);
    } catch {
      return date;
    }
  })();

  const handleSave = async () => {
    if (salesAmount <= 0) {
      return;
    }
    const pct = Math.max(0, Math.min(100, profitPercentage));
    setIsSaving(true);
    try {
      await onSave(salesAmount, pct);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSalesChange = (text: string) => {
    // Allow only numbers and dot
    const filtered = text.replace(/[^0-9.]/g, '');
    setSalesInput(filtered);
  };

  const handleProfitChange = (text: string) => {
    const filtered = text.replace(/[^0-9.,]/g, '');
    setProfitInput(filtered);
  };

  const isValid = salesAmount > 0 && profitPercentage >= 0 && profitPercentage <= 100;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>
                {existingEntry ? 'Editar entrada' : 'Nueva entrada'}
              </Text>
              <Text style={styles.headerDate}>{formattedDate}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Sales input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ventas del día</Text>
              <View
                style={[
                  styles.inputWrapper,
                  salesFocused && styles.inputWrapperFocused,
                  salesAmount > 0 && !salesFocused && styles.inputWrapperValid,
                ]}
              >
                <Text style={styles.currencyPrefix}>$</Text>
                <TextInput
                  style={styles.input}
                  value={salesInput}
                  onChangeText={handleSalesChange}
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  returnKeyType="next"
                  onFocus={() => setSalesFocused(true)}
                  onBlur={() => setSalesFocused(false)}
                />
                {salesAmount > 0 && (
                  <Text style={styles.inputPreview}>{formatCurrency(salesAmount)}</Text>
                )}
              </View>
              <Text style={styles.inputHint}>Ingresa el total de ventas del día en COP</Text>
            </View>

            {/* Profit percentage */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Porcentaje de ganancia</Text>
              <View
                style={[
                  styles.inputWrapper,
                  profitFocused && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  style={[styles.input, { paddingLeft: 16 }]}
                  value={profitInput}
                  onChangeText={handleProfitChange}
                  placeholder="30"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  onFocus={() => setProfitFocused(true)}
                  onBlur={() => setProfitFocused(false)}
                  onSubmitEditing={handleSave}
                />
                <Text style={styles.percentSuffix}>%</Text>
              </View>
              <Text style={styles.inputHint}>
                Porcentaje de tu margen de ganancia (predeterminado: {defaultProfitPercentage}%)
              </Text>
            </View>

            {/* Calculated profit */}
            <View style={[styles.profitCard, salesAmount > 0 && styles.profitCardActive]}>
              <View style={styles.profitCardRow}>
                <Text style={styles.profitCardLabel}>Ganancia estimada:</Text>
                <Text
                  style={[
                    styles.profitCardAmount,
                    salesAmount > 0 && styles.profitCardAmountActive,
                  ]}
                >
                  {salesAmount > 0 ? formatCurrency(estimatedProfit) : '—'}
                </Text>
              </View>
              {salesAmount > 0 && (
                <Text style={styles.profitCardBreakdown}>
                  {formatCurrency(salesAmount)} × {profitPercentage}% = {formatCurrency(estimatedProfit)}
                </Text>
              )}
            </View>

            {/* Save button */}
            <TouchableOpacity
              style={[styles.saveButton, (!isValid || isSaving) && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!isValid || isSaving}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={
                  isValid && !isSaving
                    ? [Colors.gradientStart, Colors.gradientEnd]
                    : [Colors.border, Colors.border]
                }
                style={styles.saveButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.saveButtonText, !isValid && styles.saveButtonTextDisabled]}>
                    {existingEntry ? '✅ Actualizar entrada' : '✅ Guardar entrada'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  sheet: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
    maxHeight: '90%',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerTitle: {
    ...Typography.h3,
    marginBottom: 2,
  },
  headerDate: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontSize: 13,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    ...Typography.labelLarge,
    marginBottom: 8,
    color: Colors.textPrimary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    overflow: 'hidden',
  },
  inputWrapperFocused: {
    borderColor: Colors.borderFocus,
    backgroundColor: Colors.primaryVeryLight,
  },
  inputWrapperValid: {
    borderColor: Colors.success,
  },
  currencyPrefix: {
    paddingLeft: 16,
    paddingRight: 4,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  inputPreview: {
    paddingRight: 14,
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  percentSuffix: {
    paddingRight: 16,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  inputHint: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 5,
  },
  profitCard: {
    backgroundColor: Colors.divider,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  profitCardActive: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success,
  },
  profitCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profitCardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  profitCardAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  profitCardAmountActive: {
    color: Colors.success,
  },
  profitCardBreakdown: {
    fontSize: 12,
    color: Colors.success,
    marginTop: 6,
    fontWeight: '500',
  },
  saveButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    ...Typography.buttonLarge,
    color: '#FFFFFF',
  },
  saveButtonTextDisabled: {
    color: Colors.textSecondary,
  },
});
