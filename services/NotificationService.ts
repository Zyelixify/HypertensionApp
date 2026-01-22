import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
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

    async scheduleDailyTips() {
        // Cancel all before scheduling to avoid duplicates in demo
        await Notifications.cancelAllScheduledNotificationsAsync();
        
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Hypertension Check-in 🩺",
                body: "Take a moment to measure your blood pressure. Consistency is key!",
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: 9,
                minute: 0,
            }
        });
    },
    
    async sendMotivationalReminder() {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Keep it up! 💪",
                body: "You've been tracking for 3 days in a row!",
            },
            trigger: null,
        });
    }
};
