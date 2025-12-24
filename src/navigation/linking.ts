import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from '@/types/navigation';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['blazelog://', 'https://app.blazelog.dev'],
  config: {
    screens: {
      Login: 'login',
      Main: {
        screens: {
          LogsTab: {
            screens: {
              LogList: 'logs',
              LogDetail: 'logs/:logId',
              LogStream: 'logs/stream',
            },
          },
          AlertsTab: {
            screens: {
              AlertList: 'alerts',
              AlertDetail: 'alerts/:alertId',
              AlertForm: 'alerts/new',
            },
          },
          SettingsTab: {
            screens: {
              Settings: 'settings',
              ChangePassword: 'settings/password',
              UserList: 'settings/users',
              UserDetail: 'settings/users/:userId',
              ProjectSwitcher: 'settings/projects',
            },
          },
        },
      },
    },
  },
};
