import { HealthService } from '@/services/HealthService';
import { BPReading, StorageService } from '@/services/StorageService';
import { calculateStreak } from '@/utils/BloodPressure';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useUnifiedData() {
    const queryClient = useQueryClient();

    const readings = useQuery<BPReading[]>({
        queryKey: ['bp', 'readings'],
        queryFn: async () => {
            // 1. Always get local data
            const local = await StorageService.getReadings();

            // 2. Determine if we should sync with Health Connect
            const lastSync = await StorageService.getLastSyncTime();
            const now = Date.now();
            const shouldSync = (now - lastSync) > 5000;

            let healthReadings: BPReading[] = [];

            if (shouldSync) {
                try {
                    healthReadings = await HealthService.getBloodPressure();
                    // Sync successful? Update cache and timestamp
                    await StorageService.setCachedHealthReadings(healthReadings);
                    await StorageService.setLastSyncTime(now);
                } catch (e) {
                    console.warn("Health sync failed, using cache", e);
                    healthReadings = await StorageService.getCachedHealthReadings();
                }
            } else {
                console.log("Skipping Health Sync (Debounced 5s)");
                healthReadings = await StorageService.getCachedHealthReadings();
            }

            // Deduplicate: If we have a local reading with roughly the same timestamp (+- 1000ms), prefer local
            const uniqueHealthReadings = healthReadings.filter((h) => {
                // Check if any local reading is within 1s of this health reading
                const isDuplicate = local.some((l) => Math.abs(l.timestamp - h.timestamp) < 1000);
                return !isDuplicate;
            });

            return [...local, ...uniqueHealthReadings].sort((a, b) => a.timestamp - b.timestamp);
        },
        staleTime: 1000 * 60, // Keep 60s cache in React Query too
        refetchOnWindowFocus: false,
        refetchOnMount: false
    });

    const xp = useQuery({
        queryKey: ['user', 'xp'],
        queryFn: () => StorageService.getXP(),
    });

    const add = useMutation({
        mutationFn: async (reading: { systolic: number, diastolic: number, timestamp: number }) => {
            // Save locally
            const saved = await StorageService.addReading({
                ...reading,
                source: 'manual'
            });

            // Add XP
            await StorageService.addXP(50);

            // Try sync to Health Connect
            // Disabled in during development to not create fake readings
            // await HealthService.writeBloodPressure(reading.systolic, reading.diastolic, reading.timestamp);

            return saved;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bp', 'readings'] });
            queryClient.invalidateQueries({ queryKey: ['user', 'xp'] });
        }
    });

    const streak = calculateStreak(readings.data || []);

    // Level calculation (Simple linear leveling: Level = floor(XP / 500) + 1)
    const currentXP = xp.data || 0;
    const level = Math.floor(currentXP / 500) + 1;
    const nextLevelXP = level * 500;
    const progressToNextLevel = (currentXP % 500) / 500;

    return {
        bp: {
            readings,
            add,
            streak
        },
        gamification: {
            xp: currentXP,
            level,
            progress: progressToNextLevel,
            nextLevelXP
        }
    };
}
