import { useAppTheme } from '@/hooks/useAppTheme';
import { analyzeBP } from '@/utils/BloodPressure';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

interface LatestReadingCardProps {
    latest: {
        systolic: number;
        diastolic: number;
        timestamp: number;
    } | null;
}

export function LatestReadingCard({ latest }: LatestReadingCardProps) {
    const theme = useAppTheme();

    return (
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
            <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                    <Text variant="labelLarge" style={{ color: theme.colors.primary, marginBottom: 4 }}>Last Recorded</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                            <Text variant="displayMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface, letterSpacing: -1 }}>
                            {latest ? `${latest.systolic}/${latest.diastolic}` : '--/--'}
                            </Text>
                            <Text variant="bodyMedium" style={{ marginLeft: 6, color: theme.colors.onSurfaceVariant }}>mmHg</Text>
                    </View>
                </View>
                
                <View style={{ alignItems: 'flex-end' }}>
                        {latest && (() => {
                        const analysis = analyzeBP(latest.systolic, latest.diastolic);
                        return (
                            <View style={{ 
                                backgroundColor: analysis.color, 
                                borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 8
                            }}>
                                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 }}>
                                    {analysis.status}
                                </Text>
                            </View>
                        );
                        })()}
                        <View style={{ alignItems: 'flex-end' }}>
                        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                            {latest ? new Date(latest.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                        </Text>
                        <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                            {latest ? new Date(latest.timestamp).toLocaleDateString() : ''}
                        </Text>
                        </View>
                </View>
            </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
});
