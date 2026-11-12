import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldPlaySound: true, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true }) });

export async function registerForPush(uid: string): Promise<string | null> {
  if (!Device.isDevice) return null;
  const current = await Notifications.getPermissionsAsync();
  const permission = current.status === 'granted' ? current : await Notifications.requestPermissionsAsync();
  if (permission.status !== 'granted') return null;
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('default', { name: 'Default', importance: Notifications.AndroidImportance.DEFAULT });
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId || projectId.startsWith('REPLACE_')) return null;
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  if (db) {
    await setDoc(doc(db, 'users', uid), { pushToken: token, updatedAt: serverTimestamp() }, { merge: true });
  }
  return token;
}

export async function scheduleCommuteReminders(morning?: string, evening?: string, enabled = true): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!enabled) return;
  for (const time of [morning, evening]) {
    if (!time) continue;
    const [hour, minute] = time.split(':').map(Number);
    if (!Number.isInteger(hour) || !Number.isInteger(minute)) continue;
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Corporate BlaBla Decoder', body: 'Bugünün plaza tuzağı seni bekliyor.', sound: 'default' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
    });
  }
}
