import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import CryptoJS from 'crypto-js';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const API_URL = 'http://localhost:8088';

interface Course {
  id: string;
  nombre: string;
  cit: string;
  asistencia: boolean[];
}

interface UserData {
  id: string;
  rol: string;
  rut: string;
  alumnoId: string;
}

interface SeccionAsignatura {
  seccion_id: number;
  asignatura_id: number;
  nombre: string;
}

const decryptQRData = (encryptedData: string) => {
  try {
    const key = "32-byte-long-secret-key-12345678";
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Error decrypting QR data:', error);
    return null;
  }
};

export default function CoursesStudent() {
  const router = useRouter();
  const { logout, userData } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [qrVisible, setQrVisible] = useState(false);
  const [hora, setHora] = useState('');
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    const loadStudentSections = async () => {
      if (!userData?.alumnoId) return;
      
      try {
        const numId = parseInt(userData.alumnoId.toString());
        if (isNaN(numId)) {
          console.error('ID de alumno inválido');
          return;
        }
        console.log('Cargando secciones para alumno:', numId);
        const response = await fetch(`${API_URL}/api/db/sections/student/${numId}`);
        console.log('Status de la respuesta:', response.status);
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${await response.text()}`);
        }
        const data: SeccionAsignatura[] = await response.json();
        console.log('Datos de las secciones:', data);
        const cursos = data.map(seccion => ({
          id: seccion.seccion_id.toString(),
          nombre: seccion.nombre,
          cit: `CIT${seccion.asignatura_id}`,
          asistencia: [] // Aquí podrías cargar el historial de asistencia si lo necesitas
        }));
        
        setCourses(cursos);
      } catch (error) {
        console.error('Error al cargar las secciones:', error);
      }
    };
    loadStudentSections();
  }, [userData]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login-student');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    const actualizarHora = () => {
      const ahora = new Date();
      const h = ahora.getHours().toString().padStart(2, '0');
      const m = ahora.getMinutes().toString().padStart(2, '0');
      const s = ahora.getSeconds().toString().padStart(2, '0');
      setHora(`${h}:${m}:${s}`);
    };
    actualizarHora();
    const timer = setInterval(actualizarHora, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    try {
      setScanned(true);
      setScannedData(data);
      
      // Desencriptar los datos del QR
      const qrData = decryptQRData(data);
      if (!qrData) {
        console.error('Error al desencriptar QR');
        return;
      }
      console.log('QR Data decrypted:', qrData);

      // Verificar que tenemos todos los datos necesarios
      if (!qrData.moduloid || !qrData.seccionid) {
        console.error('QR inválido: faltan datos necesarios');
        return;
      }

      // Enviar datos al backend
      const response = await fetch(`${API_URL}/api/db/attendance/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alumno_id: userData?.alumnoId,
          seccion_id: qrData.seccionid,
          modulo_id: qrData.moduloid,
          fecha_registro: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`Error al registrar asistencia: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Asistencia registrada:', result);
      
      // Cerrar el modal después de un registro exitoso
      setQrVisible(false);
    } catch (error) {
      console.error('Error al procesar el QR:', error);
    }
  };

  const getNumColumns = () => {
    if (isWeb) {
      if (SCREEN_WIDTH < 600) return 1;
      if (SCREEN_WIDTH < 900) return 2;
      return 3;
    }
    return 1;
  };

  const renderItem = ({ item }: { item: Course }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.nombre}</Text>
        <Text style={styles.text}>CIT: {item.cit}</Text>
        <TouchableOpacity
          style={styles.attendanceButton}
          onPress={() => router.push(`/attendance-list-student?courseId=${item.id}`)}
        >
          <Text style={styles.attendanceButtonText}>Lista de asistencia</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['alumno', 'student']}>
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://www.udp.cl/cms/wp-content/uploads/2021/06/UDP_LogoRGB_2lineas_Blanco_SinFondo.png ' }}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.headerText}>Tus Cursos</Text>
          <View style={styles.horaContainer}>
            <Text style={styles.horaText}>{hora}</Text>
          </View>
        </View>
        <View style={styles.container}>
          <FlatList
            data={courses}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            numColumns={getNumColumns()}
            contentContainerStyle={styles.list}
          />
        </View>
        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => {
            setScanned(false);
            setScannedData('');
            setQrVisible(true);
          }}
        >
          <Text style={styles.qrButtonText}>Escanear QR</Text>
        </TouchableOpacity>
        <Modal visible={qrVisible} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.qrModalContent}>
              <TouchableOpacity style={styles.closeIcon} onPress={() => setQrVisible(false)}>
                <AntDesign name="close" size={35} color="#fff" />
              </TouchableOpacity>
              {!permission ? (
                <View style={styles.permissionContainer}>
                  <Text style={styles.permissionText}>Loading...</Text>
                </View>
              ) : !permission.granted ? (
                <View style={styles.permissionContainer}>
                  <Text style={styles.permissionText}>We need your permission to show the camera</Text>
                  <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <CameraView
                  style={styles.camera}
                  barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                  }}
                  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                >
                  <View style={styles.overlay}>
                    <View style={styles.scanFrame} />
                  </View>
                </CameraView>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    width: '100%',
    height: isWeb ? 100 : 80,
    backgroundColor: '#8B0000',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    position: 'absolute',
    paddingTop: isWeb ? 0 : 32,
    top: 0,
    zIndex: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerText: {
    color: '#fff',
    fontSize: isWeb ? 26 : 22,
    fontWeight: 'bold',
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -50 }],
  },
  horaContainer: {
    position: 'absolute',
    right: SCREEN_WIDTH * 0.04,
    top: isWeb ? 35 : 10,
    borderRadius: 8,
    paddingHorizontal: SCREEN_WIDTH * 0.02,
    paddingTop: isWeb ? 10 : 32,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0)',
  },
  horaText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: isWeb ? 20 : 18,
  },
  image: {
    width: isWeb ? 300 : 100,
    height: isWeb ? 300 : 250,
    marginRight: SCREEN_WIDTH * 0.02,
  },
  container: {
    paddingTop: isWeb ? 25 : 32,
    backgroundColor: '#f5f5f5',
    padding: SCREEN_WIDTH * 0.02,
    marginTop: isWeb ? 80 : 60,
  },
  list: {
    justifyContent: 'center',
    paddingBottom: isWeb ? 100 : 80,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    margin: SCREEN_WIDTH * 0.01,
    borderWidth: 3,
    borderColor: '#8B0000',
    borderRadius: 10,
    padding: SCREEN_WIDTH * 0.02,
    minWidth: isWeb ? (SCREEN_WIDTH < 600 ? '100%' : SCREEN_WIDTH < 900 ? '48%' : '31%') : '95%',
    elevation: 3,
    alignItems: 'center',
    ...(isWeb && {
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }),
  },
  title: {
    fontSize: isWeb ? 20 : 18,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 4,
    textAlign: 'center',
  },
  text: {
    fontSize: isWeb ? 16 : 14,
    marginBottom: 2,
    textAlign: 'center',
  },
  attendanceButton: {
    backgroundColor: '#8B0000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  attendanceButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: isWeb ? 16 : 14,
  },
  qrButton: {
    backgroundColor: '#8B0000',
    paddingVertical: isWeb ? 16 : 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    margin: SCREEN_WIDTH * 0.02,
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: [{ translateX: -SCREEN_WIDTH * 0.3 }],
    width: SCREEN_WIDTH * 0.6,
    ...(isWeb && {
      maxWidth: 400,
      marginBottom: 20,
      left: '50%',
      transform: [{ translateX: -200 }],
      width: '40%',
    }),
  },
  qrButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: isWeb ? 20 : 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  qrModalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  closeIcon: {
    position: 'absolute',
    backgroundColor: '#8B0000',
    top: 20,
    right: 20,
    zIndex: 1,
    borderRadius: 20,
    padding: 5,
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  cameraContainer: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#8B0000',
    backgroundColor: 'transparent',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#8B0000',
    padding: 10,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#8B0000',
    padding: 10,
    borderRadius: 8,
  },
  scanAgainButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});