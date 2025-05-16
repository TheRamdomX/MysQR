// AttendanceList.js
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';

const demoFechas = [
    "2024-03-04", "2024-03-11", "2024-03-18", "2024-03-25", "2024-04-01",
    "2024-04-08", "2024-04-15", "2024-04-22", "2024-04-29", "2024-05-06",
    "2024-05-13", "2024-05-20", "2024-05-27", "2024-06-03", "2024-06-10",
    "2024-06-17", "2024-06-24", "2024-07-01", "2024-07-08", "2024-07-15"
];

const estudiantesDemo = [
    { nombre: 'Juan Pérez', asistencia: [1, 1, 0, 1, 0, 1, 1, 0, 1] },
    { nombre: 'Ana López', asistencia: [1, 0, 0, 1, 1, 1, 0, 0, 1] },
    { nombre: 'Pedro Díaz', asistencia: [0, 1, 1, 1, 0, 0, 1, 1, 1] },
    { nombre: 'Lucía Torres', asistencia: [1, 1, 1, 1, 1, 1, 1, 1, 1] },
    { nombre: 'Carlos Ruiz', asistencia: [0, 0, 0, 0, 0, 0, 0, 0, 0] },
];

export default function AttendanceList({ route, navigation }) {
    const { course } = route.params || {};
    const fechas = (course && course.fechas && Array.isArray(course.fechas)) ? course.fechas : demoFechas;
    const estudiantes = (course && course.estudiantes && Array.isArray(course.estudiantes)) ? course.estudiantes : estudiantesDemo;
    const TOTAL_CLASSES = fechas.length;

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
                    Lista de asistencia {course?.nombre ? `- ${course.nombre}` : ''}
                </Text>
            </View>
            <ScrollView style={styles.container} horizontal contentContainerStyle={{ paddingBottom: 40 }}>
                <View>
                    {/* Table header: fechas */}
                    <View style={styles.tableRow}>
                        <View style={[styles.cell, styles.nameCell]}>
                            <Text style={styles.tableHeaderText}>Estudiante</Text>
                        </View>
                        {fechas.map((f, idx) => (
                            <View style={styles.cell} key={idx}>
                                <Text style={styles.tableHeaderText}>
                                    {f !== null && f !== undefined && f !== '' && f !== '**/**' ? (() => { const d = new Date(f); return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`; })() : '**/**'}
                                </Text>
                            </View>
                        ))}
                    </View>
                    {/* Student rows */}
                    {estudiantes.map((est, idx) => {
                        const attendanceArray = [
                            ...est.asistencia,
                            ...Array(TOTAL_CLASSES - est.asistencia.length).fill(null)
                        ];
                        return (
                            <View key={idx} style={styles.tableRow}>
                                <View style={[styles.cell, styles.nameCell]}>
                                    <Text style={styles.studentName}>{est.nombre}</Text>
                                </View>
                                {attendanceArray.map((asistio, j) => (
                                    <View key={j} style={styles.cell}>
                                        <View
                                            style={[styles.circle, asistio === 1 ? styles.attended : (asistio === 0 ? styles.notAttended : styles.future)]}
                                        />
                                    </View>
                                ))}
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
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
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10, marginTop: 60 },
    image: {
        width: 250,
        height: 250,
        marginRight: 20 },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    cell: {
        minWidth: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nameCell: {
        minWidth: 120,
        alignItems: 'flex-start',
    },
    tableHeaderText: {
        fontWeight: 'bold',
        fontSize: 13,
        color: '#888',
        textAlign: 'center',
    },
    studentName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#8B0000',
    },
    circle: {
        width: 28,
        height: 28,
        borderRadius: 14,
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