import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const cursos = [
  { nombre: 'Matemáticas I', seccion: '101' },
  { nombre: 'Física General', seccion: '202' },
  { nombre: 'Química Básica', seccion: '303' },
  { nombre: 'Historia Universal', seccion: '404' },
  { nombre: 'Lengua y Literatura', seccion: '505' },
  { nombre: 'Programación I', seccion: '606' },
];

export default function StudentView() {
  // Dividir los cursos en pares para dos columnas
  const cursosEnFilas = [];
  for (let i = 0; i < cursos.length; i += 2) {
    cursosEnFilas.push(cursos.slice(i, i + 2));
  }

  const handleScanQR = () => {
    // Aquí puedes agregar la lógica para escanear QR
    alert('Funcionalidad de escanear QR próximamente');
  };

  const handleCoursePress = (curso) => {
    // Aquí puedes implementar la lógica para acceder al backend con la info del curso
    alert(`Acceso a información de: ${curso.nombre} (Sección: ${curso.seccion})`);
  };

  return (
    <View style={styles.container}>
      <View style={StylesHeader.header}>
        <Text style={StylesHeader.headerText}>Mis Cursos</Text>
      </View>
      <ScrollView contentContainerStyle={styles.coursesContainer} style={styles.scrollView}>
        {cursosEnFilas.map((fila, idx) => (
          <View key={idx} style={styles.row}>
            {fila.map((curso, j) => (
              <TouchableOpacity
                key={j}
                style={styles.courseBox}
                onPress={() => handleCoursePress(curso)}
                activeOpacity={0.7}
              >
                <Text style={styles.courseName}>{curso.nombre}</Text>
                <Text style={styles.sectionText}>Sección: {curso.seccion}</Text>
              </TouchableOpacity>
            ))}
            {fila.length === 1 && <View style={[styles.courseBox, {opacity: 0}]} />}
          </View>
        ))}
        <TouchableOpacity style={styles.qrButton} onPress={handleScanQR}>
          <Text style={styles.qrButtonText}>Escanear QR</Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={StylesFooter.footer}></View>
    </View>
  );
}

const StylesFooter = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60,
    backgroundColor: '#8B0000',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

const StylesHeader = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 60,
    backgroundColor: '#8B0000',
    justifyContent: 'center',
    alignItems: 'center',
  },  
  headerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBE9E7',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
    marginTop: 60,
    marginBottom: 60,
  },
  coursesContainer: {
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginBottom: 12,
  },
  courseBox: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 6,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8B0000',
  },
  courseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    color: '#333',
  },
  qrButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 10,
    width: 300,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#8B0000',
    alignItems: 'center',
    elevation: 3,
  },
  qrButtonText: {
    color: '#8B0000',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});