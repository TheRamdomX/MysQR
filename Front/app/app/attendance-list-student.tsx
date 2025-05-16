import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const demoStudent = {
  nombre: 'Juan Pérez',
  asistencia: [1, 1, 0, 1, 0, 1, 1, 0, 1],
};

const demoCourse = { nombre: 'Sistemas Operativos - Sección 4' };

const TOTAL_CLASSES = 20;
const START_DATE = new Date(2024, 2, 4); // March 4, 2024 (Monday)

function getClassDates(count: number) {
  const dates = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(START_DATE);
    d.setDate(d.getDate() + i * 7);
    dates.push(d);
  }
  return dates;
}

export default function AttendanceListStudent() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams();
  const [hora, setHora] = useState('');
  const student = demoStudent;
  const course = demoCourse;
  const totalClases = TOTAL_CLASSES;
  const asistencias = student.asistencia.filter(a => a === 1).length;
  const faltas = student.asistencia.filter(a => a === 0).length;
  const porcentaje = student.asistencia.length > 0 ? Math.round((asistencias / student.asistencia.length) * 100) : 0;

  useEffect(() => {
    const actualizarHora = () => {
      const ahora = new Date();
      const h = ahora.getHours().toString().padStart(2, '0');
      const m = ahora.getMinutes().toString().padStart(2, '0');
      const s = ahora.getSeconds().toString().padStart(2, '0');
      setHora(`${h}:${m}:${s}`);
    };
    actualizarHora();
    const timer = setInterval(actualizarHora, 1000);
    return () => clearInterval(timer);
  }, []);

  const attendanceArray = [
    ...student.asistencia,
    ...Array(TOTAL_CLASSES - student.asistencia.length).fill(null)
  ];
  const classDates = getClassDates(TOTAL_CLASSES);

  const getCirclesPerRow = () => {
    if (SCREEN_WIDTH < 600) return 4;
    if (SCREEN_WIDTH < 900) return 6;
    return 8;
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        {isWeb && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>{'<'} Volver</Text>
          </TouchableOpacity>
        )}
        <Image
          source={{ uri: 'https://www.udp.cl/cms/wp-content/uploads/2021/06/UDP_LogoRGB_2lineas_Blanco_SinFondo.png' }}
          style={styles.image}
          resizeMode="contain"
        />
        <View style={styles.horaContainer}>
          <Text style={styles.horaText}>{hora}</Text>
        </View>
      </View>
      <View style={styles.container}>
        <View style={styles.summaryBox}>
          <Text style={styles.studentName}>{course.nombre}</Text>
          <Text style={styles.percent}>{porcentaje}% asistencia</Text>
          <Text style={styles.stats}>{asistencias} asistencias, {faltas} faltas</Text>
          <Text style={styles.stats}>{totalClases} clases en total</Text>
          <View style={[styles.circlesRow, { justifyContent: 'flex-start' }]}>
            {attendanceArray.map((asistio, idx) => {
              let label;
              if (asistio === 1 || asistio === 0) {
                const d = classDates[idx];
                label = `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
              } else {
                label = '**/**';
              }
              return (
                <View key={idx} style={styles.circleCol}>
                  <Text style={styles.dateLabel}>{label}</Text>
                  <View
                    style={[styles.circle, asistio === 1 ? styles.attended : (asistio === 0 ? styles.notAttended : styles.future)]}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    width: '100%',
    height: isWeb ? 100 : 80,
    backgroundColor: '#8B0000',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    position: 'absolute',
    paddingTop: isWeb ? 0 : 32,
    top: 0,
    zIndex: 1,
  },
  headerText: {
    color: '#fff',
    fontSize: isWeb ? 26 : 22,
    fontWeight: 'bold',
  },
  container: {
    paddingTop: isWeb ? 25 : 32,
    backgroundColor: '#f5f5f5',
    padding: SCREEN_WIDTH * 0.02,
    maxWidth: '95%',
    marginTop: isWeb ? 80 : 60,
  },
  horaContainer: {
    position: 'absolute',
    right: SCREEN_WIDTH * 0.04,
    top: isWeb ? 35 : 10,
    borderRadius: 8,
    paddingHorizontal: SCREEN_WIDTH * 0.02,
    paddingTop: isWeb ? 10 : 32,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0)',
  },
  horaText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: isWeb ? 20 : 18,
  },
  image: {
    width: isWeb ? 300 : 100,
    height: isWeb ? 300 : 250,
    marginRight: SCREEN_WIDTH * 0.02,
  },
  summaryBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: SCREEN_WIDTH * 0.04,
    margin: SCREEN_WIDTH * 0.02,
    elevation: 3,
    alignItems: 'center',
    width: '100%',
    ...(isWeb && {
      maxWidth: 1200,
      alignSelf: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }),
  },
  studentName: {
    fontSize: isWeb ? 28 : 24,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 10,
    textAlign: 'center',
  },
  percent: {
    fontSize: isWeb ? 24 : 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
    textAlign: 'center',
  },
  stats: {
    fontSize: isWeb ? 18 : 16,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  circlesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
    justifyContent: 'flex-start',
  },
  circleCol: {
    alignItems: 'center',
    margin: SCREEN_WIDTH * 0.01,
    width: isWeb ? 60 : 40,
  },
  dateLabel: {
    fontSize: isWeb ? 14 : 12,
    color: '#666',
    marginBottom: 4,
  },
  circle: {
    width: isWeb ? 36 : 28,
    height: isWeb ? 36 : 28,
    borderRadius: isWeb ? 18 : 14,
    backgroundColor: '#ccc',
    borderWidth: 2,
    borderColor: '#bbb',
  },
  attended: {
    backgroundColor: '#4caf50',
    borderColor: '#388e3c',
  },
  notAttended: {
    backgroundColor: '#ccc',
    borderColor: '#bbb',
  },
  future: {
    backgroundColor: '#eee',
    borderColor: '#bbb',
  },
  backButton: {
    marginRight: SCREEN_WIDTH * 0.02,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#fff',
    width: 100,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: isWeb ? 18 : 16,
  },
}); 