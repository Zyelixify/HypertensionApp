import { MD3Theme } from 'react-native-paper';

declare global {
  namespace ReactNativePaper {
    interface ThemeColors {}

    interface Theme extends MD3Theme {
      custom: {
        success: string;
        warning: string;
        info: string;
        card: string;
        chart: {
            systolic: string;
            diastolic: string;
            label: string;
        }
      };
    }
  }
}
