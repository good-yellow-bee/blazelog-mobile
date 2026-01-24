import { ExpoConfig, ConfigContext } from 'expo/config';

const isProduction = process.env.APP_ENV === 'production';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Blazelog',
  slug: 'blazelog-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#1a1a2e',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'dev.blazelog.mobile',
    infoPlist: {
      NSAppTransportSecurity: isProduction
        ? {
            // Production: Enforce strict ATS (HTTPS only)
            NSAllowsArbitraryLoads: false,
          }
        : {
            // Development: Allow local networking for testing
            NSAllowsArbitraryLoads: true,
            NSAllowsLocalNetworking: true,
          },
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#1a1a2e',
    },
    package: 'dev.blazelog.mobile',
    edgeToEdgeEnabled: true,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: ['expo-secure-store'],
  extra: {
    apiUrl: process.env.API_URL ?? 'https://api.blazelog.dev',
    environment: process.env.APP_ENV ?? 'development',
  },
});
