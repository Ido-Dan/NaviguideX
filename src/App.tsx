import React, { useState, useCallback, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { activateKeepAwakeAsync } from 'expo-keep-awake';
import { AppProvider } from './context/AppProvider';
import { DownloadProvider } from './context/DownloadProvider';
import { NavigationProvider } from './context/NavigationProvider';
import { ConnectedMapScreen } from './screens/MapScreen';
import { ConnectedSettingsScreen } from './screens/SettingsScreen';
import { SplashScreen } from './screens/SplashScreen';

type RootStackParamList = {
  Map: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  // Keep screen awake globally — this is a navigation app
  useEffect(() => {
    activateKeepAwakeAsync('app-global');
  }, []);

  const handleSplashComplete = useCallback(() => {
    setSplashDone(true);
  }, []);

  if (!splashDone) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <DownloadProvider>
          <NavigationProvider>
            <StatusBar barStyle="light-content" />
            <NavigationContainer>
              <Stack.Navigator
                initialRouteName="Map"
                screenOptions={{ headerShown: false }}
              >
                <Stack.Screen name="Map" component={ConnectedMapScreen} />
                <Stack.Screen
                  name="Settings"
                  component={ConnectedSettingsScreen}
                  options={{ presentation: 'modal' }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </NavigationProvider>
          </DownloadProvider>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
