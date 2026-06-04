import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

type Tab = 'login' | 'register';

export function AuthScreen() {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [isLoading, setIsLoading] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [loginShowPass, setLoginShowPass] = useState(false);
  const [regShowPass, setRegShowPass] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    Animated.spring(slideAnim, {
      toValue: tab === 'login' ? 0 : 1,
      useNativeDriver: false,
      tension: 80,
      friction: 12,
    }).start();
  };

  const handleLogin = async () => {
    if (!loginEmail.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa tu correo electrónico.');
      return;
    }
    if (!loginPassword) {
      Alert.alert('Campo requerido', 'Por favor ingresa tu contraseña.');
      return;
    }
    setIsLoading(true);
    const result = await login(loginEmail.trim(), loginPassword);
    setIsLoading(false);
    if (!result.success) {
      Alert.alert('Error al iniciar sesión', result.error ?? 'Intenta de nuevo.');
    }
  };

  const handleRegister = async () => {
    if (!regName.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa tu nombre.');
      return;
    }
    if (!regEmail.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa tu correo electrónico.');
      return;
    }
    if (!regEmail.includes('@')) {
      Alert.alert('Correo inválido', 'Ingresa un correo electrónico válido.');
      return;
    }
    if (regPassword.length < 6) {
      Alert.alert('Contraseña muy corta', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      Alert.alert('Contraseñas no coinciden', 'Las contraseñas ingresadas no son iguales.');
      return;
    }
    setIsLoading(true);
    const result = await register(regName.trim(), regEmail.trim(), regPassword);
    setIsLoading(false);
    if (!result.success) {
      Alert.alert('Error al registrarse', result.error ?? 'Intenta de nuevo.');
    }
  };

  const indicatorLeft = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['2%', '50%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        style={styles.topGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.logoSection}>
          <View style={styles.logoIconWrapper}>
            <Text style={styles.logoIcon}>💰</Text>
          </View>
          <Text style={styles.logoText}>Fluye</Text>
          <Text style={styles.logoTagline}>Gestión financiera para tu negocio</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {/* Tab bar */}
            <View style={styles.tabBar}>
              <Animated.View style={[styles.tabIndicator, { left: indicatorLeft }]} />
              <TouchableOpacity
                style={styles.tab}
                onPress={() => switchTab('login')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>
                  Iniciar Sesión
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tab}
                onPress={() => switchTab('register')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, activeTab === 'register' && styles.tabTextActive]}>
                  Registrarse
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'login' ? (
              <View style={styles.form}>
                <Text style={styles.formTitle}>Bienvenido de vuelta</Text>
                <Text style={styles.formSubtitle}>Ingresa tus datos para continuar</Text>

                <View style={styles.inputGroup}>
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
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contraseña</Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="••••••••"
                      placeholderTextColor={Colors.textMuted}
                      value={loginPassword}
                      onChangeText={setLoginPassword}
                      secureTextEntry={!loginShowPass}
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setLoginShowPass((v) => !v)}
                    >
                      <Text style={styles.eyeIcon}>{loginShowPass ? '🙈' : '👁'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[Colors.gradientStart, Colors.gradientEnd]}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Iniciar Sesión</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.form}>
                <Text style={styles.formTitle}>Crea tu cuenta</Text>
                <Text style={styles.formSubtitle}>Empieza a gestionar tus ventas hoy</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nombre completo</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Tu nombre"
                    placeholderTextColor={Colors.textMuted}
                    value={regName}
                    onChangeText={setRegName}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.inputGroup}>
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
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contraseña</Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="Mínimo 6 caracteres"
                      placeholderTextColor={Colors.textMuted}
                      value={regPassword}
                      onChangeText={setRegPassword}
                      secureTextEntry={!regShowPass}
                      returnKeyType="next"
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setRegShowPass((v) => !v)}
                    >
                      <Text style={styles.eyeIcon}>{regShowPass ? '🙈' : '👁'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirmar contraseña</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Repite tu contraseña"
                    placeholderTextColor={Colors.textMuted}
                    value={regConfirmPassword}
                    onChangeText={setRegConfirmPassword}
                    secureTextEntry={true}
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                  onPress={handleRegister}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[Colors.gradientStart, Colors.gradientEnd]}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Crear Cuenta</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
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
  topGradient: {
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: 'center',
  },
  logoIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoIcon: {
    fontSize: 32,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 4,
  },
  logoTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '400',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 32,
    marginTop: -20,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 24,
    padding: 24,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.divider,
    borderRadius: 12,
    padding: 3,
    marginBottom: 24,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 3,
    width: '48%',
    bottom: 3,
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    zIndex: 1,
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
  form: {
    gap: 0,
  },
  formTitle: {
    ...Typography.h2,
    marginBottom: 4,
  },
  formSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    ...Typography.labelLarge,
    marginBottom: 6,
    color: Colors.textPrimary,
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
  },
  passwordWrapper: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 52,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeIcon: {
    fontSize: 18,
  },
  primaryButton: {
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    ...Typography.buttonLarge,
    color: '#FFFFFF',
  },
});
