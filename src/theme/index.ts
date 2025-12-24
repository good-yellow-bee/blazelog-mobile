import { MD3DarkTheme, MD3LightTheme, MD3Theme } from 'react-native-paper';
import { colors, lightColors, ColorScheme } from './colors';
import { spacing, borderRadius, typography } from './spacing';

// Dark theme (default for Blazelog - optimized for log viewing)
export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    onPrimary: colors.textInverse,
    primaryContainer: colors.primaryDark,
    onPrimaryContainer: colors.textPrimary,
    secondary: colors.info,
    onSecondary: colors.textInverse,
    secondaryContainer: colors.surfaceElevated,
    onSecondaryContainer: colors.textPrimary,
    background: colors.background,
    onBackground: colors.textPrimary,
    surface: colors.surface,
    onSurface: colors.textPrimary,
    surfaceVariant: colors.surfaceElevated,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.border,
    outlineVariant: colors.borderLight,
    error: colors.error,
    onError: colors.white,
    errorContainer: colors.error,
    onErrorContainer: colors.white,
  },
};

// Light theme
export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: lightColors.primary,
    onPrimary: lightColors.textInverse,
    primaryContainer: lightColors.primaryLight,
    onPrimaryContainer: lightColors.textPrimary,
    secondary: lightColors.info,
    onSecondary: lightColors.textInverse,
    secondaryContainer: lightColors.surfaceElevated,
    onSecondaryContainer: lightColors.textPrimary,
    background: lightColors.background,
    onBackground: lightColors.textPrimary,
    surface: lightColors.surface,
    onSurface: lightColors.textPrimary,
    surfaceVariant: lightColors.surfaceHighlight,
    onSurfaceVariant: lightColors.textSecondary,
    outline: lightColors.border,
    outlineVariant: lightColors.borderLight,
    error: lightColors.error,
    onError: lightColors.white,
    errorContainer: lightColors.error,
    onErrorContainer: lightColors.white,
  },
};

// Extended theme with custom properties
export interface BlazelogTheme extends MD3Theme {
  custom: {
    colors: ColorScheme;
    spacing: typeof spacing;
    borderRadius: typeof borderRadius;
    typography: typeof typography;
  };
}

export const createBlazelogTheme = (isDark: boolean): BlazelogTheme => {
  const baseTheme = isDark ? darkTheme : lightTheme;
  const themeColors = isDark ? colors : lightColors;

  return {
    ...baseTheme,
    custom: {
      colors: themeColors,
      spacing,
      borderRadius,
      typography,
    },
  };
};

// Re-exports
export { colors, lightColors } from './colors';
export { spacing, borderRadius, typography } from './spacing';
export type { ColorScheme } from './colors';
