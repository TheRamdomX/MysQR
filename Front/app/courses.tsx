import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Image, Pressable, Platform, Dimensions, ScrollView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ProtectedRoute from '../components/ProtectedRoute';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';
import CryptoJS from 'crypto-js';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const API_URL = 'http://192.168.206.9:8088';

interface Course {
  id: string;
  nombre: string;
  cit: string;  
  asistencia: string[];
  dias: string[];
  bloque: string;
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
  codigo: string;
}

const encryptQRData = (data: any) => {
  const key = "32-byte-long-secret-key-12345678";
  const jsonString = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(jsonString, key).toString();
  return encrypted;
};

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
  const [courses, setCourses] = useState<Course[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [csvModalVisible, setCsvModalVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [cit, setCit] = useState('');
  const [estudiantes, setEstudiantes] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentClass, setCurrentClass] = useState<ModuleSection | null>(null);
  const [qrData, setQrData] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>([]);
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState<string>('');

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

  useEffect(() => {
    const interval = setInterval(() => {
      const newQrData = {
        profesorid: userData?.profesorId,
        moduloid: currentClass?.modulo_id,
        seccionid: currentClass?.seccion_id,
        FechaRegistro: new Date().toLocaleTimeString('en-US', { 
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      };
      const encryptedData = encryptQRData(newQrData);
      setQrData(encryptedData);
    }, 3000);

    return () => clearInterval(interval);
  }, [userData, currentClass]);

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
            cit: seccion.codigo,
            asistencia: [],
            dias: [],
            bloque: ''
        }));
        
        setCourses(cursos);
    } catch (error) {
        console.error('Error al cargar las secciones:', error);
        // Mostrar mensaje de error al usuario
    }
};

  const loadCurrentClass = async (profesorId: string) => {
    try {
      const numId = parseInt(profesorId);
      if (isNaN(numId)) {
        console.error('ID de profesor inválido');
        return;
      }
      
      console.log('Consultando clase actual para profesor:', numId);
      const response = await fetch(`${API_URL}/api/db/professor/current-class?profesor_id=${numId}`);
      console.log('Status de la respuesta:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Datos de la clase actual:', data);
        if (data && data.modulo_id && data.seccion_id) {
          setCurrentClass({
            modulo_id: data.modulo_id,
            seccion_id: data.seccion_id
          });
        } else {
          setCurrentClass(null);
        }
      } else if (response.status === 404) {
        console.log('No hay clase programada en este momento');
        setCurrentClass(null);
      } else {
        const errorText = await response.text();
        console.error('Error al cargar la clase actual:', errorText);
        setCurrentClass(null);
      }
    } catch (error) {
      console.error('Error al cargar la clase actual:', error);
      setCurrentClass(null);
    }
  };

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
      setEstudiantes('');
      setDiasSeleccionados([]);
      setBloqueSeleccionado('');
      setModalVisible(false);
    }
  };

  const renderItem = ({ item }: { item: Course }) => (
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
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true
      });

      if (result.assets && result.assets.length > 0) {
        const fileName = result.assets[0].name;
        console.log('Nombre del archivo seleccionado:', fileName);
        
        const match = fileName.match(/CIT\d+_CA\d+/);
        
        if (match) {
          const codigo = match[0];
          console.log('Código extraído:', codigo);
          
          setCit(codigo);
          setSelectedFile(result);
          setUploadStatus('Archivo seleccionado: ' + fileName);

          try {
            let fileContent: string;
            
            if (Platform.OS === 'web') {
              // En web, el archivo ya está en memoria como base64
              const base64Content = result.assets[0].uri.split(',')[1];
              const binaryString = atob(base64Content);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              fileContent = new TextDecoder('utf-8').decode(bytes);
            } else {
              fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri, {
                encoding: FileSystem.EncodingType.UTF8
              });
            }

            console.log('Contenido del archivo:', fileContent.substring(0, 200)); // Mostrar los primeros 200 caracteres para debug

            // Obtener las líneas del archivo
            const lines = fileContent.split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0);

            console.log('Número de líneas encontradas:', lines.length);

            const firstStudentLine = lines.find(line => 
              !line.includes('Student,ID') && 
              !line.includes('Points Possible') &&
              line.includes('"') 
            );

            console.log('Primera línea de estudiante encontrada:', firstStudentLine);

            if (firstStudentLine) {
              const matches = firstStudentLine.match(/"([^"]*)",([^,]*),([^,]*),([^,]*),([^,]*)/);
              if (matches && matches[5]) {
                const courseName = matches[5].trim();
                setNombre(courseName);
                console.log('Nombre del curso extraído:', courseName);
              } else {
                console.error('No se pudo extraer el nombre del curso del CSV');
                setUploadStatus('Error: No se pudo extraer el nombre del curso del CSV');
              }
            } else {
              console.error('No se encontró ninguna línea de estudiante en el CSV');
              setUploadStatus('Error: No se encontró ninguna línea de estudiante en el CSV');
            }
          } catch (error) {
            console.error('Error al leer el archivo CSV:', error);
            setUploadStatus('Error al leer el archivo CSV');
          }
        } else {
          console.error('Formato de archivo incorrecto. El nombre debe contener el código en formato CIT1000_CA16');
          setUploadStatus('Error: El nombre del archivo debe contener el código en formato CIT1000_CA16');
          return;
        }
      }
    } catch (error) {
      console.error('Error al seleccionar archivo:', error);
      setUploadStatus('Error al seleccionar archivo');
    }
  };

  const cleanStudentData = (student: any) => {
    const fullName = student.Student?.trim() || '';
    
    if (fullName === 'Points Possible') {
      return null;
    }

    const normalizeText = (text: string) => {
      return text
        .replace(/Ã¡/g, 'á')
        .replace(/Ã©/g, 'é')
        .replace(/Ã­/g, 'í')
        .replace(/Ã³/g, 'ó')
        .replace(/Ãº/g, 'ú')
        .replace(/Ã±/g, 'ñ')
        .replace(/Ã/g, 'Á')
        .replace(/Ã‰/g, 'É')
        .replace(/Ã/g, 'Í')
        .replace(/Ã"/g, 'Ó')
        .replace(/Ãš/g, 'Ú')
        .replace(/Ã'/g, 'Ñ')
        .replace(/\\x81/g, 'Á')
        .replace(/\\x8D/g, 'Í')
        .replace(/\\x93/g, 'Ó')
        .replace(/\\x9A/g, 'Ú')
        .replace(/\\x91/g, 'Ñ')
        .replace(/\\x8DN/g, 'ÍN')
        .replace(/\\x81S/g, 'ÁS')
        .replace(/\\x93N/g, 'ÓN')
        .replace(/\\x9AS/g, 'ÚS')
        .replace(/\\x91O/g, 'ÑO')
        .replace(/"/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const nameParts = fullName.split(',').map((part: string) => normalizeText(part.trim()));
    if (nameParts.length < 2) {
      console.warn('Formato de nombre inválido:', fullName);
      return null;
    }

    const apellido = nameParts[0];
    const nombre = nameParts[1];
    const nombreCompleto = `${nombre} ${apellido}`;
    const primerNombre = nombre.split(' ')[0]; // Extraer solo el primer nombre

    const id = student.ID?.trim() || '';
    const sisUserId = student['SIS User ID']?.trim() || '';
    const sisLoginId = student['SIS Login ID']?.trim() || '';

    console.log('Datos del estudiante procesados:', {
      id: id,
      nombreCompleto: nombreCompleto,
      primerNombre: primerNombre
    });

    return {
      id: id,
      Nombre: primerNombre,
      NombreCompleto: nombreCompleto,
      Rut: sisUserId,
      Email: sisLoginId
    };
  };

  const processCSVInBatches = async (fileUri: string) => {
    try {
      let fileContent: string;
      
      if (Platform.OS === 'web') {
        // Leer el archivo directamente como texto UTF-8
        const response = await fetch(fileUri);
        const blob = await response.blob();
        fileContent = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const content = reader.result as string;
            // Verificar si el contenido está en base64
            if (content.startsWith('data:text/csv;base64,')) {
              try {
                // Extraer la parte base64 y decodificarla
                const base64Content = content.split(',')[1];
                // Usar TextDecoder para manejar correctamente la codificación UTF-8
                const binaryString = atob(base64Content);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                const decodedContent = new TextDecoder('utf-8').decode(bytes);
                console.log('Contenido decodificado correctamente:', decodedContent.substring(0, 200));
                resolve(decodedContent);
              } catch (error) {
                console.error('Error al decodificar base64:', error);
                reject(error);
              }
            } else {
              resolve(content);
            }
          };
          reader.onerror = reject;
          reader.readAsText(blob, 'UTF-8');
        });
      } else {
        fileContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.UTF8
        });
      }

      console.log('Contenido decodificado del archivo CSV:', fileContent);

      // Procesar el CSV línea por línea
      const lines = fileContent.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
          // Usar una expresión regular más robusta para manejar campos con comillas
          const matches = line.match(/"([^"]*)",([^,]*),([^,]*),([^,]*),([^,]*)/);
          if (matches) {
            return {
              Student: matches[1],
              ID: matches[2],
              'SIS User ID': matches[3],
              'SIS Login ID': matches[4],
              Section: matches[5]
            };
          }
          return null;
        })
        .filter(line => line !== null);

      console.log('Líneas procesadas del CSV:', lines.length);
      console.log('Primera línea de ejemplo:', lines[0]);

      const headers = ['Student', 'ID', 'SIS User ID', 'SIS Login ID', 'Section'];
      console.log('Encabezados del CSV:', headers);

      const batchSize = 50;
      const totalBatches = Math.ceil((lines.length - 1) / batchSize);
      
      console.log('Configuración de lotes:', {
        batchSize,
        totalBatches,
        totalLines: lines.length
      });

      setUploadStatus('Procesando archivo...');
      setUploadProgress(0);

      for (let i = 1; i < lines.length; i += batchSize) {
        const batch = lines.slice(i, i + batchSize);
        console.log(`Procesando lote ${Math.floor(i/batchSize) + 1} de ${totalBatches}`);
        console.log('Tamaño del lote actual:', batch.length);

        const batchData = batch
          .map(line => cleanStudentData(line))
          .filter(student => student !== null);

        console.log('Datos limpios del lote:', batchData.length, 'estudiantes');

        if (batchData.length === 0) {
          console.log('Lote vacío, saltando...');
          continue;
        }

        const url = `${API_URL}/api/db/sections/students/batch`;
        console.log('URL del endpoint:', url);
        console.log('Datos a enviar:', JSON.stringify({ 
          students: batchData,
          curso: {
            codigo: cit,
            nombre: nombre,
            dias: diasSeleccionados,
            bloque: bloqueSeleccionado ? bloqueSeleccionado.slice(-5) : ''
          }
        }, null, 2));

        try {
          console.log('Iniciando petición al backend...');
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Profesor-ID': userData?.profesorId || ''
            },
            body: JSON.stringify({ 
              students: batchData,
              curso: {
                codigo: cit,
                nombre: nombre,
                dias: diasSeleccionados,
                bloque: bloqueSeleccionado ? bloqueSeleccionado.slice(-5) : ''
              }
            }),
          });

          console.log('Respuesta recibida:', response.status, response.statusText);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Error en la respuesta del servidor:', errorText);
            throw new Error(`Error en lote ${Math.floor(i/batchSize) + 1}: ${errorText}`);
          }

          const responseData = await response.json();
          console.log('Datos de respuesta:', responseData);
        } catch (error) {
          console.error('Error completo:', error);
          throw error;
        }

        const progress = Math.round(((i + batch.length - 1) / (lines.length - 1)) * 100);
        setUploadProgress(progress);
        setUploadStatus(`Procesando lote ${Math.floor(i/batchSize) + 1} de ${totalBatches}`);
      }

      console.log('Proceso completado exitosamente');
      setUploadStatus('¡Archivo procesado con éxito!');
      setTimeout(() => {
        setCsvModalVisible(false);
        setUploadProgress(0);
        setUploadStatus('');
        setSelectedFile(null);
      }, 2000);
    } catch (error) {
      console.error('Error procesando CSV:', error);
      setUploadStatus('Error al procesar el archivo');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile?.assets || selectedFile.assets.length === 0) {
      setUploadStatus('Por favor, seleccione un archivo primero');
      return;
    }

    if (!cit || !nombre) {
      setUploadStatus('Error: No se pudo extraer el código o la sección del archivo');
      return;
    }

    const fileUri = Platform.OS === 'web' 
      ? URL.createObjectURL(new Blob([selectedFile.assets[0].uri]))
      : selectedFile.assets[0].uri;

    await processCSVInBatches(fileUri);
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
                  {selectedFile?.assets && selectedFile.assets.length > 0 ? 'Cambiar archivo' : 'Seleccionar archivo'}
                </Text>
              </TouchableOpacity>

              {selectedFile?.assets && selectedFile.assets.length > 0 && (
                <Text style={styles.fileName}>{selectedFile.assets[0].name}</Text>
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

              {uploadProgress > 0 && (
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
                  <Text style={styles.progressText}>{uploadProgress}%</Text>
                </View>
              )}

              <Text style={styles.statusText}>{uploadStatus}</Text>

              <TouchableOpacity 
                style={[
                  styles.uploadButton,
                  (!selectedFile?.assets || selectedFile.assets.length === 0 || diasSeleccionados.length === 0 || !bloqueSeleccionado) && styles.uploadButtonDisabled
                ]} 
                onPress={handleUpload}
                disabled={!selectedFile?.assets || selectedFile.assets.length === 0 || diasSeleccionados.length === 0 || !bloqueSeleccionado}
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