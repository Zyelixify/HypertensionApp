import 'react-native-paper';

export type AppTheme = MD3Theme & {
  custom: {
    success: string;
    warning: string;
    info: string;
    card: string;
    chart: {
      systolic: string;
      diastolic: string;
      label: string;
    };
  };
};

