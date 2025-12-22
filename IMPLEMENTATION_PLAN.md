# Blazelog Mobile - Implementation Plan

## Overview

This document breaks down the implementation into small, atomic tasks suitable for individual work sessions. Tasks are organized by phase with clear dependencies.

---

## API Contract Assumptions

- Responses are wrapped in a `data` envelope (e.g., `response.data.data`).
- Login uses `username` + `password` and returns tokens only; fetch `/users/me` for profile.
- Log queries use `page`/`per_page` pagination and require `start` (per OpenAPI).
- Admin password resets use `PUT /users/{id}/password`, are restricted to lower roles, and cannot target the current admin.
- `GET /logs/stream` supports `Authorization: Bearer <token>` headers for SSE.
- Public "forgot password" flow is out of scope; only in-session change/reset endpoints are planned.

---

## Phase 0: Project Setup

### P0-1: Initialize Expo Project
**Dependencies:** None
**Description:** Create new Expo managed workflow project with TypeScript template.
```bash
npx create-expo-app blazelog-mobile --template expo-template-blank-typescript
```
**Acceptance Criteria:**
- [ ] Project runs with `npx expo start`
- [ ] TypeScript configured
- [ ] Basic App.tsx renders

---

### P0-2: Configure ESLint and Prettier
**Dependencies:** P0-1
**Description:** Set up linting and formatting with React Native specific rules.
**Files to create:**
- `.eslintrc.js`
- `.prettierrc`
- Update `package.json` scripts

**Acceptance Criteria:**
- [ ] `npm run lint` works
- [ ] `npm run format` works

---

### P0-3: Configure Path Aliases
**Dependencies:** P0-1
**Description:** Set up `@/` path alias for cleaner imports.
**Files to modify:**
- `tsconfig.json`
- `babel.config.js`

**Acceptance Criteria:**
- [ ] Can import using `@/components/...`

---

### P0-4: Install Core Dependencies
**Dependencies:** P0-1
**Description:** Install all required npm packages.
```bash
npx expo install expo-secure-store expo-constants expo-notifications expo-device
npm install zustand @tanstack/react-query axios react-native-paper react-hook-form zod @hookform/resolvers @microsoft/fetch-event-source
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
```
**Acceptance Criteria:**
- [ ] All packages installed
- [ ] No peer dependency conflicts

---

### P0-5: Create Folder Structure
**Dependencies:** P0-4
**Description:** Create empty folder structure per ARCHITECTURE.md.
**Folders to create:**
- `src/api/`
- `src/components/ui/`
- `src/components/logs/`
- `src/components/alerts/`
- `src/components/common/`
- `src/screens/auth/`
- `src/screens/logs/`
- `src/screens/alerts/`
- `src/screens/admin/`
- `src/screens/projects/`
- `src/screens/settings/`
- `src/navigation/`
- `src/store/`
- `src/hooks/`
- `src/utils/`
- `src/theme/`
- `src/types/`

**Acceptance Criteria:**
- [ ] All folders exist
- [ ] Each folder has an `index.ts` for exports

---

### P0-6: Configure Environment Variables
**Dependencies:** P0-1
**Description:** Set up Expo environment configuration.
**Files to create:**
- `app.config.ts`
- `.env.example`
- `.env.development`
- `src/types/env.d.ts`

**Acceptance Criteria:**
- [ ] `API_URL` accessible via `Constants.expoConfig.extra`
- [ ] TypeScript types for env vars

---

### P0-7: Set Up Theme Configuration
**Dependencies:** P0-4
**Description:** Configure React Native Paper theme.
**Files to create:**
- `src/theme/colors.ts`
- `src/theme/spacing.ts`
- `src/theme/index.ts`

**Acceptance Criteria:**
- [ ] Light/dark theme defined
- [ ] Colors match Blazelog brand

---

## Phase 1: API Layer

### P1-1: Create Axios Client Instance
**Dependencies:** P0-6
**Description:** Set up base Axios instance with base URL and timeout.
**Files to create:**
- `src/api/client.ts`

**Acceptance Criteria:**
- [ ] Client configured with base URL from env
- [ ] 10s timeout set
- [ ] Exports `client` instance

---

### P1-2: Create Secure Storage Helpers
**Dependencies:** P0-4
**Description:** Implement token storage using expo-secure-store.
**Files to create:**
- `src/utils/storage.ts`

**Functions:**
- `getAccessToken()`
- `setAccessToken(token)`
- `getRefreshToken()`
- `setRefreshToken(token)`
- `clearTokens()`

**Acceptance Criteria:**
- [ ] All functions implemented
- [ ] TypeScript types correct

---

### P1-3: Add Request Interceptor for Auth Header
**Dependencies:** P1-1, P1-2
**Description:** Add Axios request interceptor to attach Bearer token.
**Files to modify:**
- `src/api/client.ts`

**Acceptance Criteria:**
- [ ] Token attached to Authorization header
- [ ] Requests without token still work

---

### P1-4: Add Response Interceptor for Token Refresh
**Dependencies:** P1-3
**Description:** Handle 401 responses with automatic token refresh.
**Files to modify:**
- `src/api/client.ts`

**Acceptance Criteria:**
- [ ] 401 triggers refresh attempt
- [ ] Concurrent requests queue during refresh
- [ ] Failed refresh clears session without calling logout API (avoid interceptor recursion)

---

### P1-5: Create API Error Handler
**Dependencies:** P1-1
**Description:** Implement error parsing and user-friendly messages.
**Files to create:**
- `src/utils/errors.ts`

**Classes/Functions:**
- `ApiError` class
- `handleApiError(error)`
- `showErrorAlert(error)`

**Acceptance Criteria:**
- [ ] Parses API error response
- [ ] Maps error codes to messages

---

### P1-6: Create API Types from Schema
**Dependencies:** P0-5
**Description:** Define TypeScript interfaces for API responses.
**Files to create:**
- `src/api/types.ts`

**Types:**
- `ApiEnvelope<T>`
- `LoginResponse`
- `User`
- `Log`
- `LogsResponse`
- `Alert`
- `AlertCreate`
- `AlertUpdate`
- `Project`
- `ApiErrorResponse`

**Acceptance Criteria:**
- [ ] All types match ARCHITECTURE.md schemas

---

### P1-7: Create Auth API Functions
**Dependencies:** P1-1, P1-6
**Description:** Implement auth endpoint functions.
**Files to create:**
- `src/api/auth.ts`

**Functions:**
- `login(username, password)`
- `refresh(refreshToken)`
- `logout(refreshToken)`

**Acceptance Criteria:**
- [ ] Login returns `LoginResponse` and stores tokens
- [ ] Logout posts `refresh_token` in request body
- [ ] All functions return typed responses

---

### P1-8: Create Logs API Functions
**Dependencies:** P1-1, P1-6
**Description:** Implement log endpoint functions.
**Files to create:**
- `src/api/logs.ts`

**Functions:**
- `getLogs(params)`
- `getLog(id)`
- `getLogStats(params)`

**Acceptance Criteria:**
- [ ] `start` is required in queries (RFC3339)
- [ ] Pagination uses `page`/`per_page`
- [ ] Filters align with OpenAPI (`agent_id`, `level(s)`, `type`, `source`, `q`, `search_mode`)
- [ ] `getLog(id)` calls `GET /logs/{id}` and returns a typed `Log`
- [ ] `getLogStats` supports `start`, `end`, `agent_id`, `type`, and `interval`

---

### P1-9: Create Alerts API Functions
**Dependencies:** P1-1, P1-6
**Description:** Implement alert CRUD functions.
**Files to create:**
- `src/api/alerts.ts`

**Functions:**
- `getAlerts(projectId)`
- `getAlert(id)`
- `createAlert(data)`
- `updateAlert(id, data)`
- `deleteAlert(id)`

**Acceptance Criteria:**
- [ ] All CRUD operations implemented

---

### P1-10: Create Projects API Functions
**Dependencies:** P1-1, P1-6
**Description:** Implement project endpoint functions.
**Files to create:**
- `src/api/projects.ts`

**Functions:**
- `getProjects()`
- `getProject(id)`

**Acceptance Criteria:**
- [ ] Returns typed Project array

---

### P1-11: Create Users API Functions
**Dependencies:** P1-1, P1-6
**Description:** Implement user endpoint functions.
**Files to create:**
- `src/api/users.ts`

**Functions:**
- `getCurrentUser()`
- `changePassword(currentPassword, newPassword)`
- `listUsers()` (admin only)
- `getUser(id)` (admin only)
- `resetUserPassword(id, password)` (admin only)
- `registerPushToken(token, platform)`

**Acceptance Criteria:**
- [ ] Returns typed User
- [ ] `changePassword` calls `/users/me/password`
- [ ] `resetUserPassword` calls `/users/{id}/password` and enforces role + self-reset rules in UI
- [ ] `registerPushToken` posts to `/users/me/push-token`

---

## Phase 2: State Management

### P2-1: Create Auth Store
**Dependencies:** P1-2, P1-7
**Description:** Implement Zustand store for auth state.
**Files to create:**
- `src/store/authStore.ts`

**State:**
- `isAuthenticated`
- `isLoading`
- `user`

**Actions:**
- `login(username, password)`
- `logout()`
- `clearSession()`
- `checkAuth()`

**Acceptance Criteria:**
- [ ] Persists auth state check on app start
- [ ] Clears state on logout
- [ ] `clearSession()` used when refresh fails to avoid interceptor loops
- [ ] Profile fetched via `/users/me` after login

---

### P2-2: Create Project Store
**Dependencies:** P0-4
**Description:** Implement Zustand store for project selection.
**Files to create:**
- `src/store/projectStore.ts`

**State:**
- `currentProjectId`
- `projects`

**Actions:**
- `setCurrentProject(id)`
- `setProjects(projects)`

**Acceptance Criteria:**
- [ ] Persists selected project

---

### P2-3: Create Settings Store
**Dependencies:** P0-4
**Description:** Implement Zustand store for app preferences.
**Files to create:**
- `src/store/settingsStore.ts`

**State:**
- `theme` ('light' | 'dark' | 'system')
- `notificationsEnabled`

**Actions:**
- `setTheme(theme)`
- `setNotificationsEnabled(enabled)`

**Acceptance Criteria:**
- [ ] Persists to MMKV/AsyncStorage

---

### P2-4: Create Store Exports
**Dependencies:** P2-1, P2-2, P2-3
**Description:** Create barrel export file.
**Files to create:**
- `src/store/index.ts`

**Acceptance Criteria:**
- [ ] All stores exported

---

### P2-5: Set Up TanStack Query Client
**Dependencies:** P0-4
**Description:** Configure QueryClient with defaults.
**Files to create:**
- `src/utils/queryClient.ts`

**Acceptance Criteria:**
- [ ] Stale time configured (5 min)
- [ ] Retry logic configured
- [ ] GC time configured (24 hours)

---

### P2-6: Add Query Client Persistence
**Dependencies:** P2-5
**Description:** Persist query cache to MMKV.
**Files to modify:**
- `src/utils/queryClient.ts`

**Dependencies to install:**
- `react-native-mmkv`
- `@tanstack/query-sync-storage-persister`

**Acceptance Criteria:**
- [ ] Cache survives app restart

---

## Phase 3: Navigation

### P3-1: Define Navigation Types
**Dependencies:** P0-5
**Description:** Create TypeScript types for navigation params.
**Files to create:**
- `src/types/navigation.ts`

**Types:**
- `RootStackParamList`
- `MainTabParamList`
- `LogStackParamList`
- `AlertStackParamList`
- `SettingsStackParamList`

**Acceptance Criteria:**
- [ ] All screens have typed params

---

### P3-2: Create Log Stack Navigator
**Dependencies:** P3-1
**Description:** Stack navigator for log screens.
**Files to create:**
- `src/navigation/LogStack.tsx`

**Screens:**
- LogListScreen
- LogDetailScreen
- LogStreamScreen

**Acceptance Criteria:**
- [ ] Navigation between screens works

---

### P3-3: Create Alert Stack Navigator
**Dependencies:** P3-1
**Description:** Stack navigator for alert screens.
**Files to create:**
- `src/navigation/AlertStack.tsx`

**Screens:**
- AlertListScreen
- AlertDetailScreen
- AlertFormScreen

**Acceptance Criteria:**
- [ ] Navigation between screens works

---

### P3-4: Create Settings Stack Navigator
**Dependencies:** P3-1
**Description:** Stack navigator for settings and admin screens.
**Files to create:**
- `src/navigation/SettingsStack.tsx`

**Screens:**
- SettingsScreen
- ChangePasswordScreen
- UserListScreen (admin only)
- UserDetailScreen (admin only)

**Acceptance Criteria:**
- [ ] Navigation between settings screens works
- [ ] Admin-only screens are gated by role

---

### P3-5: Create Main Tab Navigator
**Dependencies:** P3-2, P3-3, P3-4
**Description:** Bottom tab navigator.
**Files to create:**
- `src/navigation/MainTabs.tsx`

**Tabs:**
- Logs (LogStack)
- Alerts (AlertStack)
- Settings (SettingsStack)

**Acceptance Criteria:**
- [ ] Tabs switch correctly
- [ ] Icons displayed

---

### P3-6: Create Root Navigator
**Dependencies:** P2-1, P3-5
**Description:** Root navigator with auth check.
**Files to create:**
- `src/navigation/RootNavigator.tsx`

**Logic:**
- Show Login if not authenticated
- Show MainTabs if authenticated
- Show loading during auth check

**Acceptance Criteria:**
- [ ] Redirects based on auth state
- [ ] RootNavigator does not create `NavigationContainer`

---

### P3-7: Configure Deep Linking
**Dependencies:** P3-6
**Description:** Set up deep link configuration.
**Files to create:**
- `src/navigation/linking.ts`

**URL patterns:**
- `blazelog://logs`
- `blazelog://logs/:logId`
- `blazelog://alerts`
- `blazelog://alerts/:alertId`
- `blazelog://settings`
- `blazelog://settings/password`
- `blazelog://settings/users`
- `blazelog://settings/users/:userId`

**Acceptance Criteria:**
- [ ] Deep links open correct screens

---

### P3-8: Integrate Navigation in App.tsx
**Dependencies:** P3-6, P3-7, P2-5
**Description:** Set up NavigationContainer with providers.
**Files to modify:**
- `App.tsx`

**Providers to add:**
- QueryClientProvider
- PaperProvider
- NavigationContainer

**Acceptance Criteria:**
- [ ] App renders with navigation
- [ ] `NavigationContainer` wraps `RootNavigator` and uses linking config

---

## Phase 4: UI Components

### P4-1: Create Button Component
**Dependencies:** P0-7
**Description:** Reusable button with variants.
**Files to create:**
- `src/components/ui/Button.tsx`

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline'
- `loading`: boolean
- `disabled`: boolean

**Acceptance Criteria:**
- [ ] All variants styled
- [ ] Loading state shows spinner

---

### P4-2: Create Input Component
**Dependencies:** P0-7
**Description:** Text input with label and error.
**Files to create:**
- `src/components/ui/Input.tsx`

**Props:**
- `label`
- `error`
- `secureTextEntry`

**Acceptance Criteria:**
- [ ] Error state styled red
- [ ] Label animates on focus

---

### P4-3: Create Card Component
**Dependencies:** P0-7
**Description:** Container card with shadow.
**Files to create:**
- `src/components/ui/Card.tsx`

**Acceptance Criteria:**
- [ ] Consistent shadow/elevation
- [ ] Supports onPress

---

### P4-4: Create EmptyState Component
**Dependencies:** P0-7
**Description:** Empty list placeholder.
**Files to create:**
- `src/components/common/EmptyState.tsx`

**Props:**
- `icon`
- `title`
- `description`
- `action` (optional button)

**Acceptance Criteria:**
- [ ] Centered layout
- [ ] Optional action button

---

### P4-5: Create LoadingScreen Component
**Dependencies:** P0-7
**Description:** Full screen loading indicator.
**Files to create:**
- `src/components/common/LoadingScreen.tsx`

**Acceptance Criteria:**
- [ ] Centered spinner
- [ ] Optional message

---

### P4-6: Create OfflineBanner Component
**Dependencies:** P0-7
**Description:** Banner shown when offline.
**Files to create:**
- `src/components/common/OfflineBanner.tsx`

**Acceptance Criteria:**
- [ ] Fixed position at top
- [ ] Yellow/warning color

---

### P4-7: Create LogLevelBadge Component
**Dependencies:** P0-7
**Description:** Colored badge for log levels.
**Files to create:**
- `src/components/logs/LogLevelBadge.tsx`

**Colors:**
- debug: gray
- info: blue
- warning: yellow
- error: red
- fatal: purple

**Acceptance Criteria:**
- [ ] Each level has distinct color

---

### P4-8: Create LogEntry Component
**Dependencies:** P4-7, P4-3
**Description:** Single log entry row.
**Files to create:**
- `src/components/logs/LogEntry.tsx`

**Displays:**
- Level badge
- Timestamp
- Message (truncated)
- Source (if present)

**Acceptance Criteria:**
- [ ] Tappable for detail view
- [ ] Message truncates at 2 lines

---

### P4-9: Create LogFilter Component
**Dependencies:** P4-1
**Description:** Filter bar for log list.
**Files to create:**
- `src/components/logs/LogFilter.tsx`

**Filters:**
- Level (multi-select chips)
- Date range
- Search text

**Acceptance Criteria:**
- [ ] Filters update callback on change
- [ ] Date range provides a required `start` value for API queries

---

### P4-10: Create AlertCard Component
**Dependencies:** P4-3, P4-7
**Description:** Alert list item card.
**Files to create:**
- `src/components/alerts/AlertCard.tsx`

**Displays:**
- Name
- Description
- Condition summary
- Enabled toggle

**Acceptance Criteria:**
- [ ] Toggle enables/disables alert

---

### P4-11: Create UI Components Index
**Dependencies:** P4-1 through P4-10
**Description:** Barrel exports for components.
**Files to create:**
- `src/components/ui/index.ts`
- `src/components/common/index.ts`
- `src/components/logs/index.ts`
- `src/components/alerts/index.ts`

**Acceptance Criteria:**
- [ ] All components exported

---

## Phase 5: Authentication Screens

### P5-1: Create Login Screen Layout
**Dependencies:** P4-1, P4-2
**Description:** Login form UI without logic.
**Files to create:**
- `src/screens/auth/LoginScreen.tsx`

**Elements:**
- Logo
- Username input
- Password input
- Login button

**Acceptance Criteria:**
- [ ] Keyboard avoiding view
- [ ] Inputs styled

---

### P5-2: Add Login Form Validation
**Dependencies:** P5-1
**Description:** Add react-hook-form with Zod validation.
**Files to modify:**
- `src/screens/auth/LoginScreen.tsx`

**Validation:**
- Username: required
- Password: required, min 8 chars

**Acceptance Criteria:**
- [ ] Errors display on blur
- [ ] Submit disabled if invalid

---

### P5-3: Connect Login to Auth Store
**Dependencies:** P5-2, P2-1
**Description:** Wire up login form to auth store.
**Files to modify:**
- `src/screens/auth/LoginScreen.tsx`

**Acceptance Criteria:**
- [ ] Successful login navigates to main
- [ ] Error shows alert

---

## Phase 6: Log Screens

### P6-1: Create useLogsQuery Hook
**Dependencies:** P1-8, P2-5
**Description:** TanStack Query hook for fetching logs.
**Files to create:**
- `src/hooks/useLogs.ts`

**Features:**
- Infinite query for pagination (page/per_page)
- Required `start` parameter in filters
- Filter parameters from OpenAPI (agent_id, level(s), type, source, q, search_mode)
- Error handling

**Acceptance Criteria:**
- [ ] Returns `LogsResponse` from `response.data.data`
- [ ] Supports refetch

---

### P6-2: Create LogList Component
**Dependencies:** P4-8, P6-1
**Description:** FlatList of log entries.
**Files to create:**
- `src/components/logs/LogList.tsx`

**Features:**
- Infinite scroll (onEndReached)
- Pull to refresh
- Empty state

**Acceptance Criteria:**
- [ ] Loads more on scroll
- [ ] Shows loading footer

---

### P6-3: Create Log List Screen
**Dependencies:** P6-2, P4-9
**Description:** Main log viewing screen.
**Files to create:**
- `src/screens/logs/LogListScreen.tsx`

**Features:**
- Filter bar
- Log list
- Time range context

**Acceptance Criteria:**
- [ ] Filters update list
- [ ] Navigation to detail
- [ ] Default time range provided if user has not selected one

---

### P6-4: Create Log Detail Screen
**Dependencies:** P4-7, P1-8
**Description:** Full log entry view.
**Files to create:**
- `src/screens/logs/LogDetailScreen.tsx`

**Displays:**
- All log fields
- Formatted timestamp
- Expandable metadata JSON
- Copy button

**Acceptance Criteria:**
- [ ] Metadata is collapsible
- [ ] Can copy log ID
- [ ] Screen can render from navigation params when provided to avoid refetch

---

### P6-5: Create useSSE Hook
**Dependencies:** P1-2
**Description:** SSE connection hook with reconnection.
**Files to create:**
- `src/hooks/useSSE.ts`

**Features:**
- Connect with auth token
- Exponential backoff retry
- Network status awareness
- Use `@microsoft/fetch-event-source` for auth headers and retries
- Default `start` parameter to recent window if not provided

**Acceptance Criteria:**
- [ ] Reconnects on disconnect
- [ ] Stops on unmount
- [ ] Uses `@microsoft/fetch-event-source` instead of native `EventSource`

---

### P6-6: Create Log Stream Screen
**Dependencies:** P6-5, P4-8
**Description:** Real-time log streaming view.
**Files to create:**
- `src/screens/logs/LogStreamScreen.tsx`

**Features:**
- Live log feed (newest first)
- Connection status indicator
- Pause/resume
- Level filter

**Acceptance Criteria:**
- [ ] Logs appear in real-time
- [ ] Max 500 logs in memory

---

## Phase 7: Alert Screens

### P7-1: Create useAlertsQuery Hook
**Dependencies:** P1-9, P2-5
**Description:** TanStack Query hooks for alerts.
**Files to create:**
- `src/hooks/useAlerts.ts`

**Hooks:**
- `useAlerts(projectId)`
- `useAlert(id)`
- `useCreateAlert()`
- `useUpdateAlert()`
- `useDeleteAlert()`

**Acceptance Criteria:**
- [ ] Mutations invalidate queries

---

### P7-2: Create Alert List Screen
**Dependencies:** P7-1, P4-10
**Description:** List of project alerts.
**Files to create:**
- `src/screens/alerts/AlertListScreen.tsx`

**Features:**
- FlatList of AlertCards
- FAB to create new
- Empty state

**Acceptance Criteria:**
- [ ] Toggle updates alert
- [ ] Navigate to detail/edit

---

### P7-3: Create Alert Detail Screen
**Dependencies:** P7-1
**Description:** View alert details.
**Files to create:**
- `src/screens/alerts/AlertDetailScreen.tsx`

**Displays:**
- Name, description
- Condition details
- Notification channels
- Edit/Delete buttons

**Acceptance Criteria:**
- [ ] Delete shows confirmation
- [ ] Edit navigates to form

---

### P7-4: Create Alert Form Screen
**Dependencies:** P7-1, P4-1, P4-2
**Description:** Create/edit alert form.
**Files to create:**
- `src/screens/alerts/AlertFormScreen.tsx`

**Fields:**
- Name
- Description
- Type (error_rate | log_match | threshold)
- Condition (expression string)
- Severity (info | warning | critical)
- Window (duration)
- Cooldown (duration)
- Notify channels (multi-select)
- Enabled toggle

**Acceptance Criteria:**
- [ ] Works for create and edit
- [ ] Validates required fields

---

## Phase 8: Project & Settings

### P8-1: Create useProjectsQuery Hook
**Dependencies:** P1-10, P2-5
**Description:** Query hook for projects.
**Files to create:**
- Add to `src/hooks/useProjects.ts`

**Acceptance Criteria:**
- [ ] Returns user's projects

---

### P8-2: Create Project Switcher Screen
**Dependencies:** P8-1, P2-2
**Description:** Project selection screen.
**Files to create:**
- `src/screens/projects/ProjectSwitcherScreen.tsx`

**Features:**
- List of projects
- Current project highlighted
- Tap to switch

**Acceptance Criteria:**
- [ ] Updates project store
- [ ] Navigates back after select

---

### P8-3: Create Settings Screen
**Dependencies:** P2-3, P2-1
**Description:** App settings and preferences.
**Files to create:**
- `src/screens/settings/SettingsScreen.tsx`

**Options:**
- Theme toggle
- Notification toggle
- Current project (tap to switch)
- Change password
- Logout button
- App version

**Acceptance Criteria:**
- [ ] Settings persist
- [ ] Logout clears auth

---

### P8-4: Create Change Password Screen
**Dependencies:** P1-11, P4-1, P4-2
**Description:** Allow current user to change their password.
**Files to create:**
- `src/screens/settings/ChangePasswordScreen.tsx`

**Fields:**
- Current password
- New password
- Confirm new password

**Acceptance Criteria:**
- [ ] Calls `/users/me/password` with `current_password` and `new_password`
- [ ] Shows success confirmation
- [ ] Validates min length and confirmation match

---

### P8-5: Create Admin User Management Screen
**Dependencies:** P1-11, P4-3, P4-1
**Description:** Admin-only user list with reset password action.
**Files to create:**
- `src/screens/admin/UserListScreen.tsx`
- `src/screens/admin/UserDetailScreen.tsx`

**Features:**
- List users with role and email
- Reset password action for lower-role users (not self)
  - UI note: treat "self" as `targetUserId === currentUser.id` from `/users/me`

**Acceptance Criteria:**
- [ ] Uses `/users` and `/users/{id}` to load user data
- [ ] Calls `/users/{id}/password` to reset passwords
- [ ] UI only allows resetting users with lower roles
- [ ] UI prevents resetting the current user's password
- [ ] Non-admin users cannot access these screens

---

## Phase 9: Offline & Network

### P9-1: Create Network Status Hook
**Dependencies:** P0-4
**Description:** Hook to monitor network state.
**Files to create:**
- `src/hooks/useNetworkStatus.ts`

**Install:** `@react-native-community/netinfo`

**Returns:**
- `isOnline`
- `connectionType`

**Acceptance Criteria:**
- [ ] Updates on network change

---

### P9-2: Integrate Offline Banner
**Dependencies:** P4-6, P9-1
**Description:** Show banner when offline.
**Files to modify:**
- `src/navigation/RootNavigator.tsx`

**Acceptance Criteria:**
- [ ] Banner appears when offline
- [ ] Disappears when online

---

### P9-3: Configure Offline Query Behavior
**Dependencies:** P2-6, P9-1
**Description:** Adjust query behavior when offline.
**Files to modify:**
- `src/utils/queryClient.ts`

**Behavior:**
- Serve from cache when offline
- Disable refetch when offline

**Acceptance Criteria:**
- [ ] Cached data shows when offline
- [ ] No network errors when offline

---

## Phase 10: Push Notifications

### P10-1: Create Notification Registration
**Dependencies:** P1-11
**Description:** Request permission and register token.
**Files to create:**
- `src/utils/notifications.ts`

**Functions:**
- `registerForPushNotifications()`

**Acceptance Criteria:**
- [ ] Requests permission
- [ ] Registers token with backend

---

### P10-2: Configure Android Notification Channel
**Dependencies:** P10-1
**Description:** Set up Android notification channel.
**Files to modify:**
- `src/utils/notifications.ts`

**Acceptance Criteria:**
- [ ] 'alerts' channel created
- [ ] High importance set

---

### P10-3: Handle Notification Taps
**Dependencies:** P10-1, P3-5
**Description:** Navigate on notification tap.
**Files to modify:**
- `App.tsx`

**Behavior:**
- Alert notification → AlertDetailScreen

**Acceptance Criteria:**
- [ ] Tapping notification opens correct screen

---

### P10-4: Integrate Notification Registration
**Dependencies:** P10-1, P2-1
**Description:** Register after login.
**Files to modify:**
- `src/store/authStore.ts`

**Acceptance Criteria:**
- [ ] Token registered after successful login

---

## Phase 11: Testing

### P11-1: Configure Jest
**Dependencies:** P0-1
**Description:** Set up Jest for unit tests.
**Files to create/modify:**
- `jest.config.js`
- `jest.setup.js`

**Acceptance Criteria:**
- [ ] `npm test` runs

---

### P11-2: Add React Native Testing Library
**Dependencies:** P11-1
**Description:** Set up RNTL for component tests.
**Install:** `@testing-library/react-native`

**Acceptance Criteria:**
- [ ] Can render and query components

---

### P11-3: Write Auth Store Tests
**Dependencies:** P11-1, P2-1
**Description:** Unit tests for auth store.
**Files to create:**
- `__tests__/store/authStore.test.ts`

**Test cases:**
- Initial state
- Login success
- Login failure
- Logout

**Acceptance Criteria:**
- [ ] All tests pass

---

### P11-4: Write API Error Handler Tests
**Dependencies:** P11-1, P1-5
**Description:** Unit tests for error handling.
**Files to create:**
- `__tests__/utils/errors.test.ts`

**Acceptance Criteria:**
- [ ] Error parsing tested
- [ ] Message mapping tested
- [ ] Error shape matches `ApiErrorResponse` (`error.code`, `error.message`)

---

### P11-5: Write LogEntry Component Tests
**Dependencies:** P11-2, P4-8
**Description:** Component tests for LogEntry.
**Files to create:**
- `__tests__/components/LogEntry.test.tsx`

**Acceptance Criteria:**
- [ ] Renders all log fields
- [ ] Level badge correct

---

### P11-6: Set Up Maestro E2E Tests
**Dependencies:** P5-3
**Description:** Configure Maestro for E2E tests.
**Files to create:**
- `.maestro/login.yaml`

**Acceptance Criteria:**
- [ ] Login flow E2E test passes

---

### P11-7: Write Log Viewing E2E Test
**Dependencies:** P11-6, P6-3
**Description:** E2E test for viewing logs.
**Files to create:**
- `.maestro/view-logs.yaml`

**Acceptance Criteria:**
- [ ] Can login and view logs

---

## Phase 12: Polish & Release

### P12-1: Add App Icons
**Dependencies:** P0-1
**Description:** Create and configure app icons.
**Files to add:**
- `assets/icon.png` (1024x1024)
- `assets/adaptive-icon.png`

**Acceptance Criteria:**
- [ ] Icons display on both platforms

---

### P12-2: Add Splash Screen
**Dependencies:** P0-1
**Description:** Configure splash screen.
**Files to add:**
- `assets/splash.png`

**Acceptance Criteria:**
- [ ] Splash shows during load

---

### P12-3: Configure App Metadata
**Dependencies:** P12-1, P12-2
**Description:** Update app.json with final metadata.
**Fields:**
- name
- slug
- version
- bundleIdentifier
- package

**Acceptance Criteria:**
- [ ] Both platforms build

---

### P12-4: Create Production Build
**Dependencies:** P12-3
**Description:** Generate production builds.
**Commands:**
```bash
eas build --platform ios
eas build --platform android
```

**Acceptance Criteria:**
- [ ] iOS build succeeds
- [ ] Android build succeeds

---

## Task Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 0 | 7 | Project Setup |
| 1 | 11 | API Layer |
| 2 | 6 | State Management |
| 3 | 8 | Navigation |
| 4 | 11 | UI Components |
| 5 | 3 | Authentication |
| 6 | 6 | Log Screens |
| 7 | 4 | Alert Screens |
| 8 | 5 | Project & Settings |
| 9 | 3 | Offline & Network |
| 10 | 4 | Push Notifications |
| 11 | 7 | Testing |
| 12 | 4 | Polish & Release |
| **Total** | **79** | |

---

## Dependency Graph (Simplified)

```
P0 (Setup)
 ├── P1 (API) ────────┬── P2 (State) ── P3 (Navigation)
 │                    │                      │
 │                    │                      ▼
 │                    └──────────────── P5 (Auth Screens)
 │                                           │
 ├── P4 (UI Components) ─────────────────────┤
 │                                           │
 │                    ┌──────────────────────┘
 │                    ▼
 │              P6 (Log Screens)
 │              P7 (Alert Screens)
 │              P8 (Project/Settings)
 │                    │
 │                    ▼
 │              P9 (Offline)
 │              P10 (Push)
 │                    │
 │                    ▼
 └─────────────► P11 (Testing)
                      │
                      ▼
                P12 (Release)
```

---

## GitHub Issue Creation Script

Save this as `create-issues.sh` and run after installing `gh` CLI:

```bash
#!/bin/bash

# Phase labels
gh label create "phase:0-setup" --color "FBCA04" --description "Project setup tasks"
gh label create "phase:1-api" --color "0E8A16" --description "API layer tasks"
gh label create "phase:2-state" --color "1D76DB" --description "State management tasks"
gh label create "phase:3-nav" --color "D93F0B" --description "Navigation tasks"
gh label create "phase:4-ui" --color "5319E7" --description "UI component tasks"
gh label create "phase:5-auth" --color "006B75" --description "Authentication tasks"
gh label create "phase:6-logs" --color "B60205" --description "Log screen tasks"
gh label create "phase:7-alerts" --color "FBCA04" --description "Alert screen tasks"
gh label create "phase:8-settings" --color "0E8A16" --description "Settings tasks"
gh label create "phase:9-offline" --color "1D76DB" --description "Offline support tasks"
gh label create "phase:10-push" --color "D93F0B" --description "Push notification tasks"
gh label create "phase:11-test" --color "5319E7" --description "Testing tasks"
gh label create "phase:12-release" --color "006B75" --description "Release tasks"

# Example issue creation (repeat for each task)
gh issue create \
  --title "P0-1: Initialize Expo Project" \
  --label "phase:0-setup" \
  --body "## Description
Create new Expo managed workflow project with TypeScript template.

## Commands
\`\`\`bash
npx create-expo-app blazelog-mobile --template expo-template-blank-typescript
\`\`\`

## Acceptance Criteria
- [ ] Project runs with \`npx expo start\`
- [ ] TypeScript configured
- [ ] Basic App.tsx renders

## Dependencies
None"

# Add more gh issue create commands for each task...
```

To generate all issues, you can parse this markdown and create issues programmatically.
