import LinearGradient from 'react-native-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Animated } from 'react-native';
import { Calendar } from 'react-native-calendars';
import SQLite from 'react-native-sqlite-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';

const db = SQLite.openDatabase(
  { name: 'salatTracker.db', location: 'default' },
  () => {},
  error => {
    console.log(error);
  },
);

export default function ProgressCalendarScreen() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [prayerData, setPrayerData] = useState<{
    [date: string]: { [prayer: string]: boolean };
  }>({});
  const [fadeAnim] = useState(new Animated.Value(0));
  const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const insets = useSafeAreaInsets();

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT date, Fajr, Dhuhr, Asr, Maghrib, Isha FROM prayer_log ORDER BY date ASC`,
        [],
        (_, { rows }) => {
          const data: { [date: string]: { [prayer: string]: boolean } } = {};
          for (let i = 0; i < rows.length; i++) {
            const row = rows.item(i);
            data[row.date] = {
              Fajr: !!row.Fajr,
              Dhuhr: !!row.Dhuhr,
              Asr: !!row.Asr,
              Maghrib: !!row.Maghrib,
              Isha: !!row.Isha,
            };
          }
          setPrayerData(data);
        },
      );
    });
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: selectedDate ? 1 : 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [selectedDate]);

  // Mark completed days in the calendar
  const markedDates = Object.fromEntries(
    Object.entries(prayerData).map(([date, prayersObj]) => {
      const allDone = Object.values(prayersObj).every(Boolean);
      const someDone = Object.values(prayersObj).some(Boolean) && !allDone;
      const isSelected = selectedDate === date;
      const isToday = date === new Date().toISOString().slice(0, 10);
      return [
        date,
        {
          marked: true,
          dotColor: allDone ? '#4caf50' : someDone ? '#fbc02d' : '#f44336',
          selected: isSelected,
          selectedColor: isSelected ? '#b2f7b8' : undefined,
          customStyles: {
            container: {
              backgroundColor: allDone
                ? '#d0f5e8'
                : someDone
                ? '#fff9c4'
                : '#ffebee',
              borderRadius: 10,
              borderWidth: isToday ? 2 : 0,
              borderColor: isToday ? '#f76d1a' : undefined,
              shadowColor: '#000',
              shadowOpacity: isSelected ? 0.15 : 0.07,
              shadowRadius: isSelected ? 8 : 3,
              elevation: isSelected ? 6 : 2,
            },
            text: {
              color: isSelected
                ? '#2d3a4b'
                : allDone
                ? '#388e3c'
                : someDone
                ? '#bfa600'
                : '#d32f2f',
              fontWeight: (isSelected ? 'bold' : 'normal') as 'bold' | 'normal',
              fontSize: isSelected ? 17 : 15,
            },
          },
        },
      ];
    }),
  );

  return (
    <LinearGradient
      colors={['#e0eafc', '#cfdef3', '#f9f6f7']}
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: 'transparent' }}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>📅 Progress Calendar</Text>
        <View style={styles.glassCard}>
          <Calendar
            style={styles.calendar}
            markedDates={markedDates}
            markingType="custom"
            onDayPress={day => setSelectedDate(day.dateString)}
            theme={{
              todayTextColor: '#f76d1a',
              selectedDayBackgroundColor: '#b2f7b8',
              arrowColor: '#2d3a4b',
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
            }}
          />
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendDot('#d0f5e8', '#4caf50')} />
          <Text style={styles.legendText('#388e3c')}>All done</Text>
          <View style={styles.legendDot('#fff9c4', '#fbc02d')} />
          <Text style={styles.legendText('#bfa600')}>Some missed</Text>
          <View style={styles.legendDot('#ffebee', '#f44336')} />
          <Text style={styles.legendText('#d32f2f')}>All missed</Text>
        </View>
        <Text style={styles.tip}>
          Tap a day to see details. Orange border = today. Stay consistent for a
          stronger habit!
        </Text>
      </ScrollView>

      {/* Modal for prayer details */}
      <Modal
        isVisible={!!selectedDate}
        onBackdropPress={() => setSelectedDate(null)}
        onBackButtonPress={() => setSelectedDate(null)}
        style={{ justifyContent: 'flex-end', margin: 0 }}
        backdropTransitionOutTiming={0}
      >
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.97)',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            minHeight: 220,
          }}
        >
          {selectedDate && prayerData[selectedDate] ? (
            <>
              <Text style={styles.prayerStatusTitleModern}>
                Prayers on{' '}
                <Text style={{ color: '#1976d2' }}>
                  {selectedDate
                    ? new Date(selectedDate).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : ''}
                </Text>
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginTop: 12,
                }}
              >
                {prayers.map(prayer => {
                  const done = prayerData[selectedDate][prayer];
                  const prayerIcons: { [key: string]: string } = {
                    Fajr: '🌅',
                    Dhuhr: '🌞',
                    Asr: '🌤️',
                    Maghrib: '🌇',
                    Isha: '🌙',
                  };
                  return (
                    <View
                      key={prayer}
                      style={done ? styles.chipDone : styles.chipMissed}
                    >
                      <Text
                        style={
                          done ? styles.chipTextDone : styles.chipTextMissed
                        }
                      >
                        {prayerIcons[prayer]} {done ? '✅' : '❌'} {prayer}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            <Text style={styles.prayerStatusTitleModern}>
              Select a date to see details
            </Text>
          )}
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1976d2',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: '#cfdef3',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 18,
    width: 350,
    shadowColor: '#1976d2',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 18,
    alignItems: 'center',
  },
  calendar: {
    borderRadius: 14,
    marginBottom: 16,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: 'transparent',
  },
  prayerStatusBoxModern: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 18,
    padding: 18,
    marginTop: 10,
    width: '100%',
    shadowColor: '#1976d2',
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e0eafc',
  },
  prayerStatusIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  prayerStatusTitleModern: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#2d3a4b',
  },
  chipDone: {
    backgroundColor: '#e8f5e9',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4caf50',
    shadowColor: '#4caf50',
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  chipMissed: {
    backgroundColor: '#ffebee',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f44336',
    shadowColor: '#f44336',
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  chipTextDone: {
    color: '#388e3c',
    fontWeight: 'bold',
    fontSize: 16,
  },
  chipTextMissed: {
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tip: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c7a89',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 2,
  },
  legendDot: (bg: string, border: string) => ({
    width: 14,
    height: 14,
    backgroundColor: bg,
    borderRadius: 4,
    marginRight: 5,
    borderWidth: 1,
    borderColor: border,
  }),
  legendText: (color: string) => ({
    fontSize: 14,
    color,
    marginRight: 14,
    fontWeight: '600',
  }),
});
