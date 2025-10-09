import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { RootNavigator } from './src/navigation';
import { Colors } from './src/theme';

export default function App() {
  return (
    <Provider store={store}>
      <StatusBar 
        style="light" 
        backgroundColor={Colors.primary}
        translucent={false}
      />
      <RootNavigator />
    </Provider>
  );
}
