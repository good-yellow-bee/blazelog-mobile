import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { usersApi } from '@/api';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function setupAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alerts', {
      name: 'Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#58a6ff',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });
  }
}

export async function registerForPushNotifications(): Promise<string | null> {
  // Only real devices can receive push notifications
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Set up Android channel first
  await setupAndroidNotificationChannel();

  // Check existing permission status
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  // Get the push token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    const token = tokenData.data;

    // Register token with backend
    const platform = Platform.OS === 'ios' ? 'ios' : 'android';
    await usersApi.registerPushToken(token, platform);

    return token;
  } catch (error) {
    console.error('Failed to get push token:', error);
    return null;
  }
}

export interface NotificationData {
  type?: 'alert';
  alertId?: string;
  projectId?: string;
}

export function parseNotificationData(notification: Notifications.Notification): NotificationData {
  const data = notification.request.content.data as Record<string, unknown>;
  return {
    type: data?.type as NotificationData['type'],
    alertId: data?.alertId as string | undefined,
    projectId: data?.projectId as string | undefined,
  };
}
