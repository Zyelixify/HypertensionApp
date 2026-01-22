import { AppTheme } from '@/types';
import { useTheme } from 'react-native-paper';

export const useAppTheme = () => useTheme<AppTheme>();
