import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { UserData } from '../types/domain';

// Lee el usuario de sesión guardado en AsyncStorage tras el login.
// (Pantallas que ya usan useAuth() no necesitan esto: ahí el userData vive
// en el AuthContext.)
export function useStoredUserData() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          setUserData(JSON.parse(storedData));
        } else {
          setLoadError('No se encontraron datos del usuario');
        }
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        setLoadError('Error al cargar datos del usuario');
      }
    };
    load();
  }, []);

  return { userData, loadError };
}
