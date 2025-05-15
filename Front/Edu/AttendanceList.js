// AttendanceList.js
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';

const estudiantesDemo = [
    { nombre: 'Juan Pérez', asistencia: [1, 1, 0, 1, 0, 1, 1, 0, 1] },
    { nombre: 'Ana López', asistencia: [1, 0, 0, 1, 1, 1, 0, 0, 1] },
    { nombre: 'Pedro Díaz', asistencia: [0, 1, 1, 1, 0, 0, 1, 1, 1] },
    { nombre: 'Lucía Torres', asistencia: [1, 1, 1, 1, 1, 1, 1, 1, 1] },
    { nombre: 'Carlos Ruiz', asistencia: [0, 0, 0, 0, 0, 0, 0, 0, 0] },
];

export default function AttendanceList({ route }) {
    const { course } = route.params || {};

    return (
        <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={StylesHeader.header}>
                <Image
                    source={{ uri: 'https://www.udp.cl/cms/wp-content/uploads/2021/06/UDP_LogoRGB_2lineas_Blanco_SinFondo.png' }}
                    style={styles.image}
                    resizeMode="contain"
                />
                <Text style={StylesHeader.headerText}>
                    Lista de asistencia {course?.nombre ? `- ${course.nombre}` : ''}
                </Text>
            </View>

            <View style={styles.container}>
                <ScrollView horizontal>
                    <View>
                        {/* Encabezado de la tabla */}
                        <View style={styles.tableHeader}>
                            <View style={[styles.cell, styles.nameCell]}>
                                <Text style={styles.tableHeaderText}>Estudiante</Text>
                            </View>
                            {[...Array(9)].map((_, i) => (
                                <View style={styles.cell} key={i}>
                                    <Text style={styles.tableHeaderText}>{i + 1}</Text>
                                </View>
                            ))}
                        </View>
                        {/* Filas de estudiantes */}
                        {estudiantesDemo.map((est, idx) => (
                            <View style={styles.row} key={idx}>
                                <View style={[styles.cell, styles.nameCell]}>
                                    <Text style={styles.nameText}>{est.nombre}</Text>
                                </View>
                                {est.asistencia.map((asistio, j) => (
                                    <View style={styles.cell} key={j}>
                                        <View
                                            style={[
                                                styles.attendanceCircle,
                                                asistio ? styles.attended : styles.notAttended,
                                            ]}
                                        />
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                </ScrollView>
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
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10, marginTop: 60 },
    image: {
        width: 250,
        height: 250,
        marginRight: 20 },
    tableHeader: { flexDirection: 'row', backgroundColor: '#eee', borderRadius: 8, marginBottom: 4 },
    tableHeaderText: { fontWeight: 'bold', fontSize: 14, padding: 6, minWidth: 60, textAlign: 'center' },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    cell: { minWidth: 60, padding: 6, alignItems: 'center', justifyContent: 'center' },
    nameCell: { minWidth: 120, alignItems: 'flex-start' },
    attendanceCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        marginHorizontal: 2,
        backgroundColor: '#ccc',
    },
    attended: { backgroundColor: '#4caf50' },
    notAttended: { backgroundColor: '#ccc' },
    nameText: { fontSize: 14, fontWeight: 'bold' },
});