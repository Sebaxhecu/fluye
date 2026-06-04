import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet, Platform } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Colors } from './src/theme/colors';

export default function App() {
  return (
    <View style={styles.root}>
      <SafeAreaProvider style={styles.root}>
        <NavigationContainer>
          <AuthProvider>
            <AppNavigator />
            <StatusBar style="auto" backgroundColor={Colors.background} />
          </AuthProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    ...(Platform.OS === 'web' ? { height: '100vh' as any, width: '100vw' as any } : {}),
  },
});
