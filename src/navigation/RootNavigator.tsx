import React from 'react';
import { useSelector } from 'react-redux';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/auth/SplashScreen';
import AuthStack from './AuthStack';
import AppDrawerNavigator from './AppDrawerNavigator';
import type { RootState } from '../redux/store';

const Stack = createNativeStackNavigator();

// Root
export default function RootNavigator() {
  const isInitializing = useSelector((state: RootState) => state.auth.isInitializing);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isInitializing ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : isAuthenticated ? (
        <Stack.Screen name="App" component={AppDrawerNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}