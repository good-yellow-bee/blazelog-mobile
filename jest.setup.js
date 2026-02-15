import '@testing-library/jest-native/extend-expect';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      apiUrl: 'http://test-api.example.com',
    },
    version: '1.0.0',
  },
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'test-token' })),
  setNotificationChannelAsync: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
}));

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const RealModule = jest.requireActual('react-native-paper');
  return {
    ...RealModule,
    useTheme: () => ({
      colors: {
        primary: '#58a6ff',
        background: '#0d1117',
        surface: '#161b22',
        error: '#f85149',
        onSurface: '#c9d1d9',
        onSurfaceVariant: '#8b949e',
      },
      custom: {
        colors: {
          primary: '#00d9ff',
          primaryDark: '#00a8cc',
          primaryLight: '#5ce1ff',
          background: '#0d1117',
          surface: '#161b22',
          surfaceElevated: '#21262d',
          surfaceHighlight: '#30363d',
          textPrimary: '#e6edf3',
          textSecondary: '#8b949e',
          textMuted: '#6e7681',
          textInverse: '#0d1117',
          debug: '#8b949e',
          info: '#58a6ff',
          warning: '#d29922',
          error: '#f85149',
          fatal: '#a371f7',
          success: '#3fb950',
          danger: '#f85149',
          border: '#30363d',
          borderLight: '#21262d',
          overlay: 'rgba(0, 0, 0, 0.5)',
          white: '#ffffff',
          black: '#000000',
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
          xl: 32,
        },
        borderRadius: {
          sm: 4,
          md: 8,
          lg: 12,
          full: 9999,
        },
        typography: {
          fontSizeXs: 12,
          fontSizeSm: 14,
          fontSizeMd: 16,
          fontSizeLg: 18,
          fontSizeXl: 24,
          lineHeightTight: 1.2,
          lineHeightNormal: 1.5,
          lineHeightRelaxed: 1.75,
        },
      },
    }),
  };
});

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true, type: 'wifi' })),
}));

// Silence console errors/warnings in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
