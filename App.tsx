import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Navigator from './src/navigation/navigator';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import SQLite from 'react-native-sqlite-storage';
import PushNotification from 'react-native-push-notification';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    const db = SQLite.openDatabase(
      { name: 'salatTracker.db', location: 'default' },
      () => {
        // Success callback
        db.transaction(tx => {
          // tx.executeSql(`DROP TABLE IF EXISTS prayer_log;`);
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS prayer_log (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              date TEXT NOT NULL,
              Fajr INTEGER NOT NULL DEFAULT 0,
              Dhuhr INTEGER NOT NULL DEFAULT 0,
              Asr INTEGER NOT NULL DEFAULT 0,
              Maghrib INTEGER NOT NULL DEFAULT 0,
              Isha INTEGER NOT NULL DEFAULT 0
            );`,
          );
        });
      },
      error => {
        console.log('SQLite error:', error);
      },
    );
  }, []);

  useEffect(() => {
    const db = SQLite.openDatabase(
      { name: 'salatTracker.db', location: 'default' },
      () => {
        // Success callback
        db.transaction(tx => {
          // tx.executeSql(`DROP TABLE IF EXISTS prayer_log;`);
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS prayer_reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prayer TEXT NOT NULL,
            time TEXT,
            enabled INTEGER NOT NULL DEFAULT 0
          );`,
          );
        });
      },
      error => {
        console.log('SQLite error:', error);
      },
    );
  }, []);

  useEffect(() => {
    PushNotification.createChannel(
      {
        channelId: 'prayer-reminders',
        channelName: 'Prayer Reminders',
        channelDescription: 'Reminders for daily prayers',
        importance: 4,
        vibrate: true,
      },
      created => console.log(`createChannel returned '${created}'`),
    );
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Navigator />
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <NewAppScreen
        templateFileName="App.tsx"
        safeAreaInsets={safeAreaInsets}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
