// Blazelog brand colors - dark theme optimized for log viewing
export const colors = {
  // Primary brand
  primary: '#00d9ff',
  primaryDark: '#00a8cc',
  primaryLight: '#5ce1ff',

  // Background layers (dark theme)
  background: '#0d1117',
  surface: '#161b22',
  surfaceElevated: '#21262d',
  surfaceHighlight: '#30363d',

  // Text
  textPrimary: '#e6edf3',
  textSecondary: '#8b949e',
  textMuted: '#6e7681',
  textInverse: '#0d1117',

  // Status/Log levels
  debug: '#8b949e',
  info: '#58a6ff',
  warning: '#d29922',
  error: '#f85149',
  fatal: '#a371f7',

  // Semantic
  success: '#3fb950',
  danger: '#f85149',

  // Borders
  border: '#30363d',
  borderLight: '#21262d',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',

  // White/Black
  white: '#ffffff',
  black: '#000000',
} as const;

export const lightColors = {
  // Primary brand
  primary: '#0096b3',
  primaryDark: '#007a94',
  primaryLight: '#33b8d4',

  // Background layers
  background: '#ffffff',
  surface: '#f6f8fa',
  surfaceElevated: '#ffffff',
  surfaceHighlight: '#eaeef2',

  // Text
  textPrimary: '#1f2328',
  textSecondary: '#656d76',
  textMuted: '#8c959f',
  textInverse: '#ffffff',

  // Status/Log levels
  debug: '#656d76',
  info: '#0969da',
  warning: '#9a6700',
  error: '#cf222e',
  fatal: '#8250df',

  // Semantic
  success: '#1a7f37',
  danger: '#cf222e',

  // Borders
  border: '#d0d7de',
  borderLight: '#eaeef2',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.3)',

  // White/Black
  white: '#ffffff',
  black: '#000000',
} as const;

export type ColorScheme = typeof colors | typeof lightColors;
