import { LinearGradient } from 'react-native-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export default function DailyPrayerLogScreen() {
  const [completed, setCompleted] = useState<{ [key: string]: boolean }>({});

  const togglePrayer = (prayer: string) => {
    setCompleted(prev => ({ ...prev, [prayer]: !prev[prayer] }));
  };

  const completedCount = prayers.filter(p => completed[p]).length;

  return (
    <LinearGradient
      colors={['#e0eafc', '#cfdef3', '#f9f6f7']}
      style={styles.bg}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>🕋 Daily Prayer Log</Text>
        <View style={styles.card}>
          {prayers.map((prayer, idx) => (
            <TouchableOpacity
              key={prayer}
              style={[
                styles.prayerButton,
                completed[prayer] && styles.completed,
                idx === 0 && styles.firstButton,
                idx === prayers.length - 1 && styles.lastButton,
              ]}
              onPress={() => togglePrayer(prayer)}
              activeOpacity={0.85}
            >
              <View style={styles.checkbox}>
                {completed[prayer] ? (
                  <Text style={styles.checkboxIcon}>✔️</Text>
                ) : (
                  <Text style={styles.checkboxIcon}></Text>
                )}
              </View>
              <Text style={styles.prayerIcon}>
                {prayer === 'Fajr' && '🌅'}
                {prayer === 'Dhuhr' && '🌞'}
                {prayer === 'Asr' && '🌤️'}
                {prayer === 'Maghrib' && '🌇'}
                {prayer === 'Isha' && '🌙'}
              </Text>
              <Text style={styles.prayerText}>{prayer}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.tip}>Tap a prayer to mark as completed!</Text>
        <View style={styles.summaryBox}>
          <Icon name="star" size={18} color="#f5a623" />
          <Text style={styles.summaryText}>
            You completed {completedCount}/{prayers.length} prayers today!
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

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
    color: '#2d3a4b',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 0,
    width: 300,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 18,
  },
  prayerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginVertical: 2,
    backgroundColor: '#e6f0fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e7ef',
    borderRadius: 0,
    gap: 16,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#b2b2b2',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxIcon: {
    fontSize: 18,
    color: '#4caf50',
  },
  firstButton: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  lastButton: {
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomWidth: 0,
  },
  completed: {
    backgroundColor: '#b2f7b8',
  },
  prayerIcon: {
    fontSize: 24,
  },
  prayerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a2a3a',
  },
  tip: {
    marginTop: 12,
    fontSize: 15,
    color: '#6c7a89',
    fontStyle: 'italic',
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbe6',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginTop: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  summaryText: {
    fontSize: 16,
    color: '#7a6c3e',
    marginLeft: 8,
    fontWeight: '500',
  },
});
