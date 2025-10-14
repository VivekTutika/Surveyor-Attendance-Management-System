import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { RootNavigator } from './src/navigation';
import { Colors } from './src/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar 
          style="light" 
          backgroundColor={Colors.primary}
          translucent={false}
        />
        <RootNavigator />
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;