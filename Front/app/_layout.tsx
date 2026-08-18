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
        <Stack initialRouteName="(auth)/index" screenOptions={{ headerShown: false }}>
          {/* Public Routes - Only accessible when NOT authenticated */}
          <Stack.Screen name="(auth)/index" options={{ animation: 'none' }} />
          <Stack.Screen name="(auth)/role-select" />
          <Stack.Screen name="(auth)/login-student" />
          <Stack.Screen name="(auth)/login-teacher" />

          {/* Teacher Routes - Only accessible by teachers */}
          <Stack.Screen name="(teacher)/courses" />
          <Stack.Screen name="(teacher)/attendance-list" />

          {/* Student Routes - Only accessible by students */}
          <Stack.Screen name="(student)/student-courses" />
          <Stack.Screen name="(student)/attendance-list-student" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
