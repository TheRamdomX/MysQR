import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            // Redirigir al login si no está autenticado
            router.replace('/login-student' as any);
        }
    }, [isAuthenticated, isLoading, router]);

    // Mostrar loading mientras se verifica la autenticación
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff0000" />
                <Text style={styles.loadingText}>Verificando autenticación...</Text>
            </View>
        );
    }

    // Si no está autenticado, mostrar pantalla vacía (se redirigirá)
    if (!isAuthenticated) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Redirigiendo...</Text>
            </View>
        );
    }

    // Si está autenticado, mostrar el contenido protegido
    return <>{children}</>;
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
});

export default ProtectedRoute;