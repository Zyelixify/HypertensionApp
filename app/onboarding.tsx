import { Nord, nordDarkTheme, nordLightTheme } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';
import { HealthService } from '@/services/HealthService';
import { NotificationService } from '@/services/NotificationService';
import { StorageService } from '@/services/StorageService';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Switch, Text, TextInput } from 'react-native-paper';
import Animated, {
    FadeInDown,
    FadeOutLeft,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

export default function OnboardingScreen() {
    const router = useRouter();
    const { theme } = useThemeContext();
    const paperTheme = theme === 'dark' ? nordDarkTheme : nordLightTheme;

    const [step, setStep] = useState(0); // 0: Welcome, 1: Profile, 2: Permissions
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    
    // Permission Toggles
    const [healthPerm, setHealthPerm] = useState(false);
    const [notifPerm, setNotifPerm] = useState(false);

    // Animations
    const progress = useSharedValue(0.33);

    const handleNext = async () => {
        if (step === 0) {
            setStep(1);
            progress.value = withTiming(0.66);
        } else if (step === 1) {
            if (!name || !age) return;
            setStep(2);
            progress.value = withTiming(1.0);
        } else {
            // Finish
            await finishOnboarding();
        }
    };

    const finishOnboarding = async () => {
        // Save Profile
        await StorageService.saveUserProfile({
            name,
            age,
            onboardingComplete: true
        });

        // Request Permissions based on toggle
        if (healthPerm) {
            try { await HealthService.requestPermissions(); } catch(e) { console.warn(e); }
        }
        if (notifPerm) {
             try { await NotificationService.requestPermissions(); } catch(e) { console.warn(e); }
        }

        router.replace('/(tabs)');
    };

    const renderWelcome = () => (
        <Animated.View entering={FadeInDown.delay(200)} exiting={FadeOutLeft} style={styles.slide}>
            <Text variant="displaySmall" style={{ fontWeight: 'bold', color: paperTheme.colors.primary, textAlign: 'center' }}>
                Welcome to HypertensionApp
            </Text>
            <Text variant="bodyLarge" style={{ textAlign: 'center', marginTop: 16, color: paperTheme.colors.onSurfaceVariant }}>
                Your personal companion for heart health tracking. {'\n'}Let's get you set up.
            </Text>
        </Animated.View>
    );

    const renderProfile = () => (
        <Animated.View entering={FadeInDown.delay(200)} exiting={FadeOutLeft} style={styles.slide}>
            <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: paperTheme.colors.primary, marginBottom: 24 }}>
                Tell us about you
            </Text>
            
            <TextInput
                label="Your Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
            />
            
            <TextInput
                label="Age"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
            />
            <HelperText type="info">This helps us personalize your experience.</HelperText>
        </Animated.View>
    );

    const renderPermissions = () => (
        <Animated.View entering={FadeInDown.delay(200)} exiting={FadeOutLeft} style={styles.slide}>
             <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: paperTheme.colors.primary, marginBottom: 8 }}>
                Permissions
            </Text>
            <Text variant="bodyMedium" style={{ marginBottom: 24, color: paperTheme.colors.onSurfaceVariant }}>
                To work best, we need a few things. You decide.
            </Text>

            <View style={styles.permRow}>
                <View style={{ flex: 1 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Health Connect</Text>
                    <Text variant="bodySmall" style={{ color: paperTheme.colors.secondary }}>Sync blood pressure readings automatically.</Text>
                </View>
                <Switch value={healthPerm} onValueChange={setHealthPerm} color={Nord.auroraGreen} />
            </View>

            <View style={styles.permRow}>
                <View style={{ flex: 1 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Notifications</Text>
                    <Text variant="bodySmall" style={{ color: paperTheme.colors.secondary }}>Reminders to log your BP.</Text>
                </View>
                <Switch value={notifPerm} onValueChange={setNotifPerm} color={Nord.auroraGreen} />
            </View>
        </Animated.View>
    );

    const progressStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
    }));

    return (
        <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
            {/* Safe Area Top Spacer */}
            <View style={{ height: 60 }} />

            {/* Progress Bar */}
            <View style={{ height: 4, backgroundColor: paperTheme.colors.elevation.level2, marginHorizontal: 24, borderRadius: 2, overflow: 'hidden' }}>
                 <Animated.View style={[{ height: '100%', backgroundColor: Nord.auroraGreen }, progressStyle]} />
            </View>

            <View style={styles.content}>
                {step === 0 && renderWelcome()}
                {step === 1 && renderProfile()}
                {step === 2 && renderPermissions()}
            </View>

            <View style={styles.footer}>
                <Button 
                    mode="contained" 
                    onPress={handleNext} 
                    contentStyle={{ height: 56 }}
                    labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
                    style={{ borderRadius: 28 }}
                    disabled={step === 1 && (!name || !age)}
                >
                    {step === 2 ? "Get Started" : "Continue"}
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    slide: {
        width: '100%',
    },
    footer: {
        padding: 24,
        paddingBottom: 48,
    },
    input: {
        marginBottom: 16,
    },
    permRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 12,
        marginBottom: 16,
    }
});
