import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Image, Pressable, Platform, Dimensions } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';

const isWeb = Platform.OS === 'web';
const API_URL = 'http://192.168.100.54:8088';
const SCREEN_WIDTH = Dimensions.get('window').width;

interface Course {
  id: string;
  nombre: string;
  cit: string;  
  estudiantes: number;
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

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setUserData(parsedData);
          // Cargar datos de la clase actual
          await loadCurrentClass(parsedData.profesorId);
          // Cargar secciones del profesor
          await loadProfessorSections(parsedData.profesorId);
        }
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
      }
    };
    loadUserData();
  }, []);

  const loadProfessorSections = async (profesorId: string) => {
    try {
        const numId = parseInt(profesorId);
        if (isNaN(numId)) {
            console.error('ID de profesor inválido');
            return;
        }
        console.log('Cargando secciones para profesor:', numId);
        const response = await fetch(`${API_URL}/api/db/sections/professor/${numId}`);
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
            estudiantes: 0,
            asistencia: []
        }));
        
        setCourses(cursos);
    } catch (error) {
        console.error('Error al cargar las secciones:', error);
        // Mostrar mensaje de error al usuario
    }
};

  const loadCurrentClass = async (profesorId: string) => {
    try {
      console.log('Consultando clase actual para profesor:', profesorId);
      const response = await fetch(`${API_URL}/api/db/professor/current-class?profesor_id=${profesorId}`);
      console.log('Status de la respuesta:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Datos de la clase actual:', data);
        setCurrentClass(data);
      } else if (response.status === 404) {
        // No hay clase programada, lo cual es válido
        console.log('No hay clase programada en este momento');
        setCurrentClass(null);
      } else {
        const errorText = await response.text();
        console.error('Error al cargar la clase actual:', errorText);
      }
    } catch (error) {
      console.error('Error al cargar la clase actual:', error);
      setCurrentClass(null);
    }
  };

  const qrData = {
    profesorid: userData?.profesorId,
    moduloid: currentClass?.modulo_id,
    seccionid: currentClass?.seccion_id,
    FechaRegistro :new Date().toISOString()
  };

  console.log('QR Data being generated:', qrData);

  const addCourse = () => {
    if (nombre) {
      setCourses([
        ...courses,
        {
          id: (courses.length + 1).toString(),
          nombre,
          cit,
          estudiantes: parseInt(estudiantes),
          asistencia: [],
        },
      ]);
      setNombre('');
      setCit('');
      setEstudiantes('');
      setModalVisible(false);
    }
  };

  const renderItem = ({ item }: { item: Course }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.nombre}</Text>
      <Text style={styles.text}>CIT: {item.cit}</Text>
      <Text style={styles.text}>Estudiantes: {item.estudiantes}</Text>
      <TouchableOpacity
        style={styles.attendanceButton}
        onPress={() => router.push(`/attendance-list?courseId=${item.id}`)}
      >
        <Text style={styles.attendanceButtonText}>Lista de asistencia</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={StylesHeader.header}>
        <Image
          source={{ uri: 'https://www.udp.cl/cms/wp-content/uploads/2021/06/UDP_LogoRGB_2lineas_Blanco_SinFondo.png' }}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={StylesHeader.headerText}>Tus Cursos</Text>
        <Pressable
          style={styles.button}
          onPress={() => setQrVisible(true)}
        >
          <Text style={styles.buttonText}>Generar QR</Text>
        </Pressable>
      </View>

      <Modal visible={qrVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.qrModalContent}>
            <TouchableOpacity
              onPress={() => setQrVisible(false)}
              style={styles.closeIcon}
            >
              <AntDesign name="close" size={35} color="#ffff" />
            </TouchableOpacity>
            {currentClass ? (
              <>
                {console.log('Current Class Data:', currentClass)}
                <QRCode 
                  value={JSON.stringify(qrData)}
                  size={650}
                  backgroundColor="white"
                  color="black"
                />
              </>
            ) : (
              <Text style={styles.errorText}>No hay clase programada en este momento</Text>
            )}
          </View>
        </View>
      </Modal>  

      <View style={styles.container}>
        <FlatList
          data={courses}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={Platform.OS === 'web' ? 3 : 1}
          contentContainerStyle={styles.list}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <AntDesign name="pluscircle" size={56} color="#8B0000" />
        </TouchableOpacity>

        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Agregar Curso</Text>
              <TextInput
                placeholder="Nombre"
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
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const StylesHeader = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: isWeb ? 90 : 80,
    backgroundColor: '#8B0000',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  headerText: {
    color: '#fff',
    fontSize: 30,
    marginRight: '45%',
    fontWeight: 'bold',
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10, marginTop: 90 },
  list: { justifyContent: 'center' },
  image: {
    width: 250,
    height: 250,
    marginRight: 20,
  },
  attendanceButton: {
    backgroundColor: '#8B0000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 10,
  },
  attendanceButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 10,
    padding: 14,
    minWidth: isWeb ? (SCREEN_WIDTH < 600 ? '100%' : SCREEN_WIDTH < 900 ? '48%' : '31%') : '95%',
    borderWidth: 3,
    borderColor: '#8B0000',
    elevation: 3,
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#8B0000', marginBottom: 4 },
  text: { fontSize: 14, marginBottom: 2 },
  textSmall: { fontSize: 12, color: '#555' },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: 300,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#8B0000',
    marginBottom: 12,
    padding: 6,
    fontSize: 16,
  },
  modalButtons: { flexDirection: 'row', marginTop: 12 },
  modalButton: {
    backgroundColor: '#8B0000',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 20,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  button: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    justifyContent: 'center',
    position: 'absolute',
    right: 16,
    top: 10,
  },
  buttonPressed: {
    backgroundColor: '#c4b9b9',
    transform: [{ scale: 1 }],
  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 6,
    backgroundColor: '#8B0000',
    borderRadius: 10,
  },
  qrModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    color: '#8B0000',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
}); 