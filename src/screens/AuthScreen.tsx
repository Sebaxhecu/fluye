import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';

type Tab = 'login' | 'register';

export function AuthScreen() {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(''), 4000);
  };

  const handleLogin = async () => {
    if (!loginEmail.trim()) return showError('Ingresa tu correo electrónico.');
    if (!loginPassword) return showError('Ingresa tu contraseña.');
    setIsLoading(true);
    const result = await login(loginEmail.trim(), loginPassword);
    setIsLoading(false);
    if (!result.success) showError(result.error ?? 'Error al iniciar sesión.');
  };

  const handleRegister = async () => {
    if (!regName.trim()) return showError('Ingresa tu nombre.');
    if (!regEmail.includes('@')) return showError('Ingresa un correo válido.');
    if (regPassword.length < 6) return showError('La contraseña debe tener mínimo 6 caracteres.');
    if (regPassword !== regConfirm) return showError('Las contraseñas no coinciden.');
    setIsLoading(true);
    const result = await register(regName.trim(), regEmail.trim(), regPassword);
    setIsLoading(false);
    if (!result.success) showError(result.error ?? 'Error al registrarse.');
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>💰</Text>
        </View>
        <Text style={styles.logoText}>Fluye</Text>
        <Text style={styles.logoSub}>Gestión financiera para tu negocio</Text>
      </View>

      {/* Card */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'login' && styles.tabActive]}
              onPress={() => { setActiveTab('login'); setError(''); }}
            >
              <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>
                Iniciar Sesión
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'register' && styles.tabActive]}
              onPress={() => { setActiveTab('register'); setError(''); }}
            >
              <Text style={[styles.tabText, activeTab === 'register' && styles.tabTextActive]}>
                Registrarse
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error */}
          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

          {activeTab === 'login' ? (
            <View>
              <Text style={styles.formTitle}>Bienvenido de vuelta</Text>
              <Text style={styles.formSub}>Ingresa tus datos para continuar</Text>

              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="tu@correo.com"
                placeholderTextColor={Colors.textMuted}
                value={loginEmail}
                onChangeText={setLoginEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                value={loginPassword}
                onChangeText={setLoginPassword}
                secureTextEntry
              />

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.buttonText}>Iniciar Sesión</Text>
                }
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.formTitle}>Crea tu cuenta</Text>
              <Text style={styles.formSub}>Empieza a gestionar tus ventas hoy</Text>

              <Text style={styles.label}>Nombre completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu nombre"
                placeholderTextColor={Colors.textMuted}
                value={regName}
                onChangeText={setRegName}
                autoCapitalize="words"
              />

              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="tu@correo.com"
                placeholderTextColor={Colors.textMuted}
                value={regEmail}
                onChangeText={setRegEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={Colors.textMuted}
                value={regPassword}
                onChangeText={setRegPassword}
                secureTextEntry
              />

              <Text style={styles.label}>Confirmar contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Repite tu contraseña"
                placeholderTextColor={Colors.textMuted}
                value={regConfirm}
                onChangeText={setRegConfirm}
                secureTextEntry
              />

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.buttonText}>Crear Cuenta</Text>
                }
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'web' ? 48 : 60,
    paddingBottom: 48,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoEmoji: { fontSize: 32 },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
    marginBottom: 4,
  },
  logoSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginTop: -24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.divider,
    borderRadius: 12,
    padding: 3,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#fff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  formSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
