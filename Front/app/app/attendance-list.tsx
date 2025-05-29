import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, CheckBox } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const API_URL = 'http://192.168.100.18:8088';

interface Attendance {
  [key: string]: boolean;
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

  const handleCheckboxChange = (studentName: string, date: string) => {
    if (!editMode) return;

    setModifiedAttendance(prev => {
      const updatedAttendance = { ...prev };
      if (!updatedAttendance[studentName]) {
        updatedAttendance[studentName] = {};
      }
      updatedAttendance[studentName][date] = !updatedAttendance[studentName][date];
      return updatedAttendance;
    });
  };

  const handleConfirmChanges = async () => {
    try {
      for (const studentName in modifiedAttendance) {
        for (const date in modifiedAttendance[studentName]) {
          const isPresent = modifiedAttendance[studentName][date];
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
    } catch (error) {
      console.error('Error al confirmar cambios:', error);
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
    <View style={{ flex: 1 }}>
      <View style={[StylesHeader.header, { flexDirection: 'row', alignItems: 'center' }]}>
        <TouchableOpacity onPress={() => router.push('/courses')} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'< Volver'}</Text>
        </TouchableOpacity>
        <Image
          source={{ uri: 'https://www.udp.cl/cms/wp-content/uploads/2021/06/UDP_LogoRGB_2lineas_Blanco_SinFondo.png' }}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={StylesHeader.headerText}>Lista de Asistencia</Text>

        <TouchableOpacity
          style={[styles.editButton, { marginLeft: 'auto' }]}
          onPress={() => {
            if (!editMode) {
              setEditMode(true);
            } else {
              handleConfirmChanges();
            }
          }}
        >
          <Text style={styles.editButtonText}>
            {editMode ? 'Confirmar cambios' : 'Editar lista manualmente'}
          </Text>
        </TouchableOpacity>
        {editMode && (
          <TouchableOpacity
            style={[styles.cancelButton, { marginLeft: 10 }]} // Botón de cancelar
            onPress={() => setEditMode(false)}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.container}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
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
                      <CheckBox
                        value={modifiedAttendance[student.estudiante]?.[date] ?? student.asistencia[date]}
                        onValueChange={() => handleCheckboxChange(student.estudiante, date)}
                        disabled={!editMode}
                      />
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const StylesHeader = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 60,
    backgroundColor: '#8B0000',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
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
    backgroundColor: '#f5f5f5',
    padding: 6,
    marginTop: 60,
  },
  image: {
    width: 200,
    height: 200,
    marginRight: 12,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#8B0000',
    paddingVertical: 6,
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
  attendanceText: {
    fontSize: 16,
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
  cancelButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: '#fff',
    alignSelf: 'center',
  },
  cancelButtonText: {
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
});