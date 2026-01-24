import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { usersApi } from '@/api';
import { logger } from './logger';

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
    logger.info('Push notifications require a physical device');
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
    logger.info('Push notification permission not granted');
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

    logger.info('Push notification token registered');
    return token;
  } catch (error) {
    logger.error('Failed to get push token', error);
    return null;
  }
}

export async function unregisterPushNotifications(): Promise<void> {
  try {
    // Unregister token from backend
    await usersApi.unregisterPushToken();
    logger.info('Push notification token unregistered');
  } catch (error) {
    logger.error('Failed to unregister push token', error);
  }
}

export interface NotificationData {
  type?: 'alert';
  alertId?: string;
  projectId?: string;
}

/**
 * Type guard to check if a value is a valid string
 */
const isValidString = (value: unknown): value is string => {
  return typeof value === 'string' && value.length > 0 && value.length < 1000;
};

/**
 * Type guard to check if notification type is valid
 */
const isValidNotificationType = (value: unknown): value is 'alert' => {
  return value === 'alert';
};

/**
 * Safely parse notification data with proper type validation
 * Prevents type confusion attacks and malformed data crashes
 */
export function parseNotificationData(notification: Notifications.Notification): NotificationData {
  try {
    const rawData = notification?.request?.content?.data;

    // Ensure data is an object
    if (!rawData || typeof rawData !== 'object' || Array.isArray(rawData)) {
      logger.warn('Invalid notification data format');
      return {};
    }

    const data = rawData as Record<string, unknown>;
    const result: NotificationData = {};

    // Validate type field
    if (isValidNotificationType(data.type)) {
      result.type = data.type;
    }

    // Validate alertId field
    if (isValidString(data.alertId)) {
      // Additional validation: alertId should look like a valid ID (alphanumeric with dashes)
      if (/^[a-zA-Z0-9-_]+$/.test(data.alertId)) {
        result.alertId = data.alertId;
      } else {
        logger.warn('Invalid alertId format in notification');
      }
    }

    // Validate projectId field
    if (isValidString(data.projectId)) {
      // Additional validation: projectId should look like a valid ID
      if (/^[a-zA-Z0-9-_]+$/.test(data.projectId)) {
        result.projectId = data.projectId;
      } else {
        logger.warn('Invalid projectId format in notification');
      }
    }

    return result;
  } catch (error) {
    logger.error('Error parsing notification data', error);
    return {};
  }
}
