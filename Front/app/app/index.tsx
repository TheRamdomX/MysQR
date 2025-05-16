import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, Image, Animated, ViewStyle, TextStyle } from 'react-native';
import { useRouter } from 'expo-router';

interface MyButtonProps {
  title: string;
  onPress: () => void;
}

const MyButton: React.FC<MyButtonProps> = ({ title, onPress }) => (
  <Pressable
    style={({ pressed }) => [
      styles.button,
      pressed && styles.buttonPressed,
    ] as ViewStyle[]}
    onPress={onPress}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </Pressable>
);

export default function HomeScreen() {
  const router = useRouter();
  const fullText = "Bienvenido a MySQR";
  const [displayedText, setDisplayedText] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startTypingAnimation = () => {
    setDisplayedText(""); 
    let currentIndex = 0;

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    intervalRef.current = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        
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
        <Text style={StylesHeader.headerText}></Text>
      </View>

      <Image
        source={{ uri: 'https://ambientesdigital.com/wp-content/uploads/2017/03/udp-logo.jpg' }}
        style={styles.image}
        resizeMode="contain"
      />

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

      <View style={styles.bottomSection}>
        <MyButton 
          title="Comenzar" 
          onPress={() => router.push('/role-select')} 
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
  mainText: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    backgroundColor: '#10B981',
    padding: 20,
  },
  button: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: 200,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: '#8B0000',
    transform: [{ scale: 1 }],
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  bottomSection: {
    alignItems: 'center',
    padding: 60,
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
    fontFamily: 'comic sans',
  },
  textContainer: {
    marginVertical: 20,
  },
}); 