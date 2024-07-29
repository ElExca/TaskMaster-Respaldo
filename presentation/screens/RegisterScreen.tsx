import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Image, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';

const RegisterScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  React.useEffect(() => {
    const preventScreenCapture = async () => {
      await ScreenCapture.preventScreenCaptureAsync();
    };
    preventScreenCapture();

    return () => {
      ScreenCapture.allowScreenCaptureAsync();
    };
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleRegister = async () => {
    if (name.length < 3 || name.length > 20) {
      Alert.alert('Error', 'El nombre de usuario debe tener entre 3 y 20 caracteres.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'El correo electrónico no es válido.');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres, incluyendo una letra mayúscula, una letra minúscula, un número y un carácter especial.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    try {
      const response = await fetch('https://api-gateway.zapto.org:5000/users-api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: name,
          email,
          password,
        }),
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Cuenta creada exitosamente.');
        router.push('/login');
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Algo salió mal, por favor intenta de nuevo.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor. Por favor, intenta de nuevo.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Image
        source={require('@/assets/images/logo.png')} // Asegúrate de tener esta imagen en tu carpeta de assets
        style={styles.logo}
      />
      <Text style={styles.title}>Crea una cuenta</Text>
      <Text style={styles.subtitle}>Comienza con esta experiencia hoy</Text>

      <View style={styles.form}>
        <Text>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Paola Penagos"
          value={name}
          onChangeText={setName}
        />
        <Text>Correo</Text>
        <TextInput
          style={styles.input}
          placeholder="email@ejemplo.com"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Text>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="contraseña123"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Text>Confirmar contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="contraseña123"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>CREAR CUENTA</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.push('/login')} style={styles.loginLink}>
          <Text>¿Ya tienes una cuenta? <Text style={styles.loginLinkText}>Inicia sesión</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  loginLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#417067',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
