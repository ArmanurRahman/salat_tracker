import DateTimePicker from '@react-native-community/datetimepicker';
import { CalculationMethod, Coordinates, PrayerTimes } from 'adhan';
import Geolocation from '@react-native-community/geolocation';
import React, { useEffect, useState } from 'react';
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

const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

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
export default function RemindersScreen() {
  const [reminders, setReminders] = useState<{
    [prayer: string]: { enabled: boolean; time: Date };
  } | null>(null);
  const [pickerPrayer, setPickerPrayer] = useState<string | null>(null);
  const [tempTime, setTempTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLocation() {
      setLoading(true);
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission to access location was denied');
        setLoading(false);
        return;
      }
      Geolocation.getCurrentPosition;
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
          setReminders(
            prayers.reduce((acc, prayer) => {
              acc[prayer] = {
                enabled: false,
                time: prayerTimes[prayer],
              };
              return acc;
            }, {} as { [prayer: string]: { enabled: boolean; time: Date } }),
          );
          setLoading(false);
        },
        error => {
          console.error('Error fetching location:', error);
          Alert.alert('Could not fetch location');
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    }
    fetchLocation();

    // Geolocation.requestAuthorization();
  }, []);

  const handleToggle = (prayer: string) => {
    if (!reminders) return;
    setReminders(r => ({
      ...r!,
      [prayer]: { ...r![prayer], enabled: !r![prayer].enabled },
    }));
  };

  const handleTimeChange = (event: any, selectedDate?: Date | undefined) => {
    if (Platform.OS === 'android') {
      if (pickerPrayer && selectedDate && reminders) {
        setReminders(r => ({
          ...r!,
          [pickerPrayer]: { ...r![pickerPrayer], time: selectedDate },
        }));
      }
      setPickerPrayer(null);
    } else {
      if (selectedDate) setTempTime(selectedDate);
    }
  };

  const handleDone = () => {
    if (pickerPrayer && tempTime && reminders) {
      setReminders(r => ({
        ...r!,
        [pickerPrayer]: { ...r![pickerPrayer], time: tempTime },
      }));
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
      <Modal
        visible={!!pickerPrayer}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerPrayer(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Select Time for {pickerPrayer}
            </Text>
            {pickerPrayer && (
              <DateTimePicker
                value={tempTime || reminders[pickerPrayer].time}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
                style={{ backgroundColor: '#fff' }}
              />
            )}
            {Platform.OS === 'ios' && (
              <Pressable style={styles.closeBtn} onPress={handleDone}>
                <Text style={styles.closeBtnText}>Done</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
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
