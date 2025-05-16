import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

interface Attendance {
  [key: string]: boolean;
}

interface Student {
  id: string;
  name: string;
  attendance: Attendance;
}

const demoDates = [
  '03-01', '03-08', '03-15', '03-22', '03-29',
  '04-05', '04-12', '04-19', '04-26',
  '05-03', '05-10', '05-17', '05-24', '05-31',
  '06-07', '06-14', '06-21', '06-28'
];

const demoStudents: Student[] = [
  { 
    id: '1', 
    name: 'Juan Pérez', 
    attendance: { 
      '03-01': true, '03-08': false, '03-15': true, '03-22': true, '03-29': false,
      '04-05': true, '04-12': true, '04-19': false, '04-26': true,
      '05-03': true, '05-10': false, '05-17': true, '05-24': true, '05-31': false,
      '06-07': true, '06-14': true, '06-21': false, '06-28': true
    } 
  },
  { 
    id: '2', 
    name: 'María García', 
    attendance: { 
      '03-01': true, '03-08': true, '03-15': true, '03-22': false, '03-29': true,
      '04-05': true, '04-12': false, '04-19': true, '04-26': true,
      '05-03': false, '05-10': true, '05-17': true, '05-24': false, '05-31': true,
      '06-07': true, '06-14': false, '06-21': true, '06-28': true
    } 
  },
  { 
    id: '3', 
    name: 'Carlos López', 
    attendance: { 
      '03-01': false, '03-08': true, '03-15': true, '03-22': true, '03-29': true,
      '04-05': true, '04-12': true, '04-19': false, '04-26': true,
      '05-03': true, '05-10': true, '05-17': false, '05-24': true, '05-31': true,
      '06-07': false, '06-14': true, '06-21': true, '06-28': true
    } 
  },
  { 
    id: '4', 
    name: 'Ana Martínez', 
    attendance: { 
      '03-01': true, '03-08': true, '03-15': false, '03-22': true, '03-29': true,
      '04-05': false, '04-12': true, '04-19': true, '04-26': false,
      '05-03': true, '05-10': true, '05-17': true, '05-24': false, '05-31': true,
      '06-07': true, '06-14': false, '06-21': true, '06-28': true
    } 
  },
  { 
    id: '5', 
    name: 'Pedro Sánchez', 
    attendance: { 
      '03-01': true, '03-08': false, '03-15': true, '03-22': false, '03-29': true,
      '04-05': true, '04-12': true, '04-19': true, '04-26': false,
      '05-03': false, '05-10': true, '05-17': true, '05-24': true, '05-31': false,
      '06-07': true, '06-14': true, '06-21': false, '06-28': true
    } 
  },
];

export default function AttendanceList() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams();

  return (
    <View style={{ flex: 1 }}>
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

      <View style={styles.container}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <View style={[styles.cell, styles.nameCell]}>
                <Text style={styles.headerText}>Estudiante</Text>
              </View>
              {demoDates.map((date) => (
                <View key={date} style={styles.cell}>
                  <Text style={styles.headerText}>{date}</Text>
                </View>
              ))}
            </View>

            <ScrollView>
              {demoStudents.map((student) => (
                <View key={student.id} style={styles.row}>
                  <View style={[styles.cell, styles.nameCell]}>
                    <Text style={styles.studentName}>{student.name}</Text>
                  </View>
                  {demoDates.map((date) => (
                    <View key={date} style={styles.cell}>
                      <View
                        style={[
                          styles.attendanceIndicator,
                          student.attendance[date] ? styles.present : styles.absent,
                        ]}
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
  attendanceIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  present: {
    backgroundColor: '#4CAF50',
  },
  absent: {
    backgroundColor: '#F44336',
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
}); 