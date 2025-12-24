import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { Log } from '@/api/types';

// Log Stack
export type LogStackParamList = {
  LogList: undefined;
  LogDetail: { logId: string; log?: Log };
  LogStream: undefined;
};

// Alert Stack
export type AlertStackParamList = {
  AlertList: undefined;
  AlertDetail: { alertId: string };
  AlertForm: { alertId?: string };
};

// Settings Stack
export type SettingsStackParamList = {
  Settings: undefined;
  ChangePassword: undefined;
  UserList: undefined;
  UserDetail: { userId: string };
  ProjectSwitcher: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  LogsTab: NavigatorScreenParams<LogStackParamList>;
  AlertsTab: NavigatorScreenParams<AlertStackParamList>;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

// Root Stack Navigator
export type RootStackParamList = {
  Login: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Screen props helpers
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type LogStackScreenProps<T extends keyof LogStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<LogStackParamList, T>,
    MainTabScreenProps<keyof MainTabParamList>
  >;

export type AlertStackScreenProps<T extends keyof AlertStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<AlertStackParamList, T>,
    MainTabScreenProps<keyof MainTabParamList>
  >;

export type SettingsStackScreenProps<T extends keyof SettingsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<SettingsStackParamList, T>,
    MainTabScreenProps<keyof MainTabParamList>
  >;

// Declare global navigation types
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
