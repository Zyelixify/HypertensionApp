import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

// Nord Theme Palette
export const Nord = {
  polarNight0: '#2E3440',
  polarNight1: '#3B4252',
  polarNight2: '#434C5E',
  polarNight3: '#4C566A',

  snowStorm0: '#D8DEE9',
  snowStorm1: '#E5E9F0',
  snowStorm2: '#ECEFF4',

  frost0: '#8FBCBB', // Teal
  frost1: '#88C0D0', // Cyan
  frost2: '#81A1C1', // Light Blue
  frost3: '#5E81AC', // Dark Blue

  auroraRed: '#BF616A',
  auroraOrange: '#D08770',
  auroraYellow: '#EBCB8B',
  auroraGreen: '#A3BE8C',
  auroraPurple: '#B48EAD',

  // Brighter Chart Colors
  chartSystolic: '#FF6B6B',
  chartDiastolic: '#88E079', // Brighter version of Aurora Green
};

export const nordLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Nord.frost3,
    onPrimary: Nord.snowStorm2,
    secondary: Nord.frost1,
    background: Nord.snowStorm2,
    surface: Nord.snowStorm0,
    onSurface: Nord.polarNight0,
    error: Nord.auroraRed,
  }
};

export const nordDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Nord.frost2,
    onPrimary: Nord.polarNight0,
    secondary: Nord.frost1,
    background: Nord.polarNight0,
    surface: Nord.polarNight1,
    onSurface: Nord.snowStorm2,
    error: Nord.auroraRed,
    elevation: {
        level1: Nord.polarNight1,
        level2: Nord.polarNight2,
        level3: Nord.polarNight3,
        level4: Nord.polarNight3,
        level5: Nord.polarNight3,
    }
  }
};

const tintColorLight = Nord.frost3;
const tintColorDark = Nord.frost1;

export default {
  Nord,
  light: {
    text: Nord.polarNight0,
    background: Nord.snowStorm2,
    tint: tintColorLight,
    tabIconDefault: Nord.polarNight3,
    tabIconSelected: tintColorLight,
    card: Nord.snowStorm0,
    border: Nord.snowStorm1,
    success: Nord.auroraGreen,
    warning: Nord.auroraYellow,
    error: Nord.auroraRed,
  },
  dark: {
    text: Nord.snowStorm2,
    background: Nord.polarNight0,
    tint: tintColorDark,
    tabIconDefault: Nord.polarNight3,
    tabIconSelected: tintColorDark,
    card: Nord.polarNight1,
    border: Nord.polarNight2,
    success: Nord.auroraGreen,
    warning: Nord.auroraYellow,
    error: Nord.auroraRed,
  },
};
