// AttendanceList.js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

// Demo data for fallback
const demoStudent = {
    nombre: 'Juan Pérez',
    asistencia: [1, 1, 0, 1, 0, 1, 1, 0, 1],
};
const demoCourse = { nombre: 'Sistemas Operativos - Sección 4' };

const TOTAL_CLASSES = 20;
const START_DATE = new Date(2024, 2, 4); // e.g., March 4, 2024 (Monday)

function getClassDates(count) {
    // Generate 'count' dates, one week apart
    const dates = [];
    for (let i = 0; i < count; i++) {
        const d = new Date(START_DATE);
        d.setDate(d.getDate() + i * 7);
        dates.push(d);
    }
    return dates;
}

export default function AttendanceListStudent({ route, navigation }) {
    // Try to get student and course from params, else use demo
    const { student = demoStudent, course = demoCourse } = route.params || {};
    const totalClases = TOTAL_CLASSES;
    const asistencias = student.asistencia.filter(a => a === 1).length;
    const faltas = student.asistencia.filter(a => a === 0).length;
    const porcentaje = student.asistencia.length > 0 ? Math.round((asistencias / student.asistencia.length) * 100) : 0;

    // Prepare attendance array (fill with null for future classes)
    const attendanceArray = [
        ...student.asistencia,
        ...Array(TOTAL_CLASSES - student.asistencia.length).fill(null)
    ];
    const classDates = getClassDates(TOTAL_CLASSES);

    return (
        <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={StylesHeader.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>{'<'} Volver</Text>
                </TouchableOpacity>
                <Image
                    source={{ uri: 'https://www.udp.cl/cms/wp-content/uploads/2021/06/UDP_LogoRGB_2lineas_Blanco_SinFondo.png' }}
                    style={styles.image}
                    resizeMode="contain"
                />
                <Text style={StylesHeader.headerText}>
                    {course.nombre}
                </Text>
            </View>
            <View style={styles.container}>
                <View style={styles.summaryBox}>
                    <Text style={styles.studentName}>{student.nombre}</Text>
                    <Text style={styles.percent}>{porcentaje}% asistencia</Text>
                    <Text style={styles.stats}>{asistencias} asistencias, {faltas} faltas</Text>
                    <Text style={styles.stats}>{totalClases} clases en total</Text>
                    <View style={styles.circlesRow}>
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

// Header reutilizado
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
        zIndex: 10,
    },
    headerText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },
});

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10, marginTop: 60, alignItems: 'center', justifyContent: 'center' },
    image: {
        width: 250,
        height: 250,
        marginRight: 20 },
    summaryBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    studentName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#8B0000',
    },
    percent: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#388e3c',
        marginBottom: 12,
    },
    stats: {
        fontSize: 18,
        color: '#333',
        marginBottom: 6,
    },
    circlesRow: {
        flexDirection: 'row',
        marginTop: 28,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    circleCol: {
        alignItems: 'center',
        marginHorizontal: 6,
    },
    dateLabel: {
        fontSize: 13,
        color: '#888',
        marginBottom: 4,
        fontWeight: 'bold',
    },
    circle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        marginBottom: 2,
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
        marginRight: 12,
        padding: 6,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});