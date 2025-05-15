import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, Image, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './LoginScreen';
import Courses from './Courses';
import CoursesStudent from './CoursesStudent';
import AttendanceList from './AttendanceList';
import AttendanceListStudent from './AttendanceListStudent';

const Stack = createStackNavigator();

const linking = {
  prefixes: ['http://localhost'],
  config: {
    screens: {
      Home: '',
      Login: 'login',
      Courses: 'courses',
      CoursesStudent:'coursesstudent',
      AttendanceList: 'attendancelist',
      AttendanceListStudent: 'attendanceliststudent',
    }
  },
};

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

function HomeScreen({ navigation}) {
  const fullText = "Bienvenido a MySQR";
  const [displayedText, setDisplayedText] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const startTypingAnimation = () => {
    setDisplayedText(""); 
    let currentIndex = 0;

    //Animacion de texto
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    //Animacion de escritura
    intervalRef.current = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(intervalRef.current);
        
        timeoutRef.current = setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(() => {
            startTypingAnimation(); 
          });
        }, 6000);
      }
    }, 150);
  };


  useEffect(() => {
    startTypingAnimation();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={StylesHeader.header}>
        <Text style={styles.headerText}></Text>
      </View>

      <Image
        source={{ uri: 'https://ambientesdigital.com/wp-content/uploads/2017/03/udp-logo.jpg' }}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Texto animado */}
      <View style={styles.textContainer}>
        <Animated.Text 
          style={[
            styles.welcomeText, 
            { 
              opacity: fadeAnim,
              textAlign: 'center',
            }
          ]}
          numberOfLines={1}
        >
          {displayedText}
          <Text style={{ 
            opacity: displayedText.length === fullText.length ? 0 : 1,
            color: 'black' 
          }}>|</Text>
        </Animated.Text>
      </View>


      <MyButton
        title="Navigate"
        onPress={() => navigation.navigate('Login')}
      />

    </View>
  );
}

export default function App() {
  return (
      <NavigationContainer linking={linking}>
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Courses" component={Courses} />
          <Stack.Screen name="CoursesStudent" component={CoursesStudent} />
          <Stack.Screen name="AttendanceList" component={AttendanceList} />
          <Stack.Screen name="AttendanceListStudent" component={AttendanceListStudent} />
        </Stack.Navigator>
      </NavigationContainer>
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
    justifyContent: 'center',
    alignItems: 'center',
  },  
  headerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
});
// Text styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfbfb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainText: {
    alignItems: 'left',
    justifyContent: 'left',
    backgroundColor: '#10B981', // Verde Tailwind
    padding: 20,
    borderRadius: 100,
  },
  button: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    justifyContent: 'flex-end',
  },
  buttonPressed: {
    backgroundColor: '#8B0000',
    transform: [{ scale: 1 }],
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  bottomSection: {
    alignItems: 'center',
    padding: 50,
  },
  image: {
    width: 200, 
    height: 200,
    borderRadius: 50,
  },
  welcomeText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#8B0000',
    fontFamily: 'comic sans', // Puedes cambiar a otra fuente
  },
});
