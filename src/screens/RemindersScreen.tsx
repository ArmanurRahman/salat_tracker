import DateTimePicker from '@react-native-community/datetimepicker';
import { CalculationMethod, Coordinates, PrayerTimes } from 'adhan';
import Geolocation from '@react-native-community/geolocation';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import SQLite from 'react-native-sqlite-storage';

import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  PermissionsAndroid,
} from 'react-native';
import {
  requestNotificationPermission,
  schedulePrayerNotification,
} from '../utils/notification';
import PushNotification from 'react-native-push-notification';

const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const db = SQLite.openDatabase(
  { name: 'salatTracker.db', location: 'default' },
  () => {},
  error => {
    console.log(error);
  },
);

async function requestLocationPermission() {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message:
          'This app needs access to your location to calculate prayer times.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true; // iOS permissions handled differently
}

function setReminderInDB(prayer: string, time: Date, enabled: boolean) {
  // Format time as "HH:mm" in local time
  const timeStr = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  db.transaction(tx => {
    // Try to update first
    tx.executeSql(
      `UPDATE prayer_reminders SET time = ?, enabled = ? WHERE prayer = ?`,
      [timeStr, enabled ? 1 : 0, prayer],
      (_, result) => {
        if (result.rowsAffected === 0) {
          // If no row updated, insert new row
          tx.executeSql(
            `INSERT INTO prayer_reminders (prayer, time, enabled) VALUES (?, ?, ?)`,
            [prayer, timeStr, enabled ? 1 : 0],
          );
        }
      },
    );
  });
}
function rescheduleEnabledPrayerNotifications(reminders: {
  [prayer: string]: { enabled: boolean; time: Date };
}) {
  prayers.forEach(prayer => {
    if (reminders[prayer]?.enabled) {
      schedulePrayerNotification(prayer, reminders[prayer].time);
    }
  });
}
export default function RemindersScreen() {
  const [reminders, setReminders] = useState<{
    [prayer: string]: { enabled: boolean; time: Date };
  } | null>(null);
  const [pickerPrayer, setPickerPrayer] = useState<string | null>(null);
  const [tempTime, setTempTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLocationAndInitReminders() {
      setLoading(true);
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission to access location was denied');
        // Set default reminders if permission denied
        setReminders(
          prayers.reduce((acc, prayer) => {
            acc[prayer] = {
              enabled: false,
              time: new Date(), // Default to current time
            };
            return acc;
          }, {} as { [prayer: string]: { enabled: boolean; time: Date } }),
        );
        setLoading(false);
        return;
      }
      Geolocation.getCurrentPosition(
        loc => {
          const coordinates = new Coordinates(
            loc.coords.latitude,
            loc.coords.longitude,
          );
          const params = CalculationMethod.MuslimWorldLeague();
          const times = new PrayerTimes(coordinates, new Date(), params);
          // Map adhan times to Date objects for reminders
          const prayerTimes: { [prayer: string]: Date } = {
            Fajr: times.fajr,
            Dhuhr: times.dhuhr,
            Asr: times.asr,
            Maghrib: times.maghrib,
            Isha: times.isha,
          };
          // Only set reminders for prayers not already loaded from DB
          setReminders(prev => {
            // If prev is null, fallback to location for all
            if (!prev) {
              return prayers.reduce((acc, prayer) => {
                acc[prayer] = {
                  enabled: false,
                  time: prayerTimes[prayer],
                };
                return acc;
              }, {} as { [prayer: string]: { enabled: boolean; time: Date } });
            }
            // Fill in missing prayers from location
            const filled = { ...prev };
            for (const prayer of prayers) {
              if (!filled[prayer]) {
                filled[prayer] = {
                  enabled: false,
                  time: prayerTimes[prayer],
                };
              }
            }
            return filled;
          });
          setLoading(false);
        },
        error => {
          console.error('Error fetching location:', error);
          Alert.alert('Could not fetch location');
          // Set default reminders if location fetch fails
          setReminders(
            prayers.reduce((acc, prayer) => {
              acc[prayer] = {
                enabled: false,
                time: new Date(), // Default to current time
              };
              return acc;
            }, {} as { [prayer: string]: { enabled: boolean; time: Date } }),
          );
          setLoading(false);
        },
        { enableHighAccuracy: false, timeout: 30000, maximumAge: 10000 },
      );
    }
    fetchLocationAndInitReminders();
  }, []);

  useLayoutEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT prayer, time, enabled FROM prayer_reminders`,
        [],
        (_, { rows }) => {
          const reminderObj: {
            [prayer: string]: { enabled: boolean; time: Date };
          } = {};
          for (let i = 0; i < rows.length; i++) {
            const row = rows.item(i);
            // Parse time as local "HH:mm"
            const [hour, minute] = row.time.split(':');
            const now = new Date();
            now.setHours(Number(hour), Number(minute), 0, 0);
            reminderObj[row.prayer] = {
              enabled: !!row.enabled,
              time: new Date(now),
            };
          }
          // Ensure all prayers are present (missing ones will be filled by location effect)
          setReminders(reminderObj);
        },
      );
    });
  }, []);

  const handleToggle = async (prayer: string) => {
    if (!reminders) return;
    const enabled = !reminders[prayer].enabled;
    setReminders(r => ({
      ...r!,
      [prayer]: { ...r![prayer], enabled },
    }));
    setReminderInDB(prayer, reminders[prayer].time, enabled);

    if (enabled) {
      const permissionGranted = await requestNotificationPermission();
      if (permissionGranted) {
        schedulePrayerNotification(prayer, reminders[prayer].time);
      } else {
        Alert.alert(
          'Notification permission denied',
          'Please enable notifications in settings to receive reminders.',
        );
      }
    } else {
      PushNotification.cancelAllLocalNotifications();
      setTimeout(() => {
        rescheduleEnabledPrayerNotifications({
          ...reminders,
          [prayer]: { ...reminders[prayer], enabled: false },
        });
      }, 500);
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date | undefined) => {
    if (Platform.OS === 'android') {
      if (
        event.type === 'set' &&
        pickerPrayer &&
        selectedDate &&
        reminders &&
        selectedDate instanceof Date
      ) {
        setReminders(r => {
          const updated = {
            ...r!,
            [pickerPrayer]: { ...r![pickerPrayer], time: selectedDate },
          };
          PushNotification.cancelAllLocalNotifications();
          setTimeout(() => {
            rescheduleEnabledPrayerNotifications(updated);
          }, 500);
          return updated;
        });
        setReminderInDB(
          pickerPrayer,
          selectedDate,
          reminders[pickerPrayer].enabled,
        );
      }
      setPickerPrayer(null);
    } else {
      if (selectedDate) setTempTime(selectedDate);
    }
  };

  const handleDone = () => {
    if (pickerPrayer && tempTime && reminders) {
      setReminders(r => {
        const updated = {
          ...r!,
          [pickerPrayer]: { ...r![pickerPrayer], time: tempTime },
        };
        setReminderInDB(pickerPrayer, tempTime, updated[pickerPrayer].enabled);
        PushNotification.cancelAllLocalNotifications();
        setTimeout(() => {
          rescheduleEnabledPrayerNotifications(updated);
        }, 500);
        return updated;
      });
    }

    setPickerPrayer(null);
    setTempTime(null);
  };

  if (loading || !reminders) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>
          Getting location and prayer times...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reminders & Notifications</Text>
      {prayers.map(prayer => (
        <View key={prayer} style={styles.row}>
          <Text style={styles.prayer}>{prayer}</Text>
          <TouchableOpacity
            style={[
              styles.timeBtn,
              !reminders[prayer].enabled && {
                backgroundColor: '#f0f0f0',
              },
            ]}
            onPress={() => {
              if (reminders[prayer].enabled) {
                setPickerPrayer(prayer);
                setTempTime(reminders[prayer].time);
              }
            }}
            disabled={!reminders[prayer].enabled}
          >
            <Text
              style={[
                styles.timeText,
                !reminders[prayer].enabled && { color: '#bbb' },
              ]}
            >
              {reminders[prayer].time.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </TouchableOpacity>
          <Pressable
            style={({ pressed }) => [
              styles.setTimeBtn,
              pressed && { opacity: 0.7 },
              !reminders[prayer].enabled && {
                backgroundColor: '#f0f0f0',
              },
            ]}
            onPress={() => {
              if (reminders[prayer].enabled) {
                setPickerPrayer(prayer);
                setTempTime(reminders[prayer].time);
              }
            }}
            disabled={!reminders[prayer].enabled}
          >
            <Text
              style={[
                styles.setTimeBtnText,
                !reminders[prayer].enabled && { color: '#bbb' },
              ]}
            >
              Set Time
            </Text>
          </Pressable>
          <Switch
            value={reminders[prayer].enabled}
            onValueChange={() => handleToggle(prayer)}
            thumbColor={reminders[prayer].enabled ? '#4caf50' : '#ccc'}
            trackColor={{ false: '#ccc', true: '#b2f7b8' }}
          />
        </View>
      ))}
      {pickerPrayer && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempTime || reminders[pickerPrayer].time}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleTimeChange}
          style={{ backgroundColor: '#fff' }}
        />
      )}
      {Platform.OS === 'ios' && pickerPrayer && (
        <Modal
          visible={!!pickerPrayer}
          transparent
          animationType="fade"
          onRequestClose={() => setPickerPrayer(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <DateTimePicker
                value={tempTime || reminders[pickerPrayer].time}
                mode="time"
                is24Hour={false}
                display="spinner"
                onChange={handleTimeChange}
              />
              <Pressable style={styles.closeBtn} onPress={handleDone}>
                <Text style={styles.closeBtnText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      <Text style={styles.tip}>
        Enable and set a time to receive a notification for each prayer.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#2d3a4b',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  prayer: {
    fontSize: 18,
    fontWeight: '500',
    color: '#388e3c',
    width: 80,
  },
  timeBtn: {
    backgroundColor: '#e0eafc',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  timeText: {
    fontSize: 16,
    color: '#2d3a4b',
    fontWeight: 'bold',
  },
  setTimeBtn: {
    backgroundColor: '#b2f7b8',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
    marginLeft: 0,
  },
  setTimeBtnText: {
    color: '#2d3a4b',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: 300,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#388e3c',
    marginBottom: 16,
  },
  closeBtn: {
    marginTop: 18,
    backgroundColor: '#e0eafc',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  closeBtnText: {
    color: '#2d3a4b',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tip: {
    marginTop: 18,
    fontSize: 15,
    color: '#6c7a89',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
