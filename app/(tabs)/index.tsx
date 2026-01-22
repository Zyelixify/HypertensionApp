import { DailyTipCard } from '@/components/dashboard/DailyTipCard';
import { LatestReadingCard } from '@/components/dashboard/LatestReadingCard';
import { WeeklyTrendChart } from '@/components/dashboard/WeeklyTrendChart';
import { useUnifiedData } from '@/hooks/useUnifiedData';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ProgressBar, Text, useTheme } from 'react-native-paper';

export default function DashboardScreen() {
  const { bp, gamification } = useUnifiedData();
  const { data: readings = [], isLoading, refetch } = bp.readings;
  const { streak } = bp;
  const theme = useTheme();
  
  useFocusEffect(
      useCallback(() => {
          refetch();
      }, [])
  );

  const latest = readings.length > 0 ? readings[readings.length - 1] : null;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>Hypertension App</Text>
            </View>
            
            {streak > 0 && (
                <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    paddingHorizontal: 12, 
                    paddingVertical: 6, 
                    borderColor: theme.colors.primaryContainer, 
                    borderWidth: 2,
                    borderRadius: 20,
                }}>
                    <MaterialCommunityIcons name="fire" size={24} color={theme.colors.primary} />
                    <Text variant="titleMedium" style={{ marginLeft: 6, fontWeight: 'bold', color: theme.colors.primary }}>{streak}</Text>
                </View>
            )}
        </View>

        <View style={{ paddingHorizontal: 16, marginVertical: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text variant="labelSmall" style={{ fontWeight: 'bold', color: theme.colors.secondary }}>Level {gamification.level}</Text>
                <Text variant="labelSmall" style={{ color: theme.colors.secondary }}>{gamification.xp} XP</Text>
            </View>
            <ProgressBar progress={gamification.progress} color={theme.colors.primary} style={{ borderRadius: 4, height: 6, backgroundColor: theme.colors.elevation.level3 }} />
        </View>

        <ScrollView 
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <LatestReadingCard latest={latest} />

            <WeeklyTrendChart readings={readings} />

            <DailyTipCard />
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 48,
        paddingBottom: 8,
    },
    scrollContent: {
        padding: 16,
    },
});
