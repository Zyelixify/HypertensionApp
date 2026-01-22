import { StyleSheet, View } from 'react-native';
import { Avatar, Text, useTheme } from 'react-native-paper';

export function DailyTipCard() {
    const theme = useTheme();

    return (
        <View style={[styles.sectionContainer, { backgroundColor: theme.colors.surface, flexDirection: 'row', alignItems: 'center' }]}>
            <Avatar.Icon 
                size={48} 
                icon="lightbulb-on-outline" 
                color={theme.colors.primary}
                style={{ backgroundColor: theme.colors.elevation.level2, marginRight: 16 }}
            />
            <View style={{ flex: 1 }}>
                <Text variant="labelLarge" style={{ color: theme.colors.secondary, marginBottom: 4 }}>Daily Tip</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Reduce sodium intake to lower pressure. Try herbs instead of salt!
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    sectionContainer: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
    },
});
