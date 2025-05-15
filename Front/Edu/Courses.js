import React, { useState } from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Image, Pressable} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg'; // <-- Importa la librería

const initialCourses = [
  { id: '1', nombre: 'Matemáticas', cit: 'MAT101', estudiantes: 30, asistencia: ['Juan', 'Ana'] },
  { id: '2', nombre: 'Historia', cit: 'HIS201', estudiantes: 25, asistencia: ['Pedro', 'Lucía'] },
  { id: '3', nombre: 'Ciencias', cit: 'CIE301', estudiantes: 28, asistencia: ['Carlos', 'Sofía'] },
];

export default function Courses({ navigation }) {
  const [courses, setCourses] = useState(initialCourses);
  const [modalVisible, setModalVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [cit, setCit] = useState('');
  const [estudiantes, setEstudiantes] = useState('');

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

  const [qrVisible, setQrVisible] = useState(false);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.nombre}</Text>
      <Text style={styles.text}>CIT: {item.cit}</Text>
      <Text style={styles.text}>Estudiantes: {item.estudiantes}</Text>
      <TouchableOpacity
          style={styles.attendanceButton}
          onPress={() => navigation.navigate('AttendanceList', { course: item })}
      >
        <Text style={styles.attendanceButtonText}>Lista de asistencia</Text>
      </TouchableOpacity>
    </View>
  );

return (
    <View style={{ flex: 1 }}>
      {/* Header */}
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
            <QRCode value="https://www.youtube.com/watch?v=dQw4w9WgXcQ" size={650} />
          </View>
        </View>
      </Modal>

      <View style={styles.container}>
        <FlatList
          data={courses}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={3}
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
  );}
// Header styles
// Cambia StylesHeader.header y agrega styles.image

const StylesHeader = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 60,
    backgroundColor: '#8B0000',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row', // <-- Añadido
    paddingHorizontal: 16, // Opcional para margen lateral
  },
  headerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10,marginTop:60 },
  list: { justifyContent: 'center' },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 6,
  },
  qrModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
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
    minWidth: 100,
    maxWidth: '32%',
    elevation: 3,
    alignItems: 'flex-start',
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#8B0000', marginBottom: 4 },
  text: { fontSize: 14, marginBottom: 2 },
  textSmall: { fontSize: 12, color: '#555' },
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
    position: 'absolute', // <-- Añadido
    right: 16,            // <-- Añadido
    top: 10,              // <-- Ajusta según la altura del header
  },
  buttonPressed: {
    backgroundColor: '#c4b9b9',
    transform: [{ scale: 1 }],
  },
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
  buttonText: { color: '#8B0000', fontWeight: 'bold', fontSize: 16},
  });
