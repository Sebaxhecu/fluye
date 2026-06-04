import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import { useSales } from '../hooks/useSales';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const { sales } = useSales();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name ?? '');
  const [editProfit, setEditProfit] = useState(
    String(user?.defaultProfitPercentage ?? 30)
  );
  const [isSaving, setIsSaving] = useState(false);

  const totalSales = sales.reduce((sum, s) => sum + s.salesAmount, 0);
  const totalProfit = sales.reduce((sum, s) => sum + s.profitAmount, 0);
  const avgMargin =
    totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : '0';

  const memberSince = user?.createdAt
    ? (() => {
        const label = format(parseISO(user.createdAt), "MMMM 'de' yyyy", { locale: es });
        return label.charAt(0).toUpperCase() + label.slice(1);
      })()
    : '—';

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Campo requerido', 'El nombre no puede estar vacío.');
      return;
    }
    const profitNum = parseFloat(editProfit.replace(',', '.'));
    if (isNaN(profitNum) || profitNum < 0 || profitNum > 100) {
      Alert.alert('Valor inválido', 'El porcentaje de ganancia debe ser entre 0 y 100.');
      return;
    }
    setIsSaving(true);
    await updateUser({ name: editName.trim(), defaultProfitPercentage: profitNum });
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const cancelEdit = () => {
    setEditName(user?.name ?? '');
    setEditProfit(String(user?.defaultProfitPercentage ?? 30));
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Header */}
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </Text>
            </View>
            <Text style={styles.headerName}>{user?.name ?? 'Usuario'}</Text>
            <Text style={styles.headerEmail}>{user?.email ?? ''}</Text>
            <Text style={styles.headerSince}>Miembro desde {memberSince}</Text>
          </LinearGradient>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{sales.length}</Text>
              <Text style={styles.statLabel}>Días registrados</Text>
            </View>
            <View style={[styles.statCard, styles.statCardMiddle]}>
              <Text style={styles.statValue}>{formatCurrency(totalSales)}</Text>
              <Text style={styles.statLabel}>Ventas totales</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: Colors.success }]}>{avgMargin}%</Text>
              <Text style={styles.statLabel}>Margen promedio</Text>
            </View>
          </View>

          {/* Profile section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Información personal</Text>
              {!isEditing ? (
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Text style={styles.editLink}>Editar</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {isEditing ? (
              <View style={styles.editForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nombre completo</Text>
                  <TextInput
                    style={styles.input}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Tu nombre"
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="words"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>% Ganancia predeterminado</Text>
                  <View style={styles.percentInputWrapper}>
                    <TextInput
                      style={[styles.input, styles.percentInput]}
                      value={editProfit}
                      onChangeText={setEditProfit}
                      placeholder="30"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="decimal-pad"
                    />
                    <Text style={styles.percentSuffix}>%</Text>
                  </View>
                  <Text style={styles.inputHint}>
                    Se usará como valor predeterminado al registrar ventas.
                  </Text>
                </View>
                <View style={styles.editActions}>
                  <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveButton, isSaving && styles.buttonDisabled]}
                    onPress={handleSaveProfile}
                    disabled={isSaving}
                  >
                    <LinearGradient
                      colors={[Colors.gradientStart, Colors.gradientEnd]}
                      style={styles.saveButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.saveButtonText}>
                        {isSaving ? 'Guardando...' : 'Guardar'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.infoList}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>👤</Text>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Nombre</Text>
                    <Text style={styles.infoValue}>{user?.name ?? '—'}</Text>
                  </View>
                </View>
                <View style={[styles.infoRow, styles.infoRowLast]}>
                  <Text style={styles.infoIcon}>📊</Text>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Ganancia predeterminada</Text>
                    <Text style={styles.infoValue}>
                      {user?.defaultProfitPercentage ?? 30}%
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Account section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cuenta</Text>
            <View style={styles.infoList}>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>✉️</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Correo electrónico</Text>
                  <Text style={styles.infoValue}>{user?.email ?? '—'}</Text>
                </View>
              </View>
              <View style={[styles.infoRow, styles.infoRowLast]}>
                <Text style={styles.infoIcon}>📅</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Miembro desde</Text>
                  <Text style={styles.infoValue}>{memberSince}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>

          <Text style={styles.version}>Fluye v1.0.0</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  headerSince: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  statCardMiddle: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    ...Typography.h4,
    marginBottom: 0,
  },
  editLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  infoList: {},
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 28,
    textAlign: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  editForm: {},
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    ...Typography.labelLarge,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  percentInputWrapper: {
    position: 'relative',
  },
  percentInput: {
    paddingRight: 40,
  },
  percentSuffix: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    textAlignVertical: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    lineHeight: 46,
  },
  inputHint: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
  editActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: Colors.divider,
    borderRadius: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 13,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    backgroundColor: Colors.errorLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.error,
  },
  version: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 12,
    color: Colors.textMuted,
  },
});
