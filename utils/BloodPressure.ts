import { Nord } from '@/constants/Colors';
import { BPReading } from '@/services/StorageService';
import { differenceInCalendarDays, startOfDay } from 'date-fns';

// Standard Clinical Cutoffs (approximate)
const SYS_STAGE2 = 140;
const DIA_STAGE2 = 90;

const SYS_ELEVATED = 120;
const DIA_ELEVATED = 80;

const SYS_LOW_WARNING = 100; // "Low Normal"
const DIA_LOW_WARNING = 65;

const SYS_HYPOTENSION = 90;
const DIA_HYPOTENSION = 60;

export type BPStatus = 'Lower' | 'Slightly Lower' | 'Normal' | 'Slightly Elevated' | 'Elevated';
export type BPAnalysis = {
    status: BPStatus;
    color: string;
};

export const analyzeBP = (systolic: number, diastolic: number): BPAnalysis => {
    if (systolic >= SYS_STAGE2 || diastolic >= DIA_STAGE2) {
        return { status: 'Elevated', color: Nord.auroraRed };
    }

    if (systolic >= SYS_ELEVATED || diastolic >= DIA_ELEVATED) {
        return { status: 'Slightly Elevated', color: Nord.auroraOrange };
    }

    if (systolic < SYS_HYPOTENSION || diastolic < DIA_HYPOTENSION) {
        return { status: 'Lower', color: Nord.frost3 };
    }

    if (systolic < SYS_LOW_WARNING || diastolic < DIA_LOW_WARNING) {
        return { status: 'Slightly Lower', color: Nord.frost2 };
    }

    return { status: 'Normal', color: Nord.auroraGreen };
};

export const calculateStreak = (readings: BPReading[]): number => {
    if (!readings.length) return 0;

    // Sort descending by timestamp just in case
    const sorted = [...readings].sort((a, b) => b.timestamp - a.timestamp);

    // Get unique days (timestamps)
    const uniqueDays = new Set<string>();
    const dayTimestamps: number[] = [];

    for (const r of sorted) {
        const dayStr = startOfDay(new Date(r.timestamp)).toISOString();
        if (!uniqueDays.has(dayStr)) {
            uniqueDays.add(dayStr);
            dayTimestamps.push(startOfDay(new Date(r.timestamp)).getTime());
        }
    }

    if (dayTimestamps.length === 0) return 0;

    let streak = 0;
    const today = startOfDay(new Date());

    // Check if the most recent reading is today or yesterday
    const lastReadingDate = new Date(dayTimestamps[0]);
    const diff = differenceInCalendarDays(today, lastReadingDate);

    // If the last reading was more than 1 day ago (i.e., not today and not yesterday), the streak is broken
    if (diff > 1) {
        return 0;
    }

    // We already know the first one is valid (either today or yesterday)
    streak = 1;
    let currentDate = lastReadingDate;

    for (let i = 1; i < dayTimestamps.length; i++) {
        const prevDate = new Date(dayTimestamps[i]);
        const gap = differenceInCalendarDays(currentDate, prevDate);

        if (gap === 1) {
            streak++;
            currentDate = prevDate;
        } else {
            break;
        }
    }

    return streak;
};

export type BPStats = {
    currentStreak: number;
    bestStreak: number;
    currentHealthyStreak: number;
    bestHealthyStreak: number;
};

export const calculateExtendedStats = (readings: BPReading[]): BPStats => {
    if (!readings.length) return { currentStreak: 0, bestStreak: 0, currentHealthyStreak: 0, bestHealthyStreak: 0 };

    // Sort descending by timestamp
    const sorted = [...readings].sort((a, b) => b.timestamp - a.timestamp);

    // Process days
    // To match chart logic, we must average the days readings first, then analyze the average.
    // Otherwise a single slightly elevated reading destroys the streak even if the daily average is normal.
    // 1. Group readings by day
    const readingsByDay = new Map<string, { totalSys: number, totalDia: number, count: number }>();

    for (const r of sorted) {
        const dayStr = startOfDay(new Date(r.timestamp)).toISOString();
        if (!readingsByDay.has(dayStr)) {
            readingsByDay.set(dayStr, { totalSys: 0, totalDia: 0, count: 0 });
        }
        const entry = readingsByDay.get(dayStr)!;
        entry.totalSys += r.systolic;
        entry.totalDia += r.diastolic;
        entry.count += 1;
    }

    // 2. Analyze daily averages
    const days = Array.from(readingsByDay.keys()).map(dayStr => {
        const entry = readingsByDay.get(dayStr)!;
        const avgSys = entry.totalSys / entry.count;
        const avgDia = entry.totalDia / entry.count;
        const analysis = analyzeBP(avgSys, avgDia);

        // A day is "Healthy" if it's Normal, Lower, or Slightly Lower.
        // Elevated or Slightly Elevated breaks the streak.
        const isHealthy = analysis.status !== 'Elevated' && analysis.status !== 'Slightly Elevated';

        return {
            date: new Date(dayStr),
            isHealthy
        };
    }).sort((a, b) => b.date.getTime() - a.date.getTime()); // Descending


    if (days.length === 0) return { currentStreak: 0, bestStreak: 0, currentHealthyStreak: 0, bestHealthyStreak: 0 };

    // --- General Streak (Any log) ---
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Check if current streak is active (today or yesterday)
    const today = startOfDay(new Date());
    const lastLog = days[0].date;
    const diff = differenceInCalendarDays(today, lastLog);

    // PASS 1: Best Streak
    // We iterate through days. Since they are continuous blocks (we have the sparse list of days),
    // We check gap between days[i] and days[i+1].

    tempStreak = 1;
    bestStreak = 1;

    for (let i = 0; i < days.length - 1; i++) {
        const curr = days[i].date;
        const next = days[i + 1].date; // strictly older
        const gap = differenceInCalendarDays(curr, next);

        if (gap === 1) {
            tempStreak++;
        } else {
            if (tempStreak > bestStreak) bestStreak = tempStreak;
            tempStreak = 1;
        }
    }
    if (tempStreak > bestStreak) bestStreak = tempStreak;

    // Current Streak logic (matches existing function but re-verified)
    if (diff <= 1) {
        currentStreak = 1;
        for (let i = 0; i < days.length - 1; i++) {
            const curr = days[i].date;
            const next = days[i + 1].date;
            if (differenceInCalendarDays(curr, next) === 1) {
                currentStreak++;
            } else {
                break;
            }
        }
    }

    // --- Healthy Streak ---
    let currentHealthyStreak = 0;
    let bestHealthyStreak = 0;
    let tempHealthyStreak = 0;

    // Filter to only healthy days for calculation? 
    // No, streaks break if you miss a day OR if you have a bad day.
    // Wait, usually "Healthy Streak" implies "Consecutive days of healthy readings".
    // If you don't log, does it break? Yes.
    // If you log unhealthy, does it break? Yes.

    // So we iterate the *same* days array.

    // Best Healthy
    tempHealthyStreak = days[0].isHealthy ? 1 : 0;
    bestHealthyStreak = tempHealthyStreak;

    for (let i = 0; i < days.length - 1; i++) {
        const currDay = days[i];
        const nextDay = days[i + 1];
        const gap = differenceInCalendarDays(currDay.date, nextDay.date);

        if (gap === 1 && currDay.isHealthy && nextDay.isHealthy) { // Consecutive AND both healthy
            tempHealthyStreak++;
        } else if (gap === 1 && !nextDay.isHealthy) { // Consecutive but next is unhealthy -> break
            if (tempHealthyStreak > bestHealthyStreak) bestHealthyStreak = tempHealthyStreak;
            tempHealthyStreak = 0; // Reset
        } else if (gap > 1) { // Gap -> break
            if (tempHealthyStreak > bestHealthyStreak) bestHealthyStreak = tempHealthyStreak;
            // Start new streak if next day is healthy
            tempHealthyStreak = nextDay.isHealthy ? 1 : 0;
        } else {
            // Case: currDay not healthy. Streak is 0.
            if (tempHealthyStreak > bestHealthyStreak) bestHealthyStreak = tempHealthyStreak;
            tempHealthyStreak = nextDay.isHealthy ? 1 : 0;
        }
    }
    if (tempHealthyStreak > bestHealthyStreak) bestHealthyStreak = tempHealthyStreak;

    // Current Healthy
    if (diff <= 1 && days[0].isHealthy) {
        currentHealthyStreak = 1;
        for (let i = 0; i < days.length - 1; i++) {
            const curr = days[i];
            const next = days[i + 1];
            if (differenceInCalendarDays(curr.date, next.date) === 1 && next.isHealthy) {
                currentHealthyStreak++;
            } else {
                break;
            }
        }
    }

    return { currentStreak, bestStreak, currentHealthyStreak, bestHealthyStreak };
};

