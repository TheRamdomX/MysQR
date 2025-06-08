import { useRouter } from 'expo-router';
import React, { ReactNode, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

interface PublicRouteProps {
    children: ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading, userData } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && isAuthenticated && userData) {
            // Redirect authenticated users to their appropriate dashboard
            const userRole = userData.rol?.toLowerCase();
            
            if (userRole === 'alumno' || userRole === 'student') {
                router.replace('/student-courses' as any);
            } else if (userRole === 'profesor' || userRole === 'teacher') {
                router.replace('/courses' as any);
            } else {
                // Fallback redirect
                router.replace('/role-select' as any);
            }
        }
    }, [isAuthenticated, isLoading, userData, router]);

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff0000" />
                <Text style={styles.loadingText}>Cargando...</Text>
            </View>
        );
    }

    // If authenticated, show loading screen (will redirect)
    if (isAuthenticated) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Redirigiendo...</Text>
            </View>
        );
    }

    // If not authenticated, show the public content
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

export default PublicRoute;
