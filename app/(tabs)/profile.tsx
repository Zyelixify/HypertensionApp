import { useAppTheme } from '@/hooks/useAppTheme';
import { useUnifiedData } from '@/hooks/useUnifiedData';
import { StorageService, UserProfile } from '@/services/StorageService';
import { calculateExtendedStats } from '@/utils/BloodPressure';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, ProgressBar, Text } from 'react-native-paper';

export default function ProfileScreen() {
    const paperTheme = useAppTheme();
    const { gamification, bp } = useUnifiedData();
    const { readings } = bp;
    
    // Local state for profile (since it's not in UnifiedData hook yet)
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useFocusEffect(
        useCallback(() => {
            StorageService.getUserProfile().then(setProfile);
        }, [])
    );

    const stats = useMemo(() => calculateExtendedStats(readings.data || []), [readings.data]);

    return (
        <ScrollView style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>

            <View style={{ alignItems: 'center', paddingVertical: 16, backgroundColor: paperTheme.colors.surface, borderBottomWidth: 1, borderBottomColor: paperTheme.colors.outlineVariant }}>
                <View style={{ height: 32 }} />

                <Avatar.Text 
                    size={100} 
                    label={profile?.name?.substring(0, 2).toUpperCase() || "ME"} 
                    style={{ backgroundColor: paperTheme.colors.primary }} 
                />
                <Text variant="headlineMedium" style={{ fontWeight: 'bold', marginTop: 16, color: paperTheme.colors.onSurface }}>
                    {profile?.name || "User"}
                </Text>
                <Text variant="bodyLarge" style={{ color: paperTheme.colors.secondary }}>
                    {profile?.age ? `${profile.age} Years Old` : "Age not set"}
                </Text>
            </View>

            <View style={{ padding: 16, gap: 16 }}>
                <View style={[styles.card, { backgroundColor: paperTheme.colors.surface, borderColor: paperTheme.colors.outlineVariant }]}>
                    <View style={{ padding: 16 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Current Level</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-end'}}>
                                <Text variant="displayMedium" style={{ fontWeight: 'bold', color: paperTheme.colors.primary, lineHeight: 40 }}>
                                    {gamification.level}
                                </Text>
                            </View>
                        </View>
                        
                        <ProgressBar 
                            progress={gamification.progress} 
                            color={paperTheme.custom.success} 
                            style={{ height: 12, borderRadius: 6, backgroundColor: paperTheme.colors.surfaceVariant }} 
                        />
                        
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                            <Text variant="labelMedium" style={{ color: paperTheme.colors.secondary }}>
                                {gamification.xp} XP
                            </Text>
                            <Text variant="labelMedium" style={{ color: paperTheme.colors.secondary }}>
                                {gamification.nextLevelXP} XP (Next Lvl)
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={{ flexDirection: 'row', gap: 16 }}>
                    {/* Streak Card */}
                    <View style={[styles.card, { flex: 1, backgroundColor: paperTheme.colors.surface, borderColor: paperTheme.colors.outlineVariant }]}>
                        <View style={{ alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 }}>
                            <MaterialCommunityIcons name="fire" size={32} color={paperTheme.colors.error} />
                            <Text variant="titleMedium" style={{ marginTop: 8, fontWeight: 'bold' }}>Streak</Text>
                            
                            <View style={{ alignItems: 'center', marginTop: 12 }}>
                                <Text variant="displaySmall" style={{ fontWeight: 'bold', color: paperTheme.colors.onSurface }}>
                                    {stats.currentStreak}
                                </Text>
                                <Text variant="bodySmall" style={{ color: paperTheme.colors.secondary }}>Current</Text>
                            </View>

                            <View style={{ height: 1, width: '80%', backgroundColor: paperTheme.colors.outlineVariant, marginVertical: 12 }} />

                            <View style={{ alignItems: 'center' }}>
                                <Text variant="titleLarge" style={{ fontWeight: 'bold', color: paperTheme.colors.secondary }}>
                                    {stats.bestStreak}
                                </Text>
                                <Text variant="bodySmall" style={{ color: paperTheme.colors.secondary }}>Best</Text>
                            </View>
                        </View>
                    </View>

                    {/* Healthy Streak Card */}
                    <View style={[styles.card, { flex: 1, backgroundColor: paperTheme.colors.surface, borderColor: paperTheme.colors.outlineVariant }]}>
                        <View style={{ alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 }}>
                           <MaterialCommunityIcons name="heart-pulse" size={32} color={paperTheme.custom.success} />
                            <Text variant="titleMedium" style={{ marginTop: 8, fontWeight: 'bold' }}>Healthy Streak</Text>
                            
                            <View style={{ alignItems: 'center', marginTop: 12 }}>
                                <Text variant="displaySmall" style={{ fontWeight: 'bold', color: paperTheme.colors.onSurface }}>
                                    {stats.currentHealthyStreak}
                                </Text>
                                <Text variant="bodySmall" style={{ color: paperTheme.colors.secondary }}>Current</Text>
                            </View>

                             <View style={{ height: 1, width: '80%', backgroundColor: paperTheme.colors.outlineVariant, marginVertical: 12 }} />

                            <View style={{ alignItems: 'center' }}>
                                <Text variant="titleLarge" style={{ fontWeight: 'bold', color: paperTheme.colors.secondary }}>
                                    {stats.bestHealthyStreak}
                                </Text>
                                <Text variant="bodySmall" style={{ color: paperTheme.colors.secondary }}>Best</Text>
                            </View>
                        </View>
                    </View>
                </View>

                 {/* Badges Placeholder (Future) */}
                 <View style={[styles.card, { backgroundColor: paperTheme.colors.surface, borderColor: paperTheme.colors.outlineVariant }]}>
                     <View style={{ padding: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                             <MaterialCommunityIcons size={24} color={paperTheme.custom.warning} name="trophy" style={{marginRight: 16}} />
                             <Text variant="titleMedium">Achievements</Text>
                        </View>
                         <Text variant="bodyMedium" style={{ color: paperTheme.colors.secondary, fontStyle: 'italic', paddingLeft: 40 }}>
                             Coming soon...
                         </Text>
                     </View>
                 </View>

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    card: {
        marginBottom: 8,
        borderRadius: 16,
        borderWidth: 1,
    }
});
