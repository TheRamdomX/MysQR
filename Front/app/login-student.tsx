import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ImageBackground, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal } from 'react-native';
import PublicRoute from '../components/PublicRoute';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://192.168.206.9:8088';

export default function LoginScreen() {
    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();
    const [showRegister, setShowRegister] = useState(false);
    const [regNombre, setRegNombre] = useState('');
    const [regUsuario, setRegUsuario] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regLoading, setRegLoading] = useState(false);

    const handleLogin = async () => {
        if (!usuario.trim() || !contrasena.trim()) {
            Alert.alert('Error', 'Por favor, complete todos los campos.');
            return;
        }

        setIsLoading(true);
        try {
            console.log('Intentando conectar a:', `${API_URL}/api/qr/login`);
            const response = await fetch(`${API_URL}/api/qr/login`, {
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
                const userData = {
                    id: data.id,
                    rol: data.rol,
                    rut: data.rut,
                    alumnoId: data.alumno_id
                };

                await login(data.token, userData);
                
                setUsuario('');
                setContrasena('');
                
                router.push('/student-courses');
            } else {
                Alert.alert('Error', data.error || 'Credenciales incorrectas');
            }
        } catch (error) {
            console.error('Error de login:', error);
            Alert.alert('Error', 'Error durante el proceso de autenticación. Por favor, intente nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!regNombre.trim() || !regUsuario.trim() || !regPassword.trim()) {
            Alert.alert('Error', 'Por favor, complete todos los campos de registro.');
            return;
        }
        setRegLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/db/alumno/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: regNombre,
                    username: regUsuario,
                    password: regPassword,
                    rol: 'alumno'
                })
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert('Éxito', 'Usuario registrado correctamente.');
                setShowRegister(false);
                setRegNombre(''); setRegUsuario(''); setRegPassword('');
            } else {
                Alert.alert('Error', data.error || 'No se pudo registrar el usuario.');
            }
        } catch (error) {
            Alert.alert('Error', 'Error de red o del servidor.');
        } finally {
            setRegLoading(false);
        }
    };

    return (
        <PublicRoute>
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
                            editable={!isLoading}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Contraseña"
                            value={contrasena}
                            onChangeText={setContrasena}
                            secureTextEntry
                            editable={!isLoading}
                        />
                        <TouchableOpacity 
                            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            <Text style={styles.loginButtonText}>
                                {isLoading ? 'Ingresando...' : 'Ingresar'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
            <Modal visible={showRegister} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Registrar Usuario</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre Completo"
                            value={regNombre}
                            onChangeText={setRegNombre}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre de Usuario"
                            value={regUsuario}
                            onChangeText={setRegUsuario}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Contraseña"
                            value={regPassword}
                            onChangeText={setRegPassword}
                            secureTextEntry
                        />
                        <TouchableOpacity style={styles.loginButton} onPress={handleRegister} disabled={regLoading}>
                            <Text style={styles.loginButtonText}>{regLoading ? 'Registrando...' : 'Registrar'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setShowRegister(false)}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <TouchableOpacity style={styles.fab} onPress={() => setShowRegister(true)}>
                <Text style={styles.fabText}>＋</Text>
            </TouchableOpacity>
        </PublicRoute>
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
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    container: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
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
    title: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: 20 
    },
    input: { 
        width: '100%', 
        borderWidth: 1, 
        borderColor: '#ccc', 
        borderRadius: 5, 
        padding: 10, 
        marginBottom: 10 
    },
    loginButton: {
        backgroundColor: '#ff0000',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 10,
        width: '100%',
    },
    loginButtonDisabled: {
        backgroundColor: '#ccc',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    link: { 
        color:'#1976D2', 
        marginTop:15 
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#8B0000',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        zIndex: 10,
    },
    fabText: {
        color: 'white',
        fontSize: 36,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        width: 320,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    cancelButton: {
        marginTop: 10,
        backgroundColor: '#ccc',
        padding: 10,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: 'bold',
    },
}); 

