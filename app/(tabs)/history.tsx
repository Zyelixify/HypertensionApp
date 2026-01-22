import { Nord } from '@/constants/Colors';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useUnifiedData } from '@/hooks/useUnifiedData';
import { BPReading } from '@/services/StorageService';
import { analyzeBP } from '@/utils/BloodPressure';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

export default function HistoryScreen() {
  const { bp } = useUnifiedData();
  const { data: readings = [], isLoading, refetch } = bp.readings;
  const theme = useAppTheme();

  // Sort descending for history list
  const sortedReadings = [...readings].sort((a, b) => b.timestamp - a.timestamp);

  useFocusEffect(
    useCallback(() => {
       refetch();
    }, [])
  );

  const renderItem = ({ item }: { item: BPReading }) => (
      <View style={[styles.sectionContainer, { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.outlineVariant }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                  <Text variant="labelLarge" style={{ color: theme.colors.secondary, marginBottom: 4 }}>
                      {item.source === 'health_connect' ? 'Health Connect' : 'Manual Entry'}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                        <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.onSurface, letterSpacing: -0.5 }}>
                          {item.systolic}/{item.diastolic}
                        </Text>
                        <Text variant="bodySmall" style={{ marginLeft: 6, color: theme.colors.onSurfaceVariant }}>mmHg</Text>
                  </View>
              </View>
              
              <View style={{ alignItems: 'flex-end' }}>
                    {(() => {
                        const analysis = analyzeBP(item.systolic, item.diastolic);
                        return (
                            <View style={{ 
                                backgroundColor: analysis.color, 
                                borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 8
                            }}>
                                <Text style={{ color: Nord.polarNight0, fontWeight: 'bold', fontSize: 12 }}>
                                    {analysis.status}
                                </Text>
                            </View>
                        );
                    })()}
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                            {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </Text>
                        <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                            {new Date(item.timestamp).toLocaleDateString()}
                        </Text>
                    </View>
              </View>
          </View>
      </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={sortedReadings}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 16,
    },
    sectionContainer: {
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
    },
});
