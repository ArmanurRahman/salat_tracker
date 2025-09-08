import PushNotification from 'react-native-push-notification';
import { Platform, PermissionsAndroid } from 'react-native';

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Prayer Reminder Notifications',
          message: 'Allow SalatTracker to send you prayer reminders.',
          buttonPositive: 'Allow',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  } else {
    const result = await PushNotification.requestPermissions();
    return !!result?.alert;
  }
}

export function schedulePrayerNotification(prayer: string, time: Date) {
  const now = new Date();
  let notifyTime = new Date(now);
  notifyTime.setHours(time.getHours(), time.getMinutes(), 0, 0);

  // If the time is earlier than now, schedule for tomorrow
  if (notifyTime < now) {
    notifyTime.setDate(notifyTime.getDate() + 1);
  }
  console.log('Notification scheduled at ', notifyTime.toString());
  now.setSeconds(now.getSeconds() + 10);
  PushNotification.localNotificationSchedule({
    channelId: 'prayer-reminders',
    // id: prayer,
    title: `Prayer Reminder: ${prayer}`,
    message: `It's time for ${prayer} prayer.`,
    date: notifyTime,
    allowWhileIdle: true,
    repeatType: 'day',
  });
}
