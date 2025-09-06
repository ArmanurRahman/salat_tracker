import LinearGradient from 'react-native-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const styles = StyleSheet.create({
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

export default function StreaksScreen() {
  // Placeholder values
  const currentStreak = 5;
  const longestStreak = 12;

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
