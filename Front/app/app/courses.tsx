import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Image, Pressable, Platform, Dimensions } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';

const isWeb = Platform.OS === 'web';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface Course {
  id: string;
  nombre: string;
  cit: string;  
  estudiantes: number;
  asistencia: string[];
}

const initialCourses: Course[] = [
  { id: '1', nombre: 'Matemáticas', cit: 'MAT101', estudiantes: 30, asistencia: ['Juan', 'Ana'] },
  { id: '2', nombre: 'Historia', cit: 'HIS201', estudiantes: 25, asistencia: ['Pedro', 'Lucía'] },
  { id: '3', nombre: 'Ciencias', cit: 'CIE301', estudiantes: 28, asistencia: ['Carlos', 'Sofía'] },
];

export default function Courses() {
  const router = useRouter();
  const [courses, setCourses] = useState(initialCourses);
  const [modalVisible, setModalVisible] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [cit, setCit] = useState('');
  const [estudiantes, setEstudiantes] = useState('');

  // Mock data for QR - replace with actual data in production
  const qrData = {
    id_profe: "PROF123",
    id_seccion: "SEC456",
    id_modulo: "MOD789",
    timestamp: new Date().toISOString()
  };

  const addCourse = () => {
    if (nombre && cit && estudiantes) {
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
            <QRCode 
              value={JSON.stringify(qrData)}
              size={650}
              backgroundColor="white"
              color="black"
            />
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
}); 