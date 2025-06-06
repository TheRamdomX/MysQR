import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ProtectedRoute from '../components/ProtectedRoute';

const API_URL = 'http://localhost:8088';

interface Attendance {
  [key: string]: string;
}

interface Student {
  estudiante: string;
  asistencia: Attendance;
}

export default function AttendanceList() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dates, setDates] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [modifiedAttendance, setModifiedAttendance] = useState<{ [key: string]: Attendance }>({});

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/db/attendance/report?seccion_id=${courseId}`);
        if (!response.ok) {
          throw new Error('Error al cargar los datos de asistencia');
        }
        const data: Student[] = await response.json();
        setStudents(data);

        // Extraer todas las fechas únicas de las asistencias
        const uniqueDates = new Set<string>();
        data.forEach(student => {
          Object.keys(student.asistencia).forEach(date => uniqueDates.add(date));
        });
        setDates(Array.from(uniqueDates).sort());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [courseId]);

  const handleToggleAttendance = (studentName: string, date: string) => {
    if (!editMode) return;

    setModifiedAttendance(prev => {
      const updatedAttendance = { ...prev };
      if (!updatedAttendance[studentName]) {
        updatedAttendance[studentName] = {};
      }
      updatedAttendance[studentName][date] =
        updatedAttendance[studentName][date] === '🟢' ? '🔴' : '🟢';
      return updatedAttendance;
    });
  };

  const handleSaveChanges = async () => {
    try {
      for (const studentName in modifiedAttendance) {
        for (const date in modifiedAttendance[studentName]) {
          const isPresent = modifiedAttendance[studentName][date] === '🟢';
          const student = students.find(s => s.estudiante === studentName);
          if (student) {
            const alumnoID = studentName;
            const seccionID = courseId;
            const moduloID = dates.indexOf(date) + 1;

            await fetch(`${API_URL}/api/db/attendance/manual`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                AlumnoID: alumnoID,
                SeccionID: seccionID,
                ModuloID: moduloID,
              }),
            });
          }
        }
      }
      setEditMode(false);
      setModifiedAttendance({});
      await fetchAttendanceData();
    } catch (error) {
      console.error('Error al guardar cambios:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setModifiedAttendance({});
  };

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
        <TouchableOpacity style={styles.retryButton} onPress={() => router.push('/courses')}>
          <Text style={styles.retryButtonText}>Volver a intentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (

    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={StylesHeader.header}>
        <TouchableOpacity onPress={() => router.push('/courses')} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'< Volver'}</Text>
        </TouchableOpacity>
        <Image
          source={{ uri: 'https://www.udp.cl/cms/wp-content/uploads/2021/06/UDP_LogoRGB_2lineas_Blanco_SinFondo.png' }}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={StylesHeader.headerText}>Lista de Asistencia</Text>
      </View>

      <View style={styles.mainContentRow}>
        <View style={styles.cardsRow}>
          <View style={styles.editButtonsContainer}>
            {!editMode ? (
              <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(true)}>
                <Text style={styles.editButtonText}>Editar</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>

      <View style={styles.containerCentered}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tableCard}>
            <View style={styles.headerRowRounded}>
              <View style={[styles.cell, styles.nameCell]}>
                <Text style={styles.headerText}>Estudiante</Text>
              </View>
              {dates.map((date) => (
                <View key={date} style={styles.cell}>
                  <Text style={styles.headerText}>{date}</Text>
                </View>
              ))}
            </View>

            <ScrollView>
              {students.map((student) => (
                <View key={student.estudiante} style={styles.row}>
                  <View style={[styles.cell, styles.nameCell]}>
                    <Text style={styles.studentName}>{student.estudiante}</Text>
                  </View>
                  {dates.map((date) => (
                    <View key={date} style={styles.cell}>
                      {editMode ? (
                        <TouchableOpacity onPress={() => handleToggleAttendance(student.estudiante, date)}>
                          <View
                            style={
                              modifiedAttendance[student.estudiante]?.[date] === '🟢' ||
                              (!modifiedAttendance[student.estudiante]?.[date] && student.asistencia[date] === '🟢')
                                ? styles.dotGreen
                                : styles.dotRed
                            }
                          />
                        </TouchableOpacity>
                      ) : (
                        student.asistencia[date] === '🟢' ? (
                          <View style={styles.dotGreen} />
                        ) : (
                          <View style={styles.dotRed} />
                        )
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </View>
    </ProtectedRoute>
  );
}

const StylesHeader = StyleSheet.create({
  header: {
    width: '100%',
    height: 70,
    backgroundColor: '#8B0000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  headerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  
});

const styles = StyleSheet.create({
  containerCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  tableCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRowRounded: {
    flexDirection: 'row',
    backgroundColor: '#8B0000',
    paddingVertical: 6,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 6,
  },
  cell: {
    width: 60,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameCell: {
    width: 120,
    alignItems: 'flex-start',
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  studentName: {
    fontSize: 13,
  },
  dotGreen: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#388E3C',
  },
  dotRed: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F44336',
    borderWidth: 2,
    borderColor: '#B71C1C',
  },
  backButton: {
    marginRight: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#8B0000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  editButton: {
    marginLeft: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: '#fff',
    alignSelf: 'center',
  },
  editButtonText: {
    color: '#8B0000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  saveButton: {
    marginLeft: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    alignSelf: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cancelButton: {
    marginLeft: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: '#F44336',
    alignSelf: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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

