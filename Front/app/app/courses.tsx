import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, Modal, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ProtectedRoute from '../components/ProtectedRoute';

const isWeb = Platform.OS === 'web';
const API_URL = 'http://192.168.225.9:8088';
const SCREEN_WIDTH = Dimensions.get('window').width;

interface Course {
  id: string;
  nombre: string;
  cit: string;  
  asistencia: string[];
}

interface UserData {
  id: string;
  rol: string;
  rut: string;
  profesorId: string;
}

interface ModuleSection {
  modulo_id: number;
  seccion_id: number;
}

interface SeccionAsignatura {
  seccion_id: number;
  asignatura_id: number;
  nombre: string;
}

export default function Courses() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [cit, setCit] = useState('');
  const [estudiantes, setEstudiantes] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentClass, setCurrentClass] = useState<ModuleSection | null>(null);
  const [seccionesAsignaturas, setSeccionesAsignaturas] = useState<SeccionAsignatura[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const parsedUserData = JSON.parse(userDataString);
          setUserData(parsedUserData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    const loadCourses = async () => {
      if (!userData) return;
      
      try {
        const response = await fetch(`${API_URL}/api/qr/secciones/${userData.profesorId}`);
        const data = await response.json();
        
        if (response.ok) {
          setSeccionesAsignaturas(data);
        } else {
          console.error('Error loading courses:', data.error);
        }
      } catch (error) {
        console.error('Error loading courses:', error);
      } finally {
        setLoadingCourses(false);
      }
    };

    loadCourses();
  }, [userData]);

  const handleQRPress = (seccion: SeccionAsignatura) => {
    setCurrentClass({
      modulo_id: 1,
      seccion_id: seccion.seccion_id
    });
    setQrVisible(true);
  };

  const addCourse = () => {
    if (nombre && cit && estudiantes) {
      const newCourse: Course = {
        id: Date.now().toString(),
        nombre,
        cit,
        asistencia: []
      };
      setCourses([...courses, newCourse]);
      setNombre('');
      setCit('');
      setEstudiantes('');
      setModalVisible(false);
    }
  };

  const renderCourse = ({ item }: { item: SeccionAsignatura }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/attendance-list?seccionId=${item.seccion_id}&asignaturaId=${item.asignatura_id}`)}
    >
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.nombre}</Text>
        <Text style={styles.subtitle}>Sección: {item.seccion_id}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.attendanceButton}
            onPress={() => router.push(`/attendance-list?seccionId=${item.seccion_id}&asignaturaId=${item.asignatura_id}`)}
          >
            <Text style={styles.attendanceButtonText}>Ver Asistencia</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.qrButton}
            onPress={() => handleQRPress(item)}
          >
            <Text style={styles.buttonText}>Generar QR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const generateQRData = () => {
    if (!currentClass) return '';
    
    return JSON.stringify({
      type: 'attendance',
      modulo_id: currentClass.modulo_id,
      seccion_id: currentClass.seccion_id,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <ProtectedRoute allowedRoles={['profesor', 'teacher']}>
      <View style={{ flex: 1 }}>
        <View style={StylesHeader.header}>
          <Image
            source={{ uri: 'https://www.udp.cl/cms/wp-content/uploads/2021/06/UDP_LogoRGB_2lineas_Blanco_SinFondo.png' }}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={StylesHeader.headerText}>Tus Cursos</Text>
          <Pressable
            style={styles.logoutButton}
            onPress={async () => {
              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.removeItem('userData');
              router.push('/role-select');
            }}
          >
            <AntDesign name="logout" size={24} color="white" />
          </Pressable>
        </View>

        <View style={{ flex: 1 }}>
          {loadingCourses ? (
            <View style={styles.loadingContainer}>
              <Text>Cargando cursos...</Text>
            </View>
          ) : (
            <FlatList
              data={seccionesAsignaturas}
              renderItem={renderCourse}
              keyExtractor={item => `${item.seccion_id}-${item.asignatura_id}`}
              contentContainerStyle={{ padding: 16 }}
            />
          )}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <AntDesign name="pluscircle" size={56} color="#8B0000" />
        </TouchableOpacity>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Agregar Nuevo Curso</Text>
              <TextInput
                placeholder="Nombre del curso"
                value={nombre}
                onChangeText={setNombre}
                style={styles.input}
              />
              <TextInput
                placeholder="CIT"
                value={cit}
                onChangeText={setCit}
                style={styles.input}
              />
              <TextInput
                placeholder="Estudiantes"
                value={estudiantes}
                onChangeText={setEstudiantes}
                keyboardType="numeric"
                style={styles.input}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={addCourse} style={styles.modalButton}>
                  <Text style={styles.buttonText}>Agregar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.modalButton, { backgroundColor: '#666' }]}>
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={qrVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.qrModalContent}>
              <Text style={styles.modalTitle}>Código QR de Asistencia</Text>
              {currentClass && (
                <View style={styles.qrContainer}>
                  <QRCode
                    value={generateQRData()}
                    size={200}
                    backgroundColor="white"
                    color="black"
                  />
                </View>
              )}
              <TouchableOpacity
                onPress={() => setQrVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.buttonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ProtectedRoute>
  );
}

const StylesHeader = StyleSheet.create({
  header: {
    backgroundColor: '#8B0000',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 40,
    resizeMode: 'contain',
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  attendanceButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  attendanceButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  qrButton: {
    flex: 1,
    backgroundColor: '#8B0000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    backgroundColor: 'transparent',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  qrModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#8B0000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  qrContainer: {
    marginVertical: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  closeButton: {
    backgroundColor: '#8B0000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
});