import LinearGradient from 'react-native-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import SQLite from 'react-native-sqlite-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const db = SQLite.openDatabase(
  { name: 'salatTracker.db', location: 'default' },
  () => {},
  error => {
    console.log(error);
  },
);

export default function ProgressCalendarScreen() {
  // Example data: which prayers were completed for each date
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [prayerData, setPrayerData] = useState<{
    [date: string]: { [prayer: string]: boolean };
  }>({});
  const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

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
              borderRadius: 8,
              borderWidth: isToday ? 2 : 0,
              borderColor: isToday ? '#f76d1a' : undefined,
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
            },
          },
        },
      ];
    }),
  );
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#f9f6f7',
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <ScrollView style={{ flex: 1 }}>
        <LinearGradient
          colors={['#e0eafc', '#cfdef3', '#f9f6f7']}
          style={styles.bg}
        >
          <View style={styles.overlay}>
            <Text style={styles.title}>📅 Progress Calendar</Text>
            <View style={styles.card}>
              <Calendar
                style={styles.calendar}
                markedDates={markedDates}
                markingType="custom"
                onDayPress={day => setSelectedDate(day.dateString)}
                theme={{
                  todayTextColor: '#f76d1a',
                  selectedDayBackgroundColor: '#b2f7b8',
                  arrowColor: '#2d3a4b',
                }}
              />
              {selectedDate && prayerData[selectedDate] && (
                <View style={styles.prayerStatusBoxModern}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <Text style={styles.prayerStatusIcon}>🕋</Text>
                    <Text style={styles.prayerStatusTitleModern}>
                      Prayers on {selectedDate}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >
                    {prayers.map(prayer => {
                      const done = prayerData[selectedDate][prayer];
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
                            {done ? '✅' : '❌'} {prayer}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 12,
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: '#d0f5e8',
                  borderRadius: 3,
                  marginRight: 4,
                  borderWidth: 1,
                  borderColor: '#4caf50',
                }}
              />
              <Text
                style={{
                  fontSize: 13,
                  color: '#388e3c',
                  marginRight: 12,
                }}
              >
                All done
              </Text>
              <View
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: '#fff9c4',
                  borderRadius: 3,
                  marginRight: 4,
                  borderWidth: 1,
                  borderColor: '#fbc02d',
                }}
              />
              <Text
                style={{
                  fontSize: 13,
                  color: '#bfa600',
                  marginRight: 12,
                }}
              >
                Some missed
              </Text>
              <View
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: '#ffebee',
                  borderRadius: 3,
                  marginRight: 4,
                  borderWidth: 1,
                  borderColor: '#f44336',
                }}
              />
              <Text style={{ fontSize: 13, color: '#d32f2f' }}>All missed</Text>
            </View>
            <Text style={styles.tip}>
              Tap a day to see details. Orange border = today.
            </Text>
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
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
    paddingVertical: 18,
    paddingHorizontal: 18,
    width: 340,
    shadowColor: '#000',
    marginBottom: 18,
  },
  calendar: {
    borderRadius: 12,
    marginBottom: 16,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  prayerStatusBoxModern: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 18,
    marginTop: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e0eafc',
  },
  prayerStatusIcon: {
    fontSize: 22,
    marginRight: 8,
  },
  prayerStatusTitleModern: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#2d3a4b',
  },
  chipDone: {
    backgroundColor: '#e8f5e9',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  chipMissed: {
    backgroundColor: '#ffebee',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f44336',
  },
  chipTextDone: {
    color: '#388e3c',
    fontWeight: 'bold',
    fontSize: 15,
  },
  chipTextMissed: {
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: 15,
  },
  tip: {
    marginTop: 12,
    fontSize: 15,
    color: '#6c7a89',
    fontStyle: 'italic',
  },
});
