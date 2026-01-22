import { addDays, differenceInDays, isBefore, isSameDay, setHours, setMinutes } from 'date-fns';
import * as Notifications from 'expo-notifications';
import { BPReading, StorageService } from './StorageService';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const NotificationService = {
    async requestPermissions() {
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
    },

    async checkPermissions() {
        const { status } = await Notifications.getPermissionsAsync();
        return status === 'granted';
    },

    async scheduleReminder(title: string, body: string, trigger: Notifications.NotificationTriggerInput) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: true,
            },
            trigger,
        });
    },

    /**
     * Intelligently schedules upcoming notifications based on user activity.
     * Should be called on app launch and after adding a reading.
     */
    async planNotifications(readings: BPReading[], currentStreak: number) {
        // Sort by timestamp descending (newest first) to ensure we get the latest reading
        const sortedReadings = [...readings].sort((a, b) => b.timestamp - a.timestamp);

        // Cancel all existing to prevent overlap/outdated states
        await Notifications.cancelAllScheduledNotificationsAsync();

        const now = new Date();
        const lastReading = sortedReadings.length > 0 ? new Date(sortedReadings[0].timestamp) : null;

        // 1. New User (No readings)
        if (!lastReading) {
            await this.scheduleNotification(
                "Start Your Journey! 🩺",
                "Take your first blood pressure reading today to start tracking your health.",
                this.getTriggerDate(1, 9, 0) // Tomorrow 9 AM
            );
            await this.scheduleNotification(
                "Don't forget! 🩺",
                "Taking a reading takes less than a minute. Start today!",
                this.getTriggerDate(2, 18, 0) // Day after tomorrow 6 PM
            );
            return;
        }

        const isToday = isSameDay(lastReading, now);
        const daysSinceLast = differenceInDays(now, lastReading);

        // 2. Already posted today
        if (isToday) {
            // User is safe for today. Set up safety nets for tomorrow.

            // Warning for Tomorrow Evening (pre-emptive)
            await this.scheduleNotification(
                "Keep the streak alive! 🔥",
                `You're on a ${currentStreak} day streak! Add a reading today to keep it going.`,
                this.getTriggerDate(1, 18, 0) // Tomorrow 6 PM
            );

            // Recovery message for Day + 2 (if they miss tomorrow)
            await this.scheduleNotification(
                "You missed a day 📉",
                "Don't let your progress slip away. Add a reading today to recover!",
                this.getTriggerDate(2, 9, 0) // Day + 2, 9 AM
            );
            return;
        }

        // 3. Has not posted today (Last reading was yesterday or earlier)

        // If last reading was yesterday (Streak active but at risk today)
        if (daysSinceLast === 0 || (daysSinceLast === 1 && !isSameDay(lastReading, now))) {
            const eveningCutoff = setMinutes(setHours(now, 17), 0);

            // If it's before 5 PM, schedule a reminder for 6 PM TODAY
            if (isBefore(now, eveningCutoff)) {
                const todaySixPM = setMinutes(setHours(now, 18), 0);
                await this.scheduleNotification(
                    "Streak ending soon! ⏳",
                    `Only a few hours left to maintain your ${currentStreak} day streak!`,
                    todaySixPM
                );
            }
            // If it's after 5 PM, the user is likely in the app now (since this function is running).
            // We don't spam them immediately. Check "Streak Lost" fallback.

            // Schedule "Streak Lost" for tomorrow morning
            await this.scheduleNotification(
                "Streak Lost 😢",
                "You missed yesterday. Start a new streak today!",
                this.getTriggerDate(1, 9, 0)
            );
            return;
        }

        // 4. Inactive / Streak Lost (Last reading > 1 day ago)
        if (daysSinceLast > 1) {
            await this.scheduleNotification(
                "We miss you! 👋",
                "It's been a few days. Tracking your BP is important for your health. Come back and take a reading today!",
                this.getTriggerDate(1, 9, 0) // Tomorrow 9 AM
            );
        }
    },

    async sendImmediateStreakNotification(streak: number) {
        const now = new Date();
        const lastCongratTimestamp = await StorageService.getLastCongratDate();

        // Check if we already sent one today to avoid spamming multiple readings
        if (lastCongratTimestamp) {
            const lastCongrat = new Date(lastCongratTimestamp);
            if (isSameDay(lastCongrat, now)) {
                return;
            }
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Great Job! 🎉",
                body: `Reading recorded! You're on a ${streak} day streak! Keep it up!`,
            },
            trigger: null, // Send immediately
        });

        await StorageService.setLastCongratDate(now.getTime());
    },

    async sendDemoMotivationalReminder() {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Keep it up! 💪",
                body: "You've been tracking for 3 days in a row! Keep going!",
            },
            trigger: null,
        });
    },

    getTriggerDate(daysFromNow: number, hour: number, minute: number) {
        let date = addDays(new Date(), daysFromNow);
        date = setHours(date, hour);
        date = setMinutes(date, minute);
        date.setSeconds(0);
        return date;
    },

    async scheduleNotification(title: string, body: string, trigger: Date | Notifications.NotificationTriggerInput) {
        if (trigger instanceof Date) {
            const seconds = Math.floor((trigger.getTime() - Date.now()) / 1000);

            if (seconds <= 0) {
                await Notifications.scheduleNotificationAsync({
                    content: { title, body, sound: true },
                    trigger: null,
                });
                return;
            }

            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                    seconds: seconds,
                    repeats: false,
                },
            });
        } else {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    sound: true,
                },
                trigger,
            });
        }
    }
};
