import { useSession } from '@/context/SessionContext';
import { useThemeContext } from '@/context/ThemeContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { HealthService, PermissionStatus } from '@/services/HealthService';
import { NotificationService as NotifService } from '@/services/NotificationService';
import { BPReading, StorageService } from '@/services/StorageService';
import { useQueryClient } from '@tanstack/react-query';
import { addDays } from 'date-fns';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, List, Switch } from 'react-native-paper';

export default function SettingsScreen() {
    const { theme, toggleTheme } = useThemeContext();
    const paperTheme = useAppTheme();
    const { resetOnboarding } = useSession();
    
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

    const generateMockData = async () => {
        try {
            const TARGET_READINGS = 60 + Math.floor(Math.random() * 40); // Between 60 and 100 readings
            const newReadings: Omit<BPReading, 'id'>[] = [];
            
            // Start from yesterday to go backwards
            let currentDate = addDays(new Date(), -1);
            
            while (newReadings.length < TARGET_READINGS) {
                // 5% chance to skip this day entirely
                if (Math.random() > 0.05) {
                    const rand = Math.random();
                    let sys = 0, dia = 0;
                    if (rand < 0.50) { // 50% Normal
                        sys = Math.floor(Math.random() * (120 - 100) + 100);
                        dia = Math.floor(Math.random() * (80 - 65) + 65);
                    } else if (rand < 0.65) { // 15% Slightly Elevated
                        sys = Math.floor(Math.random() * (140 - 120) + 120);
                        dia = Math.floor(Math.random() * (90 - 80) + 80);
                    } else if (rand < 0.75) { // 10% Elevated
                        sys = Math.floor(Math.random() * (165 - 140) + 140);
                        dia = Math.floor(Math.random() * (110 - 90) + 90);
                    } else if (rand < 0.90) { // 15% Slightly Lower (Low Normal)
                        sys = Math.floor(Math.random() * (100 - 90) + 90);
                        dia = Math.floor(Math.random() * (65 - 60) + 60);
                    } else { // 10% Lower (Hypotension)
                        sys = Math.floor(Math.random() * (90 - 80) + 80);
                        dia = Math.floor(Math.random() * (60 - 50) + 50);
                    }

                    // Random time between 8am and 10pm
                    const hour = 8 + Math.floor(Math.random() * 14);
                    const minute = Math.floor(Math.random() * 60);
                    
                    const readingTime = new Date(currentDate);
                    readingTime.setHours(hour, minute, 0, 0);
                    
                    newReadings.push({
                        systolic: sys,
                        diastolic: dia,
                        timestamp: readingTime.getTime(),
                        source: 'manual',
                        note: 'Mock Data'
                    });
                }
                
                // Move backwards one day
                currentDate = addDays(currentDate, -1);
            }
            
            await StorageService.bulkAddReadings(newReadings);
            // Add XP for mock data (50 XP per reading)
            await StorageService.addXP(newReadings.length * 50);

            // Invalidate queries to refresh UI
            queryClient.invalidateQueries({ queryKey: ['bp', 'readings'] });
            queryClient.invalidateQueries({ queryKey: ['user', 'xp'] });

            Alert.alert("Debug", `Generated ${newReadings.length} mock readings.`);
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

            <List.Section>
                <List.Subheader style={{ color: paperTheme.colors.error, fontWeight: 'bold' }}>DEBUG</List.Subheader>

                <List.Item
                    title="Populate Mock Data"
                    description="Generate 60-100 random readings"
                    left={props => <List.Icon {...props} icon="database-plus" color={paperTheme.colors.error} />}
                    onPress={generateMockData}
                    style={{ backgroundColor: paperTheme.colors.surface }}
                />
                <List.Item
                    title="Test Notification"
                    description="Send immediate motivational reminder"
                    left={props => <List.Icon {...props} icon="bell-ring" color={paperTheme.colors.error} />}
                    onPress={() => NotifService.sendDemoMotivationalReminder()}
                    style={{ backgroundColor: paperTheme.colors.surface }}
                />
                <List.Item
                    title="Reset Onboarding"
                    description="Clear profile and restart setup"
                    left={props => <List.Icon {...props} icon="restart" color={paperTheme.colors.error} />}
                    onPress={async () => {
                        await resetOnboarding();
                    }}
                    style={{ backgroundColor: paperTheme.colors.surface }}
                />
                <List.Item
                    title="Clear All Data"
                    description="Remove all stored readings and reset progress"
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

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
