import { useAppTheme } from '@/hooks/useAppTheme';
import { StyleSheet, View } from 'react-native';
import { Avatar, Text } from 'react-native-paper';

export function DailyTipCard() {
    const theme = useAppTheme();

    return (
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
            <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
            <Avatar.Icon 
                size={48} 
                icon="lightbulb-on-outline" 
                color={theme.colors.onPrimary}
                style={{ backgroundColor: theme.colors.primary, marginRight: 16 }}
            />
            <View style={{ flex: 1 }}>
                <Text variant="labelLarge" style={{ color: theme.colors.primary, marginBottom: 4 }}>Daily Tip</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Reduce sodium intake to lower pressure. Try herbs instead of salt!
                </Text>
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
