import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Image } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

const initialCourses = [
    { id: '1', nombre: 'Matemáticas', cit: 'MAT101', asistencia: [true, false, true, true, false, true, true, false, true] },
    { id: '2', nombre: 'Historia', cit: 'HIS201', asistencia: [true, true, false, true, true, false, true, false, true] },
    { id: '3', nombre: 'Ciencias', cit: 'CIE301', asistencia: [false, true, true, true, false, false, true, true, true] },
];

export default function CoursesStudent({ navigation }) {
    const [courses] = useState(initialCourses);
    const [qrVisible, setQrVisible] = useState(false);
    const [hora, setHora] = useState('');

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

    const renderItem = ({ item }) => {
        const total = item.asistencia.length;
        const asistencias = item.asistencia.filter(a => a).length;
        const percent = total > 0 ? Math.round((asistencias / total) * 100) : 0;
        return (
            <View style={styles.card}>
                <Text style={styles.title}>{item.nombre}</Text>
                <Text style={styles.text}>CIT: {item.cit}</Text>
                <Text style={styles.text}>{percent}% asistencia</Text>
                <TouchableOpacity
                    style={styles.attendanceButton}
                    onPress={() => navigation.navigate('AttendanceListStudent', { course: item })}
                >
                    <Text style={styles.attendanceButtonText}>Lista de asistencia</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={StylesHeader.header}>
                <Image
                    source={{ uri: 'https://www.udp.cl/cms/wp-content/uploads/2021/06/UDP_LogoRGB_2lineas_Blanco_SinFondo.png' }}
                    style={styles.image}
                    resizeMode="contain"
                />
                <Text style={StylesHeader.headerText}>Tus Cursos</Text>
                <View style={styles.horaContainer}>
                    <Text style={styles.horaText}>{hora}</Text>
                </View>
            </View>

            <Modal visible={qrVisible} transparent animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.qrModalContent}>
                        <TouchableOpacity
                            onPress={() => setQrVisible(false)}
                            style={styles.closeIcon}
                        >
                            <AntDesign name="close" size={35} color="#fff" />
                        </TouchableOpacity>
                        <QRCode value="https://www.youtube.com/watch?v=dQw4w9WgXcQ" size={250} />
                    </View>
                </View>
            </Modal>

            <View style={styles.container}>
                <FlatList
                    data={courses}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    numColumns={3}
                    contentContainerStyle={styles.list}
                />
            </View>

            <TouchableOpacity
                style={styles.qrButton}
                onPress={() => setQrVisible(true)}
            >
                <Text style={styles.qrButtonText}>Escanear QR</Text>
            </TouchableOpacity>
        </View>
    );
}

// Header styles
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
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10, marginTop: 60 },
    list: { justifyContent: 'center' },
    closeIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
        padding: 6,
    },
    qrModalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
    },
    horaContainer: {
        position: 'absolute',
        right: 16,
        top: 10,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0)',
    },
    horaText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    image: {
        width: 250,
        height: 250,
        marginRight: 20,
    },
    card: {
        flex: 1,
        backgroundColor: '#fff',
        margin: 8,
        borderRadius: 10,
        padding: 14,
        minWidth: 100,
        maxWidth: '32%',
        elevation: 3,
        alignItems: 'flex-start',
    },
    title: { fontSize: 18, fontWeight: 'bold', color: '#8B0000', marginBottom: 4 },
    text: { fontSize: 14, marginBottom: 2 },
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
    qrButton: {
        backgroundColor: '#8B0000',
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        margin: 16,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    qrButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});