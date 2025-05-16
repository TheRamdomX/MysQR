import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './HomeScreen';
import RoleSelect from './RoleSelect';
import LoginScreenStudent from './LoginScreenStudent';
import LoginScreenTeacher from './LoginScreenTeacher';
import Courses from './Courses';
import CoursesStudent from './CoursesStudent';
import StudentView from './StudentView';
import AttendanceList from './AttendanceList';
import AttendanceListStudent from './AttendanceListStudent';

const Stack = createStackNavigator();

const linking = {
    prefixes: ['http://localhost', 'https://yourdomain.com'],
    config: {
      screens: {
        HomeScreen: 'home',
        RoleSelect: 'role',
        LoginScreenStudent: 'login-student',
        LoginScreenTeacher: 'login-teacher',
        Courses: 'courses',
        CoursesStudent: 'student-courses',
        StudentView: 'student-view',
        AttendanceList: 'attendance-list',
        AttendanceListStudent: 'attendance-list-student',
      }
    }
  };

export default function App() {
  return (
    <NavigationContainer linking={linking} fallback={<></>}>
      <Stack.Navigator initialRouteName="HomeScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="RoleSelect" component={RoleSelect} />
        <Stack.Screen name="LoginScreenStudent" component={LoginScreenStudent} />
        <Stack.Screen name="LoginScreenTeacher" component={LoginScreenTeacher} />
        <Stack.Screen name="Courses" component={Courses} />
        <Stack.Screen name="CoursesStudent" component={CoursesStudent} />
        <Stack.Screen name="StudentView" component={StudentView} />
        <Stack.Screen name="AttendanceList" component={AttendanceList} />
        <Stack.Screen name="AttendanceListStudent" component={AttendanceListStudent} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
