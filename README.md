# Blazelog Mobile

A React Native mobile application for viewing and managing logs from the Blazelog logging platform.

## Features

- 📱 **Cross-platform**: iOS and Android support
- 🔐 **Secure Authentication**: Login with username/password
- 📊 **Real-time Log Streaming**: View logs as they happen via Server-Sent Events
- 🔍 **Advanced Filtering**: Filter logs by level, time range, and search terms
- 🚨 **Alert Management**: Create, view, and manage log alerts
- 👥 **User Management**: Admin interface for user administration
- 🌙 **Dark Mode**: Optimized dark theme for log viewing
- 📴 **Offline Support**: View cached logs when offline
- 🔔 **Push Notifications**: Get notified of critical alerts

## Tech Stack

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Navigation**: React Navigation
- **UI Components**: React Native Paper (Material Design 3)
- **Form Validation**: React Hook Form + Zod
- **Testing**: Jest + React Native Testing Library + Maestro

## Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- For iOS development: Xcode 14+
- For Android development: Android Studio
- For production builds: EAS CLI (`npm install -g eas-cli`)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env.development` file with your API configuration:

```env
API_URL=http://localhost:3000
APP_ENV=development
```

### 3. Start Development Server

```bash
npm start
```

This will start the Expo development server. You can then:
- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan QR code with Expo Go app for physical device testing

## Available Scripts

### Development

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run in web browser

### Code Quality

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier

### Testing

- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report

## Production Builds

### Prerequisites

1. Install EAS CLI globally:
```bash
npm install -g eas-cli
```

2. Login to your Expo account:
```bash
eas login
```

3. Configure your project:
```bash
eas build:configure
```

### Build Commands

#### iOS Production Build

```bash
eas build --platform ios --profile production
```

Requirements:
- Apple Developer account
- App Store Connect configured
- Update `eas.json` with your Apple Team ID and App ID

#### Android Production Build

```bash
eas build --platform android --profile production
```

Requirements:
- Google Play Console account
- Upload keystore or let EAS manage it
- Configure service account for automated submissions

#### Build Both Platforms

```bash
eas build --platform all --profile production
```

### Build Profiles

The `eas.json` file defines three build profiles:

- **development**: For testing with development client
- **preview**: Internal distribution builds (APK/IPA)
- **production**: Store-ready builds (AAB/IPA)

### Submitting to Stores

#### iOS App Store

```bash
eas submit --platform ios --profile production
```

Update `eas.json` with:
- `appleId`: Your Apple ID email
- `ascAppId`: App Store Connect App ID
- `appleTeamId`: Your Apple Developer Team ID

#### Google Play Store

```bash
eas submit --platform android --profile production
```

Update `eas.json` with:
- `serviceAccountKeyPath`: Path to Google Play service account JSON
- `track`: Release track (production, beta, alpha, internal)

## Project Structure

```
blazelog-mobile/
├── src/
│   ├── api/           # API client and endpoints
│   ├── components/    # Reusable components
│   ├── hooks/         # Custom React hooks
│   ├── navigation/    # Navigation configuration
│   ├── screens/       # Screen components
│   ├── store/         # Zustand stores
│   ├── theme/         # Theme configuration
│   ├── types/         # TypeScript types
│   └── utils/         # Utility functions
├── __tests__/         # Unit tests
├── .maestro/          # E2E tests
├── assets/            # Images and fonts
├── App.tsx            # App entry point
├── app.config.ts      # Expo configuration
└── eas.json           # EAS Build configuration
```

## Configuration Files

### App Configuration (`app.config.ts`)

Contains app metadata, bundle identifiers, and Expo configuration.

### Environment Variables

- `API_URL`: Backend API URL (default: https://api.blazelog.dev)
- `APP_ENV`: Environment (development, staging, production)

### Build Configuration (`eas.json`)

EAS Build profiles for different build types and deployment targets.

## Testing

### Unit Tests

Located in `__tests__/` directory. Run with:

```bash
npm test
```

Coverage includes:
- Store logic (auth, project, settings)
- Utility functions (error handling)
- Component rendering (LogEntry, etc.)

### E2E Tests

Maestro tests in `.maestro/` directory:

- `login.yaml` - Login flow test
- `view-logs.yaml` - Log viewing test

Run with Maestro CLI:
```bash
maestro test .maestro/login.yaml
```

## Deployment

### Development/Staging

1. Update `API_URL` in `.env.development` or `.env.staging`
2. Build with preview profile:
   ```bash
   eas build --platform all --profile preview
   ```

### Production

1. Ensure `API_URL` points to production API
2. Set `APP_ENV=production`
3. Build production:
   ```bash
   eas build --platform all --profile production
   ```
4. Submit to stores:
   ```bash
   eas submit --platform all --profile production
   ```

## Troubleshooting

### Common Issues

**Build Fails on iOS**
- Ensure Xcode is up to date
- Check bundle identifier matches your Apple Developer account
- Verify provisioning profiles are valid

**Build Fails on Android**
- Check `gradlew` permissions
- Verify Android SDK is installed
- Clear Gradle cache if needed

**API Connection Issues**
- Verify `API_URL` is correct
- Check network connectivity
- For iOS development, ensure ATS exceptions are configured

### Getting Help

- Check [Expo Documentation](https://docs.expo.dev/)
- Review [React Navigation Docs](https://reactnavigation.org/)
- See [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

## License

Proprietary - All rights reserved

## Contributing

This is a private project. Contact the project maintainers for contribution guidelines.
