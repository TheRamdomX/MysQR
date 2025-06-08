import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';

import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack initialRouteName="index">
          {/* Public Routes - Only accessible when NOT authenticated */}
          <Stack.Screen 
            name="index" 
            options={{ 
              headerShown: false,
              animation: 'none'
            }}
          />
          <Stack.Screen name="role-select" options={{ headerShown: false }} />
          <Stack.Screen name="login-student" options={{ headerShown: false }} />
          <Stack.Screen name="login-teacher" options={{ headerShown: false }} />
          
          {/* Teacher Routes - Only accessible by teachers */}
          <Stack.Screen name="courses" options={{ headerShown: false }} />
          <Stack.Screen name="attendance-list" options={{ headerShown: false }} />
          
          {/* Student Routes - Only accessible by students */}
          <Stack.Screen name="student-courses" options={{ headerShown: false }} />
          <Stack.Screen name="student-view" options={{ headerShown: false }} />
          <Stack.Screen name="attendance-list-student" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
