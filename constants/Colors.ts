import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

// Nord Theme Palette - High Contrast Modified
export const Nord = {
  polarNight0: '#1E222A', 
  polarNight1: '#252A34',
  polarNight2: '#2E3440',
  polarNight3: '#3B4252',
  snowStorm0: '#E5E9F0', 
  snowStorm1: '#F4F7FB',
  snowStorm2: '#FFFFFF',

  // Vibrant Accents
  frost0: '#8FBCBB',
  frost1: '#5AA9BE',
  frost2: '#81A1C1', 
  frost3: '#5E81AC', 
  frostBright: '#88C0D0',

  auroraRed: '#D64652',
  auroraRedBright: '#FF6B6B',
  
  auroraOrange: '#D08770',
  auroraYellow: '#EBCB8B',
  
  auroraGreen: '#8FBC8B',
  auroraGreenBright: '#A3BE8C',

  auroraPurple: '#B48EAD',
};

// 2. Semantic Palette - Light (High Contrast)
const LightPalette = {
  primary: Nord.frost3,
  onPrimary: '#FFFFFF',
  primaryContainer: '#D2E3F0',
  onPrimaryContainer: '#233242',

  secondary: Nord.frost1,
  onSecondary: '#FFFFFF',
  secondaryContainer: '#D5F1F6',
  onSecondaryContainer: '#1A3B45',

  tertiary: Nord.auroraPurple,
  onTertiary: '#FFFFFF',
  
  background: '#F8F9FA', 
  onBackground: '#1A1C23',  
  
  surface: '#FFFFFF',       
  onSurface: '#1A1C23',
  surfaceVariant: '#E1E5EA',   
  onSurfaceVariant: '#4C566A', 
  
  error: '#BA1A1A',          
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',

  outline: '#707887', 
  outlineVariant: '#C0C6D0',    

  shadow: '#000000',
};

// 3. Semantic Palette - Dark (Deep & Vivid)
const DarkPalette = {
  primary: Nord.frostBright, 
  onPrimary: '#1E222A',
  primaryContainer: Nord.frost3,
  onPrimaryContainer: '#E5E9F0',

  secondary: Nord.frost2,
  onSecondary: '#1E222A',
  secondaryContainer: '#3B4252',
  onSecondaryContainer: '#E5E9F0',

  tertiary: Nord.auroraPurple,
  onTertiary: '#1E222A',

  background: '#121419',
  onBackground: '#ECEFF4',   
  
  surface: '#1E222A',       
  onSurface: '#ECEFF4',
  surfaceVariant: '#2E3440',
  onSurfaceVariant: '#D8DEE9', 

  error: '#FFB4AB',    
  onError: '#690005',
  errorContainer: '#93000A',
  onErrorContainer: '#FFDAD6',

  outline: '#8F9BB3',
  outlineVariant: '#434C5E',

  shadow: '#000000',
};

export const nordLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: LightPalette.primary,
    onPrimary: LightPalette.onPrimary,
    primaryContainer: LightPalette.primaryContainer,
    onPrimaryContainer: LightPalette.onPrimaryContainer,
    secondary: LightPalette.secondary,
    onSecondary: LightPalette.onSecondary,
    secondaryContainer: LightPalette.secondaryContainer,
    onSecondaryContainer: LightPalette.onSecondaryContainer,
    background: LightPalette.background,
    onBackground: LightPalette.onBackground,
    surface: LightPalette.surface,
    onSurface: LightPalette.onSurface,
    surfaceVariant: LightPalette.surfaceVariant,
    onSurfaceVariant: LightPalette.onSurfaceVariant,
    error: LightPalette.error,
    elevation: {
        level1: '#FFFFFF',
        level2: '#F5F5F5',
        level3: '#EEEEEE',
        level4: '#E0E0E0',
        level5: '#E0E0E0',
    },
    outline: LightPalette.outline,
    outlineVariant: LightPalette.outlineVariant,
    shadow: LightPalette.shadow,
  },
  custom: {
      success: '#2E7D32',
      warning: '#F57F17',
      info: LightPalette.primary,
      card: LightPalette.surface,
      chart: {
        systolic: '#D32F2F',
        diastolic: '#2E7D32', 
        label: '#455A64',
      }
  }
};

export const nordDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: DarkPalette.primary,
    onPrimary: DarkPalette.onPrimary,
    primaryContainer: DarkPalette.primaryContainer,
    onPrimaryContainer: DarkPalette.onPrimaryContainer,
    secondary: DarkPalette.secondary,
    onSecondary: DarkPalette.onSecondary,
    secondaryContainer: DarkPalette.secondaryContainer,
    onSecondaryContainer: DarkPalette.onSecondaryContainer,
    background: DarkPalette.background,
    onBackground: DarkPalette.onBackground,
    surface: DarkPalette.surface,
    onSurface: DarkPalette.onSurface,
    surfaceVariant: DarkPalette.surfaceVariant,
    onSurfaceVariant: DarkPalette.onSurfaceVariant,
    error: DarkPalette.error,
    elevation: {
        level1: '#252A34',
        level2: '#2E3440',
        level3: '#3B4252',
        level4: '#434C5E',
        level5: '#4C566A',
    },
    outline: DarkPalette.outline,
    outlineVariant: DarkPalette.outlineVariant,
    shadow: DarkPalette.shadow,
  },
  custom: {
      success: Nord.auroraGreenBright,
      warning: Nord.auroraYellow,
      info: DarkPalette.primary,
      card: DarkPalette.surface,
      chart: {
        systolic: '#FF8A80',
        diastolic: '#B9F6CA', 
        label: '#E5E9F0',
      }
  }
};

const tintColorLight = LightPalette.primary;
const tintColorDark = DarkPalette.primary;

export default {
  Nord,
  light: {
    text: LightPalette.onBackground,
    background: LightPalette.background,
    tint: tintColorLight,
    tabIconDefault: LightPalette.outline,
    tabIconSelected: tintColorLight,
    card: LightPalette.surface,
    border: LightPalette.surfaceVariant,
    success: '#2E7D32',
    warning: '#F57F17',
    error: LightPalette.error,
  },
  dark: {
    text: DarkPalette.onBackground,
    background: DarkPalette.background,
    tint: tintColorDark,
    tabIconDefault: DarkPalette.outline,
    tabIconSelected: tintColorDark,
    card: DarkPalette.surface,
    border: DarkPalette.surfaceVariant,
    success: Nord.auroraGreenBright,
    warning: Nord.auroraYellow,
    error: DarkPalette.error,
  },
};

