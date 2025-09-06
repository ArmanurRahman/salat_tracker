import LinearGradient from 'react-native-linear-gradient';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  { name: 'salatTracker.db', location: 'default' },
  () => {},
  error => {
    console.log(error);
  },
);

const styles = StyleSheet.create({
  // ...existing styles...
  bg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#b85c00',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fffbe6',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 28,
    width: 320,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 18,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  streakIcon: {
    fontSize: 32,
    marginRight: 18,
  },
  streakLabel: {
    fontSize: 16,
    color: '#b85c00',
    fontWeight: '600',
  },
  streakValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f76d1a',
  },
  tip: {
    marginTop: 12,
    fontSize: 15,
    color: '#b85c00',
    fontStyle: 'italic',
  },
});

function areAllPrayersCompleted(row) {
  return !!row.Fajr && !!row.Dhuhr && !!row.Asr && !!row.Maghrib && !!row.Isha;
}

function getDateList(rows) {
  // Returns sorted array of dates (YYYY-MM-DD) with all prayers completed
  const completedDates = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows.item(i);
    if (areAllPrayersCompleted(row)) {
      completedDates.push(row.date);
    }
  }
  return completedDates.sort();
}

function calculateStreaks(completedDates) {
  if (completedDates.length === 0) return { current: 0, longest: 0 };

  // Convert to Date objects
  const dates = completedDates.map(d => new Date(d));
  dates.sort((a, b) => a - b);

  let longest = 1;
  let current = 1;
  let maxStreak = 1;

  // Find longest streak
  for (let i = 1; i < dates.length; i++) {
    const diff = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current += 1;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
    if (longest > maxStreak) maxStreak = longest;
  }

  // Find current streak (ending today)
  let currentStreak = 0;
  for (let i = dates.length - 1; i >= 0; i--) {
    const dateStr = dates[i].toISOString().slice(0, 10);
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - (dates.length - 1 - i));
    const expectedStr = expectedDate.toISOString().slice(0, 10);
    if (dateStr === expectedStr) {
      currentStreak += 1;
    } else {
      break;
    }
  }

  return { current: currentStreak, longest: maxStreak };
}

export default function StreaksScreen() {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  const today = new Date().toISOString().slice(0, 10);
  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT date, Fajr, Dhuhr, Asr, Maghrib, Isha FROM prayer_log ORDER BY date ASC`,
        [],
        (_, { rows }) => {
          const completedDates = getDateList(rows);
          const streaks = calculateStreaks(completedDates);
          setCurrentStreak(streaks.current);
          setLongestStreak(streaks.longest);
        },
      );
    });
  }, [today]); // Recalculate streaks if the day changes

  return (
    <LinearGradient
      colors={['#fceabb', '#f8b500', '#f76d1a']}
      style={styles.bg}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>🔥 Streaks & Consistency</Text>
        <View style={styles.card}>
          <View style={styles.streakRow}>
            <Text style={styles.streakIcon}>🔥</Text>
            <View>
              <Text style={styles.streakLabel}>Current Streak</Text>
              <Text style={styles.streakValue}>{currentStreak} days</Text>
            </View>
          </View>
          <View style={styles.streakRow}>
            <Text style={styles.streakIcon}>🏆</Text>
            <View>
              <Text style={styles.streakLabel}>Longest Streak</Text>
              <Text style={styles.streakValue}>{longestStreak} days</Text>
            </View>
          </View>
        </View>
        <Text style={styles.tip}>
          Keep your streak going for more motivation!
        </Text>
      </View>
    </LinearGradient>
  );
}
