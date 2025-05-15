// App.js (archivo principal)
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './homescreen';
import MenuLogin from './menulogin'; 
import studentView from './studentview';
import rolSelect from './rolselect';
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="MenuLogin" 
          component={MenuLogin} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="studentView" 
          component={studentView} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="rolSelect" 
          component={rolSelect} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}