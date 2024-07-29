import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { usePreventScreenCapture } from 'expo-screen-capture';

const LoginScreen: React.FC = () => {
  usePreventScreenCapture();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Error', 'Por favor, ingresa tu correo/nombre de usuario y contraseña.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://api-gateway.zapto.org:5000/users-api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      setLoading(false);

      if (response.ok) {
        const data = await response.json();
        const accessToken = data.access_token;
        const username = data.username;

        await AsyncStorage.setItem('jwtToken', accessToken);
        await AsyncStorage.setItem('username', username);

        router.push('/home');
      } else {
        const errorData = await response.json();
        Alert.alert('Error en la autenticación', errorData.message || 'Identificador o contraseña incorrectos.');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error al iniciar sesión', 'Ocurrió un error al intentar iniciar sesión. Por favor, intenta nuevamente.');
      console.error('Error al iniciar sesión', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/logo.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>Bienvenido</Text>
      <Text style={styles.subtitle}>Iniciar sesión en su cuenta</Text>

      <View style={styles.form}>
        <Text>Correo o Nombre de usuario</Text>
        <TextInput
          style={styles.input}
          placeholder="email@ejemplo.com o nombre de usuario"
          value={identifier}
          onChangeText={setIdentifier}
          autoComplete="username"
          textContentType="username"
        />
        <Text>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="contraseña123"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoComplete="password"
          textContentType="password"
        />

        {loading ? (
          <ActivityIndicator size="large" color="#2A9D8F" style={styles.loader} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>INICIAR SESIÓN</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => router.push('/register')} style={styles.registerLink}>
          <Text>¿No tienes una cuenta? <Text style={styles.registerLinkText}>Regístrate</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  logo: {
    width: 150,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  form: {
    width: '100%',
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#87E2D0',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  registerLinkText: {
    color: '#417067',
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 16,
  },
});

export default LoginScreen;
