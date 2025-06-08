import { useRouter } from 'expo-router';
import React, { ReactNode, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: string[]; // Array of allowed roles for this route
    redirectTo?: string; // Custom redirect path
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
    children, 
    allowedRoles = [], 
    redirectTo 
}) => {
    const { isAuthenticated, isLoading, userData } = useAuth();
    const router = useRouter();
    const [accessDenied, setAccessDenied] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                // Redirect to role selection if not authenticated
                router.replace(redirectTo || '/role-select' as any);
                return;
            }

            // Check role-based access if roles are specified
            if (allowedRoles.length > 0 && userData) {
                const userRole = userData.rol?.toLowerCase();
                const hasAccess = allowedRoles.some(role => 
                    role.toLowerCase() === userRole
                );

                if (!hasAccess) {
                    setAccessDenied(true);
                    // Show alert based on required role and user role
                    const requiredRoleText = allowedRoles.includes('profesor') || allowedRoles.includes('teacher') 
                        ? 'profesor' 
                        : 'estudiante';
                    
                    Alert.alert(
                        'Acceso Denegado', 
                        `Debes ser ${requiredRoleText} para acceder a esta ruta.`,
                        [
                            {
                                text: 'OK',
                                onPress: () => {
                                    // Redirect based on user role
                                    if (userRole === 'alumno' || userRole === 'student') {
                                        router.replace('/student-courses' as any);
                                    } else if (userRole === 'profesor' || userRole === 'teacher') {
                                        router.replace('/courses' as any);
                                    } else {
                                        router.replace('/role-select' as any);
                                    }
                                }
                            }
                        ]
                    );
                    return;
                }
            }
        }
    }, [isAuthenticated, isLoading, userData, allowedRoles, redirectTo, router]);

    // Mostrar loading mientras se verifica la autenticación
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff0000" />
                <Text style={styles.loadingText}>Verificando autenticación...</Text>
            </View>
        );
    }

    // Si no está autenticado o no tiene los permisos correctos, mostrar pantalla de carga
    if (!isAuthenticated || (allowedRoles.length > 0 && userData && !allowedRoles.some(role => 
        role.toLowerCase() === userData.rol?.toLowerCase()
    )) || accessDenied) {
        return (
            <View style={styles.loadingContainer}>
                <Text>{accessDenied ? 'Acceso denegado, redirigiendo...' : 'Redirigiendo...'}</Text>
            </View>
        );
    }

    // Si está autenticado y tiene los permisos correctos, mostrar el contenido protegido
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