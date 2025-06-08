// AuthNavigator.tsx - Example of how the route protection system works
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// This component demonstrates the automatic routing logic
export const AuthNavigator: React.FC = () => {
    const { isAuthenticated, userData, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated && userData) {
                // Route authenticated users to their appropriate dashboard
                const userRole = userData.rol?.toLowerCase();
                
                if (userRole === 'alumno' || userRole === 'student') {
                    router.replace('/student-courses' as any);
                } else if (userRole === 'profesor' || userRole === 'teacher') {
                    router.replace('/courses' as any);
                }
            } else {
                // Route unauthenticated users to welcome page
                router.replace('/' as any);
            }
        }
    }, [isAuthenticated, userData, isLoading, router]);

    return null; // This component only handles navigation logic
};

export default AuthNavigator;
