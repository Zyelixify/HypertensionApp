import { useThemeContext } from '@/context/ThemeContext';
import { HealthService, PermissionStatus } from '@/services/HealthService';
import { NotificationService as NotifService } from '@/services/NotificationService';
import { StorageService } from '@/services/StorageService';
import { useQueryClient } from '@tanstack/react-query';
import { addDays, setHours, startOfWeek, subWeeks } from 'date-fns';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { Button, List, Switch, useTheme } from 'react-native-paper';

export default function SettingsScreen() {
    const { theme, toggleTheme } = useThemeContext();
    const paperTheme = useTheme();
    
    // Permission states
    const [healthGranted, setHealthGranted] = useState(false);
    const [healthDetails, setHealthDetails] = useState<PermissionStatus[]>([]);
    const [notifGranted, setNotifGranted] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const router = useRouter();
    const queryClient = useQueryClient();

    const checkPerms = async () => {
        const h = await HealthService.checkPermissions();
        setHealthGranted(h);
        const details = await HealthService.checkDetailedPermissions();
        setHealthDetails(details);
        
        console.log("Checking Notif perms...", NotifService);
        if (NotifService) {
            const n = await NotifService.checkPermissions();
            setNotifGranted(n);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            checkPerms();
        }, [])
    );

    const requestHealth = async () => {
        await HealthService.requestPermissions();
        checkPerms();
    };

    const requestNotif = async () => {
        await NotifService.requestPermissions();
        checkPerms();
    };
    
    const openSettings = () => {
        Linking.openSettings()
    }

    const generateMockData = async () => {
        try {
            const now = new Date();
            const startStr = startOfWeek(subWeeks(now, 1), { weekStartsOn: 0 });
            // 2 weeks of data
            const daysToGenerate = 14; 
            
            const newReadings: any[] = [];
            
            for (let i = 0; i < daysToGenerate; i++) {
                const day = addDays(startStr, i);
                if (day > now) continue;


                // Number of readings per day: 1-2
                const numReadings = Math.round(Math.random()) + 1; 

                for (let j = 0; j < numReadings; j++) {
                    const hour = 8 + Math.floor(Math.random() * 12);
                    const readingTime = setHours(day, hour).getTime();
                    
                    // Random BP: skewed towards normal (90-125) but with some elevated (125-150)
                    const isNormal = Math.random() > 0.3; // 70% chance of normal-ish range
                    
                    let sys, dia;
                    if (isNormal) {
                        sys = Math.floor(Math.random() * (125 - 95) + 95);
                        dia = Math.floor(Math.random() * (82 - 60) + 60);
                    } else {
                         sys = Math.floor(Math.random() * (155 - 120) + 120);
                         dia = Math.floor(Math.random() * (95 - 75) + 75);
                    }
                    
                    newReadings.push({
                        systolic: sys,
                        diastolic: dia,
                        timestamp: readingTime,
                        source: 'manual',
                        note: 'Debug Data'
                    });
                }
            }
            
            await StorageService.bulkAddReadings(newReadings);
            // Add XP for mock data (50 XP per reading)
            await StorageService.addXP(newReadings.length * 50);

            // Invalidate queries to refresh UI
            queryClient.invalidateQueries({ queryKey: ['bp', 'readings'] });
            queryClient.invalidateQueries({ queryKey: ['user', 'xp'] });

            Alert.alert("Debug", `Added ${newReadings.length} mock readings and ${newReadings.length * 50} XP.`);
        } catch (e) {
            Alert.alert("Error", "Failed to generate data");
            console.error(e);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={{ height: 4 }} />
            
            <List.Section>
                <List.Subheader style={{ color: paperTheme.colors.secondary, fontWeight: 'bold' }}>APPEARANCE</List.Subheader>
                <List.Item
                    title="Dark Theme"
                    titleStyle={{ color: paperTheme.colors.onSurface }}
                    left={props => <List.Icon {...props} icon="theme-light-dark" color={paperTheme.colors.onSurface} />}
                    right={() => <Switch value={theme === 'dark'} onValueChange={toggleTheme} color={paperTheme.colors.primary} />}
                    style={{ backgroundColor: paperTheme.colors.surface }}
                />
            </List.Section>
            
            <List.Section>
                <List.Subheader style={{ color: paperTheme.colors.primary, fontWeight: 'bold' }}>PERMISSIONS</List.Subheader>
                
                <List.Accordion
                    title="Health Connect"
                    titleStyle={{ color: paperTheme.colors.onSurface }}
                    description={healthGranted ? "Access granted" : "Tap to view details"}
                    descriptionStyle={{ color: paperTheme.colors.onSurfaceVariant }}
                    left={props => <List.Icon {...props} icon="heart-pulse" color={paperTheme.colors.onSurface} />}
                    expanded={expanded}
                    onPress={() => setExpanded(!expanded)}
                    style={{ backgroundColor: paperTheme.colors.surface, marginBottom: 1 }}
                >
                    {healthDetails.map((perm, index) => (
                        <List.Item 
                            key={index}
                            title={`${perm.recordType}`}
                            description={perm.accessType.toUpperCase()}
                            descriptionStyle={{ fontSize: 10, color: paperTheme.colors.onSurfaceVariant }}
                            right={props => <List.Icon {...props} icon={perm.granted ? "check-circle" : "alert-circle"} color={perm.granted ? paperTheme.custom.success : paperTheme.colors.error} />}
                            style={{ backgroundColor: paperTheme.colors.surface, paddingLeft: 16 }}
                        />
                    ))}
                    {!healthGranted && (
                        <View style={{ padding: 16, backgroundColor: paperTheme.colors.surface }}>
                            <Button onPress={requestHealth} mode="contained-tonal">Grant All Permissions</Button>
                        </View>
                    )}
                </List.Accordion>

                <List.Item
                    title="Notifications"
                    titleStyle={{ color: paperTheme.colors.onSurface }}
                    description={notifGranted ? "Access granted" : "For reminders and tips"}
                    descriptionStyle={{ color: paperTheme.colors.onSurfaceVariant }}
                    left={props => <List.Icon {...props} icon="bell" color={paperTheme.colors.onSurface} />}
                    right={props => notifGranted 
                        ? <List.Icon {...props} icon="check-circle" color={paperTheme.custom.success} />
                        : <Button onPress={requestNotif} mode="contained-tonal">Grant</Button>
                    }
                    style={{ backgroundColor: paperTheme.colors.surface }}
                />
            </List.Section>

            {__DEV__ && (
                <List.Section>
                    <List.Subheader style={{ color: paperTheme.colors.error, fontWeight: 'bold' }}>DEBUG</List.Subheader>
                    <List.Item
                        title="Populate Mock Data"
                        description="Random data for last 2 weeks"
                        left={props => <List.Icon {...props} icon="database-plus" color={paperTheme.colors.error} />}
                        onPress={generateMockData}
                        style={{ backgroundColor: paperTheme.colors.surface }}
                    />
                    <List.Item
                        title="Test Notification"
                        description="Send immediate motivational reminder"
                        left={props => <List.Icon {...props} icon="bell-ring" color={paperTheme.colors.error} />}
                        onPress={() => NotifService.sendMotivationalReminder()}
                        style={{ backgroundColor: paperTheme.colors.surface }}
                    />
                    <List.Item
                        title="Reset Onboarding"
                        description="Clear profile and restart setup"
                        left={props => <List.Icon {...props} icon="restart" color={paperTheme.colors.error} />}
                        onPress={async () => {
                            await StorageService.clearUserProfile();
                            router.replace('/onboarding');
                        }}
                        style={{ backgroundColor: paperTheme.colors.surface }}
                    />
                    <List.Item
                        title="Clear All Data"
                        left={props => <List.Icon {...props} icon="database-remove" color={paperTheme.colors.error} />}
                        onPress={async () => {
                            await StorageService.clearReadings();
                            queryClient.invalidateQueries({ queryKey: ['bp', 'readings'] });
                            queryClient.invalidateQueries({ queryKey: ['user', 'xp'] });
                            Alert.alert("Cleared", "All data removed.");
                        }}
                        style={{ backgroundColor: paperTheme.colors.surface }}
                    />
                </List.Section>
            )}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
