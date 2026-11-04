import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { authService } from '../services/authService';
import { tokenStorage } from '../services/tokenStorage';
import { StoredUser } from '../types';

interface AuthScreenProps {
  onAuthSuccess: (user: StoredUser) => void;
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);

  // Campos del formulario
  const [nickname, setNickname] = useState('');
  const [identifier, setIdentifier] = useState(''); // Email o Nickname en login / Email en registro
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert('Campos incompletos', 'Por favor, rellena todos los campos.');
      return;
    }

    if (isRegistering && !nickname.trim()) {
      Alert.alert('Campos incompletos', 'El nickname es obligatorio.');
      return;
    }

    try {
      setLoading(true);

      if (isRegistering) {
        // Modo Registro
        const response = await authService.register({
          nickname,
          email: identifier,
          password,
        });

        const user: StoredUser = {
          nickname: response.nickname,
          email: response.email,
          role: response.role,
        };

        await tokenStorage.saveAuthData(response.token, user);
        Alert.alert('¡Bienvenido!', `Cuenta creada con éxito como ${user.nickname}`);
        onAuthSuccess(user);
      } else {
        // Modo Login (acepta email o nickname en identifier)
        const response = await authService.login({
          identifier,
          password,
        });

        const user: StoredUser = {
          nickname: response.nickname,
          email: response.email,
          role: response.role,
        };

        await tokenStorage.saveAuthData(response.token, user);
        onAuthSuccess(user);
      }
    } catch (error: any) {
      Alert.alert('Error de autenticación', error.message || 'Credenciales no válidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.logo}>🥑</Text>
          <Text style={styles.title}>NutriCreater</Text>
          <Text style={styles.subtitle}>
            {isRegistering ? 'Crea tu cuenta para comenzar' : 'Inicia sesión con tu email o nickname'}
          </Text>

          {/* Campo Nickname (solo si se registra) */}
          {isRegistering && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nickname</Text>
              <TextInput
                style={styles.input}
                placeholder="ej: daniellozano"
                value={nickname}
                onChangeText={setNickname}
                autoCapitalize="none"
              />
            </View>
          )}

          {/* Campo Email / Identificador */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{isRegistering ? 'Email' : 'Email o Nickname'}</Text>
            <TextInput
              style={styles.input}
              placeholder={isRegistering ? 'tu@email.com' : 'Email o nickname...'}
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              keyboardType={isRegistering ? 'email-address' : 'default'}
            />
          </View>

          {/* Campo Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry // Oculta los caracteres con puntos
            />
          </View>

          {/* Botón principal */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>
                {isRegistering ? 'Registrarse' : 'Iniciar Sesión'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Botón para alternar entre Login y Registro */}
          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() => {
              setIsRegistering(!isRegistering);
              setPassword('');
            }}
          >
            <Text style={styles.switchBtnText}>
              {isRegistering
                ? '¿Ya tienes una cuenta? Inicia sesión'
                : '¿No tienes cuenta todavía? Regístrate gratis'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 24, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  logo: { fontSize: 48, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', color: '#1a1a1a' },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#dde2e5', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, backgroundColor: '#fafbfc' },
  submitBtn: { backgroundColor: '#2e7d32', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  switchBtn: { marginTop: 18, alignItems: 'center' },
  switchBtnText: { color: '#2e7d32', fontSize: 14, fontWeight: '500' },
});