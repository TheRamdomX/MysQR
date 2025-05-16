// menulogin.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const MyButton = ({ title, onPress }) => (
  <Pressable
    style={({ pressed }) => [
      styles.button,
      pressed && styles.buttonPressed,
    ]}
    onPress={onPress}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </Pressable>
);

export default function MenuLogin() {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const navigation = useNavigation();

  const handleLogin = () => {
    // Aquí puedes manejar la lógica de inicio de sesión
    // alert(`Usuario: ${usuario}\nContraseña: ${contrasena}`);
    navigation.navigate('studentView');
  };

  return (
    <View style={styles.container}>
      <View style={StylesHeader.header}>
        <Text style={StylesHeader.headerText}>Bienvenido</Text>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.formContainer}
      >
        <Text style={styles.label}>Usuario</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingrese su usuario"
          value={usuario}
          onChangeText={setUsuario}
          autoCapitalize="none"
        />
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingrese su contraseña"
          value={contrasena}
          onChangeText={setContrasena}
          secureTextEntry
        />
        <MyButton title="Iniciar sesión" onPress={handleLogin} />
      </KeyboardAvoidingView>
      <View style={StylesFooter.footer}></View>
    </View>
  );
}

const StylesFooter = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60,
    backgroundColor: '#8B0000',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

const StylesHeader = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 60,
    backgroundColor: '#8B0000',
    justifyContent: 'center',
    alignItems: 'center',
  },  
  headerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBE9E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingTop: 8,
    paddingHorizontal: 24,
    paddingBottom: 24,
    marginTop: 40,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    color: '#8B0000',
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 44,
    borderColor: '#8B0000',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: 200,
    marginTop: 16,
    marginBottom: 16,
  },
  buttonPressed: {
    backgroundColor: '#8B0000',
    transform: [{ scale: 1 }],
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});