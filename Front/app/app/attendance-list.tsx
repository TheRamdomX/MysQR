import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ProtectedRoute from '../components/ProtectedRoute';

const API_URL = 'http://localhost:8088';

interface Attendance {
  [key: string]: {
    estado: string;
    alumno_id: number;
    modulo_id: number;
  };
}

interface Student {
  estudiante: string;
  estudiante_id: number;
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
  const [editedAttendance, setEditedAttendance] = useState<Student[] | null>(null);
  const [hoveredStudent, setHoveredStudent] = useState<string | null>(null);
  const [modifiedAttendance, setModifiedAttendance] = useState<{ [key: string]: Attendance }>({});

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/db/attendance/report?seccion_id=${courseId}`);
        if (!response.ok) {
          throw new Error('Error al cargar los datos de asistencia');
        }
        const data: any[] = await response.json();
        // Mapea los datos para incluir estudiante_id
        const mappedData: Student[] = data.map((student: any) => ({
          estudiante: student.estudiante,
          estudiante_id: student.estudiante_id, 
          asistencia: student.asistencia,
        }));
        setStudents(mappedData);

        // Extraer todas las fechas únicas de las asistencias
        const uniqueDates = new Set<string>();
        mappedData.forEach(student => {
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

  // Función para calcular el porcentaje de asistencia
  const calcularPorcentajeAsistencia = () => {
    let total = 0;
    let presentes = 0;
    students.forEach((student) => {
      dates.forEach((date) => {
        total++;
        if (student.asistencia[date]?.estado === '🟢') {
          presentes++;
        }
      });
    });
    if (total === 0) return 0;
    return Math.round((presentes / total) * 100);
  };

  const porcentajeAsistencia = calcularPorcentajeAsistencia();
  const porcentajeMinimo = 70;

  // Función para manejar el click en un punto de asistencia
  const handleToggleAttendance = (studentIdx: number, date: string) => {
    if (!editMode || !editedAttendance) return;
    setEditedAttendance(prev => {
      if (!prev) return prev;
      const newData = [...prev];
      const student = { ...newData[studentIdx] };
      const asistencia = { ...student.asistencia };
      asistencia[date] = {
        ...asistencia[date],
        estado: asistencia[date]?.estado && asistencia[date]?.estado !== '❌' && asistencia[date]?.estado !== '🔴' ? '🔴' : '🟢'
      };
      student.asistencia = asistencia;
      newData[studentIdx] = student;
      return newData;
    });
  };

  const handleEdit = () => {
    setEditedAttendance(JSON.parse(JSON.stringify(students)));
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditedAttendance(null);
  };

  const handleSave = async () => {
    try {
      if (editedAttendance) {
        for (const student of editedAttendance) {
          for (const date in student.asistencia) {
            const asistenciaData = student.asistencia[date];
            const isPresent = asistenciaData.estado === '🟢';

            if (isPresent) {
              const requestData = {
                alumno_id: Number(asistenciaData.alumno_id),
                seccion_id: Number(courseId),
                modulo_id: Number(asistenciaData.modulo_id)
              };

              console.log('Enviando datos:', requestData);

              const response = await fetch(`${API_URL}/api/db/attendance/manual`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
              });

              if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Error al guardar asistencia: ${errorData}`);
              }

              console.log('Registro de asistencia exitoso:', {
                ...requestData,
                estado: asistenciaData.estado
              });
            }
          }
        }
        setStudents(editedAttendance);
      }
      setEditMode(false);
      setEditedAttendance(null);
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      // Aquí podrías agregar un mensaje de error para el usuario
    }
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
    <ProtectedRoute>
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
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Asistencia General</Text>
              <Text style={styles.cardValue}>{porcentajeAsistencia}%</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Mínimo para aprobar</Text>
              <Text style={styles.cardValue}>{porcentajeMinimo}%</Text>
            </View>
            <View style={styles.editButtonsContainer}>
              {!editMode ? (
                <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                  <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
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
                {(editMode ? (editedAttendance || []) : students).map((student, studentIdx) => (
                  <View key={student.estudiante} style={styles.row}>
                    <View style={[styles.cell, styles.nameCell]}>
                      {Platform.OS === 'web' ? (
                        <div
                          onMouseEnter={() => setHoveredStudent(student.estudiante)}
                          onMouseLeave={() => setHoveredStudent(null)}
                          style={{ position: 'relative', width: '100%' }}
                        >
                          <Text style={styles.studentName}>{student.estudiante}</Text>
                          {hoveredStudent === student.estudiante && (
                            <View style={styles.tooltip}>
                              <Text style={styles.tooltipText}>
                                {(() => {
                                  const total = dates.length;
                                  const presentes = dates.filter(date => student.asistencia[date]?.estado === '🟢').length;
                                  return total === 0 ? '0%' : `${Math.round((presentes / total) * 100)}% asistencia`;
                                })()}
                              </Text>
                            </View>
                          )}
                        </div>
                      ) : (
                        <View style={{ position: 'relative', width: '100%' }}>
                          <Text style={styles.studentName}>{student.estudiante}</Text>
                        </View>
                      )}
                    </View>
                    {dates.map((date) => (
                      <View key={date} style={styles.cell}>
                        {editMode ? (
                          <TouchableOpacity onPress={() => handleToggleAttendance(studentIdx, date)}>
                            <View style={student.asistencia[date]?.estado && student.asistencia[date]?.estado !== '❌' && student.asistencia[date]?.estado !== '🔴' ? styles.dotGreen : styles.dotRed} />
                          </TouchableOpacity>
                        ) : (
                          student.asistencia[date]?.estado && student.asistencia[date]?.estado !== '❌' && student.asistencia[date]?.estado !== '🔴' ? (
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
    padding: 6,
    marginTop: 0,
  },
  image: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  headerRowRounded: {
    flexDirection: 'row',
    backgroundColor: '#8B0000',
    paddingVertical: 6,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
    zIndex: 2,
  },
  backButtonText: {
    color: '#8B0000',
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
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    minWidth: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    color: '#8B0000',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
  cardValue: {
    color: '#8B0000',
    fontWeight: 'bold',
    fontSize: 22,
  },
  tableCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'visible',
  },
  editButton: {
    backgroundColor: '#8B0000',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  cancelButton: {
    backgroundColor: '#F44336',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  mainContentRow: {
    width: '100%',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  cardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  editButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 24,
    gap: 8,
  },
  tooltip: {
    position: 'absolute',
    left: 0,
    top: 28,
    backgroundColor: '#8B0000',
    opacity: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderWidth: 3,
    borderColor: '#fff',
    zIndex: 9999,
    minWidth: 110,
    alignItems: 'center',
    boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  tooltipText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
});
