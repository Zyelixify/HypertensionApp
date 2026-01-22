import { Nord, nordDarkTheme, nordLightTheme } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';
import { useUnifiedData } from '@/hooks/useUnifiedData';
import { StorageService, UserProfile } from '@/services/StorageService';
import { calculateExtendedStats } from '@/utils/BloodPressure';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Card, ProgressBar, Text } from 'react-native-paper';

export default function ProfileScreen() {
    const { theme } = useThemeContext();
    const paperTheme = theme === 'dark' ? nordDarkTheme : nordLightTheme;
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

            <View style={{ alignItems: 'center', paddingVertical: 32, backgroundColor: paperTheme.colors.surface }}>
                <View style={{ height: 16 }} />

                <Avatar.Text 
                    size={100} 
                    label={profile?.name?.substring(0, 2).toUpperCase() || "ME"} 
                    style={{ backgroundColor: paperTheme.colors.primary }} 
                />
                <Text variant="headlineMedium" style={{ fontWeight: 'bold', marginTop: 16 }}>
                    {profile?.name || "User"}
                </Text>
                <Text variant="bodyLarge" style={{ color: paperTheme.colors.secondary }}>
                    {profile?.age ? `${profile.age} Years Old` : "Age not set"}
                </Text>
            </View>

            <View style={{ padding: 16, gap: 16 }}>
                <Card style={{ backgroundColor: paperTheme.colors.elevation.level2 }}>
                    <Card.Content>
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
                            color={Nord.auroraGreen} 
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
                    </Card.Content>
                </Card>

                {/* Stats Grid */}
                <View style={{ flexDirection: 'row', gap: 16 }}>
                    {/* Streak Card */}
                    <Card style={{ flex: 1, backgroundColor: paperTheme.colors.elevation.level1 }}>
                        <Card.Content style={{ alignItems: 'center', paddingVertical: 16 }}>
                            <MaterialCommunityIcons name="fire" size={32} color={Nord.auroraRed} />
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
                        </Card.Content>
                    </Card>

                    {/* Healthy Streak Card */}
                    <Card style={{ flex: 1, backgroundColor: paperTheme.colors.elevation.level1 }}>
                        <Card.Content style={{ alignItems: 'center', paddingVertical: 16 }}>
                           <MaterialCommunityIcons name="heart-pulse" size={32} color={Nord.auroraGreen} />
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
                        </Card.Content>
                    </Card>
                </View>

                 {/* Badges Placeholder (Future) */}
                 <Card style={{ backgroundColor: paperTheme.colors.elevation.level1, marginTop: 0 }}>
                     <Card.Title title="Achievements" left={(props) => <MaterialCommunityIcons {...props} color={Nord.auroraYellow} name="trophy" />} />
                     <Card.Content>
                         <Text variant="bodyMedium" style={{ color: paperTheme.colors.secondary, fontStyle: 'italic' }}>
                             Coming soon...
                         </Text>
                     </Card.Content>
                 </Card>

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
