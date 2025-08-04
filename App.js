import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen.js';
import EditSongScreen from './screens/EditSongScreen'; // importa la nueva pantalla

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
  <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Mis canciones' }} />
  <Stack.Screen name="EditSong" component={EditSongScreen} options={{ title: 'Editar canción' }} />
</Stack.Navigator>
    </NavigationContainer>
  );
}
