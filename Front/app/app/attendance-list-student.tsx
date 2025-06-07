import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ProtectedRoute from '../components/ProtectedRoute';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const API_URL = 'http://192.168.225.9:8088';

interface Attendance {
  [key: string]: string;
}

interface StudentAttendance {
  estudiante: string;
  asistencia: Attendance;
}

interface UserData {
  id: string;
  rol: string;
  rut: string;
  alumnoId: string;
}

export default function AttendanceListStudent() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams();
  const [hora, setHora] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<StudentAttendance | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        console.log('Debug - Stored user data:', storedData);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          console.log('Debug - Parsed user data:', parsedData);
          setUserData(parsedData);
        } else {
          console.log('Debug - No user data found in AsyncStorage');
          setError('No se encontraron datos del usuario');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        setError('Error al cargar datos del usuario');
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    if (!courseId) {
      console.log('Debug - No courseId provided');
      setError('Falta el ID del curso');
      setLoading(false);
      return;
    }

    if (!userData) {
      console.log('Debug - No userData available yet');
      return; // Esperar a que userData esté disponible
    }

    if (!userData.alumnoId) {
      console.log('Debug - No alumnoId in userData');
      setError('No se encontró el ID del alumno');
      setLoading(false);
      return;
    }

    const fetchStudentAttendance = async () => {
      try {
        setLoading(true);
        console.log('Debug - Starting fetch with:', {
          courseId,
          alumnoId: userData.alumnoId
        });
        
        const url = `${API_URL}/api/db/attendance/student?seccion_id=${courseId}&alumno_id=${userData.alumnoId}`;
        console.log('Debug - Fetching URL:', url);
        
        const response = await fetch(url);
        console.log('Debug - Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('Debug - Error response:', errorText);
          throw new Error(`Error al cargar los datos de asistencia: ${response.status} - ${errorText}`);
        }
        
        const data: StudentAttendance = await response.json();
        console.log('Debug - Response data:', data);
        
        if (!data || !data.estudiante || !data.asistencia) {
          throw new Error('Los datos recibidos no tienen el formato esperado');
        }
        setStudentData(data);

        // Extraer todas las fechas únicas de las asistencias
        const uniqueDates = Object.keys(data.asistencia).sort();
        setDates(uniqueDates);
      } catch (err) {
        console.error('Error completo:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAttendance();
  }, [courseId, userData]);

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

  if (!courseId || !userData?.alumnoId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: Faltan parámetros necesarios</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B0000" />
        <Text style={styles.loadingText}>Cargando datos de asistencia...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!studentData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se encontraron datos del estudiante</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const asistencias = Object.values(studentData.asistencia).filter(a => a === '🟢').length;
  const faltas = Object.values(studentData.asistencia).filter(a => a === '🔴').length;
  const totalClases = Object.keys(studentData.asistencia).length;
  const porcentaje = totalClases > 0 ? Math.round((asistencias / totalClases) * 100) : 0;

  return (
    <ProtectedRoute allowedRoles={['alumno', 'student']}>
      <View style={styles.mainContainer}>
      <View style={styles.header}>
        {isWeb && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>{'<'} Volver</Text>
          </TouchableOpacity>
        )}
        <Image
          source={{ uri: 'https://www.udp.cl/cms/wp-content/uploads/2021/06/UDP_LogoRGB_2lineas_Blanco_SinFondo.png' }}
          style={styles.image}
          resizeMode="contain"
        />
        <View style={styles.horaContainer}>
          <Text style={styles.horaText}>{hora}</Text>
        </View>
      </View>
      <View style={styles.container}>
        <View style={styles.summaryBox}>
          <Text style={styles.studentName}>{studentData.estudiante}</Text>
          <Text style={styles.percent}>{porcentaje}% asistencia</Text>
          <Text style={styles.stats}>{asistencias} asistencias, {faltas} faltas</Text>
          <Text style={styles.stats}>{totalClases} clases en total</Text>
          <View style={styles.attendanceTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.headerText}>Fecha</Text>
              <Text style={styles.headerText}>Estado</Text>
            </View>
            {dates.map((fecha, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.dateText}>{fecha}</Text>
                <View style={[
                  styles.statusCircle,
                  studentData.asistencia[fecha] === '🟢' ? styles.attended : styles.notAttended
                ]} />
              </View>
            ))}
          </View>
        </View>
      </View>
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
  headerText: {
    color: '#fff',
    fontSize: isWeb ? 26 : 22,
    fontWeight: 'bold',
  },
  container: {
    paddingTop: isWeb ? 25 : 32,
    backgroundColor: '#f5f5f5',
    padding: SCREEN_WIDTH * 0.02,
    maxWidth: '95%',
    marginTop: isWeb ? 80 : 60,
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
  summaryBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: SCREEN_WIDTH * 0.04,
    margin: SCREEN_WIDTH * 0.02,
    elevation: 3,
    alignItems: 'center',
    width: '100%',
    ...(isWeb && {
      maxWidth: 1200,
      alignSelf: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }),
  },
  studentName: {
    fontSize: isWeb ? 28 : 24,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 10,
    textAlign: 'center',
  },
  percent: {
    fontSize: isWeb ? 24 : 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
    textAlign: 'center',
  },
  stats: {
    fontSize: isWeb ? 18 : 16,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  attendanceTable: {
    width: '100%',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#8B0000',
    padding: 12,
    justifyContent: 'space-between',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: isWeb ? 16 : 14,
    color: '#333',
  },
  statusCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  attended: {
    backgroundColor: '#4CAF50',
    borderColor: '#388e3c',
  },
  notAttended: {
    backgroundColor: '#f44336',
    borderColor: '#d32f2f',
  },
  backButton: {
    marginRight: SCREEN_WIDTH * 0.02,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#fff',
    width: 100,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: isWeb ? 18 : 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#8B0000',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    color: '#8B0000',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#8B0000',
    padding: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 