import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCurrentClass, issueQr, ModuleSection } from '../services/professorApi';

const REFRESH_MS = 3000;

// Mientras `active` es true (el modal del QR está abierto), le pide al
// backend un QR fresco cada REFRESH_MS — el backend decide vigencia y
// contenido, este hook solo pinta lo que le llega.
export function useTeacherQr(profesorId: string | undefined, active: boolean) {
  const { userToken } = useAuth();
  const [currentClass, setCurrentClass] = useState<ModuleSection | null>(null);
  const [qrData, setQrData] = useState('');

  // Carga informativa apenas se conoce el profesor, antes de abrir el modal.
  useEffect(() => {
    if (!profesorId) return;
    const numId = parseInt(profesorId, 10);
    if (isNaN(numId)) return;

    getCurrentClass(numId)
      .then(setCurrentClass)
      .catch(error => {
        console.error('Error al cargar la clase actual:', error);
        setCurrentClass(null);
      });
  }, [profesorId]);

  useEffect(() => {
    if (!active || !userToken) return;

    const fetchQr = async () => {
      try {
        const issued = await issueQr(userToken);
        if (!issued) {
          setCurrentClass(null);
          setQrData('');
          return;
        }
        setCurrentClass(issued.moduleSection);
        setQrData(issued.encryptedQr);
      } catch (error) {
        console.error('Error al emitir QR:', error);
      }
    };

    fetchQr();
    const interval = setInterval(fetchQr, REFRESH_MS);
    return () => clearInterval(interval);
  }, [active, userToken]);

  return { currentClass, qrData };
}
