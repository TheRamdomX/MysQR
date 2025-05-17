import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ImageBackground, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cambiamos localhost por la IP de tu computadora en la red local
const API_URL = 'http://192.168.100.54:8080'; // Reemplaza con tu IP local

export default function LoginScreen() {
    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        try {
            console.log('Intentando conectar a:', `${API_URL}/login`);
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: usuario,
                    password: contrasena,
                    rol: 'alumno'
                }),
            });

            console.log('Status de la respuesta:', response.status);
            const responseText = await response.text();
            console.log('Respuesta del servidor:', responseText);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Error al parsear JSON:', parseError);
                Alert.alert('Error', 'Respuesta inválida del servidor. Por favor, intente nuevamente.');
                return;
            }

            if (response.ok) {
                // Guardar el token y la información del usuario
                await AsyncStorage.setItem('userToken', data.token);
                await AsyncStorage.setItem('userData', JSON.stringify({
                    id: data.id,
                    rol: data.rol,
                    rut: data.rut,
                    alumnoId: data.alumno_id
                }));
                
                router.push('/student-courses');
            } else {
                Alert.alert('Error', data.message || 'Credenciales incorrectas');
            }
        } catch (error) {
            console.error('Error de login:', error);
            Alert.alert('Error', 'Error al conectar con el servidor. Por favor, intente nuevamente.');
        }
    };

    return (
        <ImageBackground
            source={{ uri: 'https://ingenieriayciencias.udp.cl/cms/wp-content/uploads/2020/08/2876_DSC_0005-1-scaled.jpg' }}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.overlay} />
            <View style={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.title}>Iniciar Sesión Estudiante</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Usuario"
                        value={usuario}
                        onChangeText={setUsuario}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña"
                        value={contrasena}
                        onChangeText={setContrasena}
                        secureTextEntry
                    />
                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        <Text style={styles.loginButtonText}>Ingresar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)', // Ajusta la opacidad para más o menos difuminado
    },
    container: { flex:1, justifyContent:'center', alignItems:'center' },
    card: {
        width: Platform.OS === 'web' ? '50%' : '100%',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
    },
    title: { fontSize:24, fontWeight:'bold', marginBottom:20 },
    input: { width:'100%', borderWidth:1, borderColor:'#ccc', borderRadius:5, padding:10, marginBottom:10 },
    loginButton: {
        backgroundColor: '#ff0000',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 10,
        width: '100%',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    link: { color:'#1976D2', marginTop:15 }
}); 