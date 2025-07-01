import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface UserData {
    id: number;
    rol: string;
    rut: string;
    nombre?: string;
    alumnoId?: number;
    profesorId?: number;
}

interface AuthContextType {
    isAuthenticated: boolean;
    userToken: string | null;
    userData: UserData | null;
    isLoading: boolean;
    login: (token: string, userData: UserData) => Promise<void>;
    logout: () => Promise<void>;
    checkAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

const API_URL = 'http://192.168.100.54:8088';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [userToken, setUserToken] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Verificar si el usuario está autenticado al iniciar la app
    useEffect(() => {
        checkAuthState();
    }, []);

    const checkAuthState = async (): Promise<void> => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const user = await AsyncStorage.getItem('userData');
            
            if (token && user) {
                // Verificar si el token sigue siendo válido
                const isValid = await validateToken(token);
                if (isValid) {
                    setUserToken(token);
                    setUserData(JSON.parse(user));
                    setIsAuthenticated(true);
                } else {
                    // Token inválido, limpiar datos
                    await clearAuthData();
                }
            }
        } catch (error) {
            console.error('Error checking auth state:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const validateToken = async (token: string): Promise<boolean> => {
        try {
            // Hacer una petición al backend para validar el token
            const response = await fetch(`${API_URL}/api/qr/validate-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            return response.ok;
        } catch (error) {
            console.error('Error validando token:', error);
            return false;
        }
    };

    const login = async (token: string, userData: UserData): Promise<void> => {
        try {
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            
            setUserToken(token);
            setUserData(userData);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error saving auth data:', error);
            throw error;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await clearAuthData();
            setUserToken(null);
            setUserData(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const clearAuthData = async (): Promise<void> => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
    };

    const value: AuthContextType = {
        isAuthenticated,
        userToken,
        userData,
        isLoading,
        login,
        logout,
        checkAuthState,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
};