import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Image, Pressable, Platform, Dimensions, ScrollView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ProtectedRoute from '../components/ProtectedRoute';
import QRCode from 'react-native-qrcode-svg';
import { useStoredUserData } from '../hooks/useStoredUserData';
import { useProfessorSections, TeacherCourse } from '../hooks/useProfessorSections';
import { useTeacherQr } from '../hooks/useTeacherQr';
import { useCsvCourseImport } from '../hooks/useCsvCourseImport';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const BLOQUES_HORARIOS = [
  '8:30-10:00',
  '10:00-11:30',
  '11:30-13:00',
  '13:00-14:30',
  '14:30-16:00',
  '16:00-17:30',
  '17:30-19:00'
];

export default function Courses() {
  const router = useRouter();
  const { userData } = useStoredUserData();
  const { courses, setCourses } = useProfessorSections(userData?.profesorId);
  const [modalVisible, setModalVisible] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [csvModalVisible, setCsvModalVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [cit, setCit] = useState('');
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>([]);
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState<string>('');

  const { currentClass, qrData } = useTeacherQr(userData?.profesorId, qrVisible);
  const csvImport = useCsvCourseImport();

  const toggleDia = (dia: string) => {
    if (diasSeleccionados.includes(dia)) {
      setDiasSeleccionados(diasSeleccionados.filter(d => d !== dia));
    } else if (diasSeleccionados.length < 3) {
      setDiasSeleccionados([...diasSeleccionados, dia]);
    }
  };

  const addCourse = () => {
    if (nombre && cit && diasSeleccionados.length > 0 && bloqueSeleccionado) {
      setCourses([
        ...courses,
        {
          id: (courses.length + 1).toString(),
          nombre,
          cit,
          asistencia: [],
          dias: diasSeleccionados,
          bloque: bloqueSeleccionado
        },
      ]);
      setNombre('');
      setCit('');
      setDiasSeleccionados([]);
      setBloqueSeleccionado('');
      setModalVisible(false);
    }
  };

  const renderItem = ({ item }: { item: TeacherCourse }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.nombre}</Text>
      <Text style={styles.text}>Codigo: {item.cit}</Text>
      <TouchableOpacity
        style={styles.attendanceButton}
        onPress={() => router.push(`/attendance-list?courseId=${item.id}`)}
      >
        <Text style={styles.attendanceButtonText}>Lista de asistencia</Text>
      </TouchableOpacity>
    </View>
  );

  const handleFilePick = async () => {
    const extracted = await csvImport.pickFile();
    if (extracted) {
      setCit(extracted.codigo);
      setNombre(extracted.nombre);
    }
  };

  const handleUpload = async () => {
    await csvImport.upload({
      cit,
      nombre,
      dias: diasSeleccionados,
      bloque: bloqueSeleccionado,
      profesorId: userData?.profesorId || '',
    });
  };

  return (
    <ProtectedRoute>
      <View style={{ flex: 1 }}>
        <View style={StylesHeader.header}>
          <Image
            source={{ uri: 'https://www.udp.cl/cms/wp-content/uploads/2021/06/UDP_LogoRGB_2lineas_Blanco_SinFondo.png' }}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={StylesHeader.headerText}>Tus Cursos</Text>
          <Pressable
            style={styles.qrButton}
            onPress={() => setQrVisible(true)}
          >
            <Text style={styles.qrButtonText}>Generar QR</Text>
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
                  {qrData ? (
                    <QRCode 
                      value={qrData}
                      size={650}
                      backgroundColor="white"
                      color="black"
                    />
                  ) : (
                    <Text style={styles.errorText}>Generando código QR...</Text>
                  )}
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
          
          <View style={styles.addButtonContainer}>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => setCsvModalVisible(true)}
            >
              <AntDesign name="pluscircle" size={56} color="#8B0000" />
            </TouchableOpacity>
          </View>

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
                
                <Text style={styles.sectionTitle}>Días de la semana (máx. 3)</Text>
                <View style={styles.diasContainer}>
                  {DIAS_SEMANA.map((dia) => (
                    <TouchableOpacity
                      key={dia}
                      style={[
                        styles.diaButton,
                        diasSeleccionados.includes(dia) && styles.diaButtonSelected
                      ]}
                      onPress={() => toggleDia(dia)}
                    >
                      <Text style={[
                        styles.diaButtonText,
                        diasSeleccionados.includes(dia) && styles.diaButtonTextSelected
                      ]}>
                        {dia}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.sectionTitle}>Bloque horario</Text>
                <ScrollView style={styles.bloquesContainer}>
                  {BLOQUES_HORARIOS.map((bloque) => (
                    <TouchableOpacity
                      key={bloque}
                      style={[
                        styles.bloqueButton,
                        bloqueSeleccionado === bloque && styles.bloqueButtonSelected
                      ]}
                      onPress={() => setBloqueSeleccionado(bloque)}
                    >
                      <Text style={[
                        styles.bloqueButtonText,
                        bloqueSeleccionado === bloque && styles.bloqueButtonTextSelected
                      ]}>
                        {bloque}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    onPress={addCourse} 
                    style={[
                      styles.modalButton,
                      (!nombre || !cit || diasSeleccionados.length === 0 || !bloqueSeleccionado) && styles.modalButtonDisabled
                    ]}
                    disabled={!nombre || !cit || diasSeleccionados.length === 0 || !bloqueSeleccionado}
                  >
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

        <Modal visible={csvModalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                onPress={() => setCsvModalVisible(false)}
                style={styles.closeIcon}
              >
                <AntDesign name="close" size={35} color="#ffff" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Subir Archivo CSV</Text>
              
              <TouchableOpacity 
                style={styles.uploadButton} 
                onPress={handleFilePick}
              >
                <Text style={styles.uploadButtonText}>
                  {csvImport.selectedFile?.assets && csvImport.selectedFile.assets.length > 0 ? 'Cambiar archivo' : 'Seleccionar archivo'}
                </Text>
              </TouchableOpacity>

              {csvImport.selectedFile?.assets && csvImport.selectedFile.assets.length > 0 && (
                <Text style={styles.fileName}>{csvImport.selectedFile.assets[0].name}</Text>
              )}

              <Text style={styles.sectionTitle}>Días de la semana (máx. 3)</Text>
              <View style={styles.diasContainer}>
                {DIAS_SEMANA.map((dia) => (
                  <TouchableOpacity
                    key={dia}
                    style={[
                      styles.diaButton,
                      diasSeleccionados.includes(dia) && styles.diaButtonSelected
                    ]}
                    onPress={() => toggleDia(dia)}
                  >
                    <Text style={[
                      styles.diaButtonText,
                      diasSeleccionados.includes(dia) && styles.diaButtonTextSelected
                    ]}>
                      {dia}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Bloque horario</Text>
              <ScrollView style={styles.bloquesContainer}>
                {BLOQUES_HORARIOS.map((bloque) => (
                  <TouchableOpacity
                    key={bloque}
                    style={[
                      styles.bloqueButton,
                      bloqueSeleccionado === bloque && styles.bloqueButtonSelected
                    ]}
                    onPress={() => setBloqueSeleccionado(bloque)}
                  >
                    <Text style={[
                      styles.bloqueButtonText,
                      bloqueSeleccionado === bloque && styles.bloqueButtonTextSelected
                    ]}>
                      {bloque}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {csvImport.uploadProgress > 0 && (
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${csvImport.uploadProgress}%` }]} />
                  <Text style={styles.progressText}>{csvImport.uploadProgress}%</Text>
                </View>
              )}

              <Text style={styles.statusText}>{csvImport.uploadStatus}</Text>

              <TouchableOpacity 
                style={[
                  styles.uploadButton,
                  (!csvImport.selectedFile?.assets || csvImport.selectedFile.assets.length === 0 || diasSeleccionados.length === 0 || !bloqueSeleccionado) && styles.uploadButtonDisabled
                ]} 
                onPress={handleUpload}
                disabled={!csvImport.selectedFile?.assets || csvImport.selectedFile.assets.length === 0 || diasSeleccionados.length === 0 || !bloqueSeleccionado}
              >
                <Text style={styles.uploadButtonText}>Subir</Text>
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
    width: 400,
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
  addButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'flex-end',
  },
  addButton: {
    backgroundColor: 'transparent',
    padding: 0,
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
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  uploadButton: {
    backgroundColor: '#8B0000',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fileName: {
    marginVertical: 10,
    color: '#666',
    fontSize: 14,
  },
  progressContainer: {
    width: '100%',
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginVertical: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8B0000',
    borderRadius: 10,
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
    lineHeight: 20,
  },
  statusText: {
    marginVertical: 10,
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  qrButton: {
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
  qrButtonText: {
    color: '#8B0000',
    fontWeight: 'bold',
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
    marginTop: 15,
    marginBottom: 10,
  },
  diasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 15,
  },
  diaButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#8B0000',
    backgroundColor: 'transparent',
  },
  diaButtonSelected: {
    backgroundColor: '#8B0000',
  },
  diaButtonText: {
    color: '#8B0000',
    fontWeight: 'bold',
  },
  diaButtonTextSelected: {
    color: '#fff',
  },
  bloquesContainer: {
    maxHeight: 150,
    marginBottom: 15,
    width: '100%',
  },
  bloqueButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#8B0000',
    backgroundColor: 'transparent',
    marginBottom: 8,
    width: '100%',
  },
  bloqueButtonSelected: {
    backgroundColor: '#8B0000',
  },
  bloqueButtonText: {
    color: '#8B0000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bloqueButtonTextSelected: {
    color: '#fff',
  },
  modalButtonDisabled: {
    backgroundColor: '#ccc',
  },
  uploadButtonDisabled: {
    backgroundColor: '#ccc',
  },
}); 