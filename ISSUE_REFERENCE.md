# Quick Reference: Issue to Implementation Mapping

This is a quick lookup table for finding where each GitHub issue is implemented.

## Phase 2: State Management

| Issue | Title | Implementation |
|-------|-------|----------------|
| #23 | P2-1: Create Auth Store | `src/store/authStore.ts` |
| #24 | P2-2: Create Project Store | `src/store/projectStore.ts` |
| #25 | P2-3: Create Settings Store | `src/store/settingsStore.ts` |
| #26 | P2-4: Create Store Exports | `src/store/index.ts` |
| #27 | P2-5: Set Up TanStack Query Client | `src/utils/queryClient.ts` |
| #28 | P2-6: Add Query Client Persistence | `src/utils/queryClient.ts`, `src/utils/secureQueryStorage.ts` |

## Phase 3: Navigation

| Issue | Title | Implementation |
|-------|-------|----------------|
| #29 | P3-1: Define Navigation Types | `src/types/navigation.ts` |
| #30 | P3-2: Create Log Stack Navigator | `src/navigation/LogStack.tsx` |
| #31 | P3-3: Create Alert Stack Navigator | `src/navigation/AlertStack.tsx` |
| #32 | P3-4: Create Settings Stack Navigator | `src/navigation/SettingsStack.tsx` |
| #33 | P3-5: Create Main Tab Navigator | `src/navigation/MainTabs.tsx` |
| #34 | P3-6: Create Root Navigator | `src/navigation/RootNavigator.tsx` |
| #35 | P3-7: Configure Deep Linking | `src/navigation/linking.ts` |
| #36 | P3-8: Integrate Navigation in App.tsx | `App.tsx` |

## Phase 4: UI Components

| Issue | Title | Implementation |
|-------|-------|----------------|
| #37 | P4-1: Create Button Component | `src/components/ui/Button.tsx` |
| #38 | P4-2: Create Input Component | `src/components/ui/Input.tsx` |
| #39 | P4-3: Create Card Component | `src/components/ui/Card.tsx` |
| #40 | P4-4: Create EmptyState Component | `src/components/common/EmptyState.tsx` |
| #41 | P4-5: Create LoadingScreen Component | `src/components/common/LoadingScreen.tsx` |
| #42 | P4-6: Create OfflineBanner Component | `src/components/common/OfflineBanner.tsx` |
| #43 | P4-7: Create LogLevelBadge Component | `src/components/logs/LogLevelBadge.tsx` |
| #44 | P4-8: Create LogEntry Component | `src/components/logs/LogEntry.tsx` |
| #45 | P4-9: Create LogFilter Component | `src/components/logs/LogFilter.tsx` |
| #46 | P4-10: Create AlertCard Component | `src/components/alerts/AlertCard.tsx` |
| #47 | P4-11: Create UI Components Index | `src/components/*/index.ts` |

## Phase 5: Authentication

| Issue | Title | Implementation |
|-------|-------|----------------|
| #48 | P5-1: Create Login Screen Layout | `src/screens/auth/LoginScreen.tsx` |
| #49 | P5-2: Add Login Form Validation | `src/screens/auth/LoginScreen.tsx` (React Hook Form + Zod) |
| #50 | P5-3: Connect Login to Auth Store | `src/screens/auth/LoginScreen.tsx` (store integration) |

## Phase 6: Log Screens

| Issue | Title | Implementation |
|-------|-------|----------------|
| #51 | P6-1: Create useLogsQuery Hook | `src/hooks/useLogs.ts` |
| #52 | P6-2: Create LogList Component | `src/components/logs/LogList.tsx` |
| #53 | P6-3: Create Log List Screen | `src/screens/logs/LogListScreen.tsx` |
| #54 | P6-4: Create Log Detail Screen | `src/screens/logs/LogDetailScreen.tsx` |
| #55 | P6-5: Create useSSE Hook | `src/hooks/useSSE.ts` |
| #56 | P6-6: Create Log Stream Screen | `src/screens/logs/LogStreamScreen.tsx` |

## Phase 7: Alert Screens

| Issue | Title | Implementation |
|-------|-------|----------------|
| #57 | P7-1: Create useAlertsQuery Hook | `src/hooks/useAlerts.ts` |
| #58 | P7-2: Create Alert List Screen | `src/screens/alerts/AlertListScreen.tsx` |
| #59 | P7-3: Create Alert Detail Screen | `src/screens/alerts/AlertDetailScreen.tsx` |
| #60 | P7-4: Create Alert Form Screen | `src/screens/alerts/AlertFormScreen.tsx` |

## Phase 8: Settings & Admin

| Issue | Title | Implementation |
|-------|-------|----------------|
| #61 | P8-2: Create Project Switcher Screen | `src/screens/projects/ProjectSwitcherScreen.tsx` |
| #62 | P8-3: Create Settings Screen | `src/screens/settings/SettingsScreen.tsx` |
| #63 | P8-4: Create Change Password Screen | `src/screens/settings/ChangePasswordScreen.tsx` |

## Phase 9: Offline Support

| Issue | Title | Implementation |
|-------|-------|----------------|
| #64 | P9-1: Create Network Status Hook | `src/hooks/useNetworkStatus.ts` |
| #65 | P9-2: Integrate Offline Banner | `src/navigation/RootNavigator.tsx` (banner integration) |
| #66 | P9-3: Configure Offline Query Behavior | `src/utils/queryClient.ts` (offline config) |

## Phase 10: Push Notifications

| Issue | Title | Implementation |
|-------|-------|----------------|
| #67 | P10-1: Create Notification Registration | `src/utils/notifications.ts` |
| #68 | P10-2: Configure Android Notification Channel | `src/utils/notifications.ts` (channel setup) |
| #69 | P10-3: Handle Notification Taps | `App.tsx` (notification handler) |
| #70 | P10-4: Integrate Notification Registration | `src/store/authStore.ts` (login integration) |

## Phase 11: Testing

| Issue | Title | Implementation |
|-------|-------|----------------|
| #71 | P11-1: Configure Jest | `jest.config.js`, `jest.setup.js` |
| #72 | P11-2: Add React Native Testing Library | `package.json` (dependency) |
| #73 | P11-3: Write Auth Store Tests | `__tests__/store/authStore.test.ts` |
| #74 | P11-4: Write API Error Handler Tests | `__tests__/utils/errors.test.ts` |
| #75 | P11-5: Write LogEntry Component Tests | `__tests__/components/LogEntry.test.tsx` |
| #76 | P11-6: Set Up Maestro E2E Tests | `.maestro/login.yaml` |
| #77 | P11-7: Write Log Viewing E2E Test | `.maestro/view-logs.yaml` |

## Phase 12: Release

| Issue | Title | Implementation |
|-------|-------|----------------|
| #78 | P12-1: Add App Icons | `assets/icon.png`, `assets/adaptive-icon.png` |
| #79 | P12-2: Add Splash Screen | `assets/splash-icon.png`, `app.config.ts` |
| #80 | P12-3: Configure App Metadata | `app.config.ts` |
| #81 | P12-4: Create Production Build | `eas.json`, `README.md` |

---

## How to Use This Reference

1. **Find an issue number** in the table above
2. **Navigate to the file path** shown in the Implementation column
3. **Review the code** to see how the feature was implemented

## Additional Resources

- Full implementation details: [`IMPLEMENTATION_STATUS.md`](./IMPLEMENTATION_STATUS.md)
- Project architecture: [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- Implementation plan: [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)
- Build and deployment: [`README.md`](./README.md)

---

**Last Updated:** 2026-02-15  
**Status:** All 59 issues implemented ✅
