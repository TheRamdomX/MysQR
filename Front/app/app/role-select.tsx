import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

const MyButton = ({ title, onPress }) => (
  <Pressable
    style={({ pressed }) => [
      styles.button,
      pressed && styles.buttonPressed,
    ]}
    onPress={onPress}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </Pressable>
);

export default function RolSelect() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={StylesHeader.header}>
      </View>
      <View style={styles.content}>
        <MyButton 
          title="Estudiantes" 
          onPress={() => router.push('/login-student')} 
        />
        <MyButton 
          title="Profesores" 
          onPress={() => router.push('/login-teacher')} 
        />
      </View>
      <View style={StylesFooter.footer}></View>
    </View>
  );
}

const StylesFooter = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60,
    backgroundColor: '#8B0000',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

const StylesHeader = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 60,
    backgroundColor: '#8B0000',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#FBE9E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 100,
    marginBottom: 100,
  },
  button: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: 250,
    marginVertical: 18,
  },
  buttonPressed: {
    backgroundColor: '#8B0000',
    transform: [{ scale: 1 }],
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
}); 