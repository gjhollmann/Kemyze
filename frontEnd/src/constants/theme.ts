// Kemyze design system. Single source of truth for colors, fonts, and sizes.
// Values match the add_container / edit_container / editprofile / createprofile /
// tertiaryprofilemanagement screens. Import with `import { COLORS, FONT } from '@/constants/theme';`

export const COLORS = Object.freeze({
  // Surfaces
  screen: '#020617',
  panel: 'rgba(1, 8, 37, 0.74)',
  input: '#09091C',
  inputActive: '#131338',
  overlayCard: 'rgba(0, 0, 0, 0.5)',

  // Borders
  border: '#334155',
  borderAccent: 'rgba(33, 142, 255, 0.5)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#C9CFE9',

  // Accent & status
  accent: '#3B82F6',
  danger: '#FF4D4D',
  dangerDark: '#8B0000',
  shadow: '#06184A',
} as const);

export const GRADIENTS = Object.freeze({
  // Alexander's GradientButton (KM-131)
  buttonBorder: ['#0026E4', '#00C8FF', '#0026E4', '#00C8FF', '#0026E4'] as const,
  buttonFill: ['#2983FF', '#1B3DE9'] as const,
  deleteBorder: ['#8B0000', '#FF6B6B', '#8B0000', '#FF6B6B', '#8B0000'] as const,
  deleteFill: ['#FF4D4D', '#D91C1C'] as const,
  panel: ['rgba(1, 8, 37, 0.74)', 'rgba(1, 8, 37, 0.74)'] as const,
});

// Fonts are loaded once in src/app/_layout.tsx via useFonts.
export const FONT = Object.freeze({
  regular: 'JetBrains Mono',
  bold: 'JetBrains Mono Bold',
} as const);

export const FONT_SIZE = Object.freeze({
  pageTitle: 28,
  sheetTitle: 20,
  largeValue: 18,
  arrow: 17,
  sectionTitle: 16,
  body: 14,
  button: 14,
  secondary: 13,
  label: 12,
  error: 12,
  metadata: 11,
  close: 20,
} as const);

export const RADIUS = Object.freeze({
  small: 4,
  input: 9,
  card: 10,
  confirm: 18,
  panel: 20,
  circle: 25,
} as const);

export const SIZE = Object.freeze({
  inputHeight: 44,
  buttonHeight: 44,
  optionHeight: 48,
  sheetMaxWidth: 520,
  confirmMaxWidth: 390,
  navBarHeight: 76,
  smallScreenWidth: 430,
} as const);

export const SHADOW = Object.freeze({
  shadowColor: COLORS.shadow,
  shadowOpacity: 0.22,
  shadowRadius: 8,
  elevation: 5,
} as const);
