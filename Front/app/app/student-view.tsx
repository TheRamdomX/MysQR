import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ProtectedRoute from '../components/ProtectedRoute';

interface CourseInfo {
  name: string;
  teacher: string;
  schedule: string;
  location: string;
}

export default function StudentView() {
  const { courseId } = useLocalSearchParams();
  const router = useRouter();
  const [courseInfo] = useState<CourseInfo>({
    name: 'Mathematics 101',
    teacher: 'Dr. Smith',
    schedule: 'Monday, Wednesday 10:00 AM - 11:30 AM',
    location: 'Room 101',
  });

  return (
    <ProtectedRoute allowedRoles={['alumno', 'student']}>
      <View style={styles.container}>
        <Text style={styles.title}>{courseInfo.name}</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Teacher:</Text>
          <Text style={styles.value}>{courseInfo.teacher}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Schedule:</Text>
          <Text style={styles.value}>{courseInfo.schedule}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Location:</Text>
          <Text style={styles.value}>{courseInfo.location}</Text>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push(`/attendance-list-student?courseId=${courseId}` as any)}
        >
          <Text style={styles.buttonText}>View Attendance</Text>
        </TouchableOpacity>
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 