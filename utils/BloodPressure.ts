import { Nord } from '@/constants/Colors';
import { BPReading } from '@/services/StorageService';
import { differenceInCalendarDays, startOfDay } from 'date-fns';

// Margin of 10 separates "Warning" zones from "Clinical" zones nicely
const MARGIN = 10; 

// Standard AHA/ESC Cutoffs
const SYSTOLIC_HIGH = 120;  // >120 is Elevated
const DIASTOLIC_HIGH = 80;  // >80 is Hypertension Stage 1
const SYSTOLIC_LOW = 90;    // <90 is Hypotension
const DIASTOLIC_LOW = 60;   // <60 is Hypotension

export type BPStatus = 'Lower' | 'Slightly Lower' | 'Normal' | 'Slightly Elevated' | 'Elevated';
export type BPAnalysis = {
    status: BPStatus;
    color: string;
};

export const analyzeBP = (systolic: number, diastolic: number): BPAnalysis => {
    // Check Elevated
    if (systolic >= SYSTOLIC_HIGH + MARGIN || diastolic >= DIASTOLIC_HIGH + MARGIN) {
        return { status: 'Elevated', color: Nord.auroraRed };
    }
    if (systolic >= SYSTOLIC_HIGH || diastolic >= DIASTOLIC_HIGH) {
        return { status: 'Slightly Elevated', color: Nord.auroraOrange};
    }

    // Check Lower
    if (systolic <= SYSTOLIC_LOW - MARGIN || diastolic <= DIASTOLIC_LOW - MARGIN) {
        return { status: 'Lower', color: Nord.frost3 };
    }
    if (systolic <= SYSTOLIC_LOW || diastolic <= DIASTOLIC_LOW) {
        return { status: 'Slightly Lower', color: Nord.frost2 };
    }

    // Normal
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
    
    const dayMap = new Map<string, { isHealthy: boolean }>();
    
    // Process days
    for (const r of sorted) {
        const dayStr = startOfDay(new Date(r.timestamp)).toISOString();
        const analysis = analyzeBP(r.systolic, r.diastolic);
        // A day is healthy if it has NO Elevated readings.
        // Initialize day as healthy if not seen
        if (!dayMap.has(dayStr)) {
            dayMap.set(dayStr, { isHealthy: true });
        }
        
        // If any reading is elevated, mark day as unhealthy
        if (analysis.status === 'Elevated' || analysis.status === 'Slightly Elevated') {
            dayMap.get(dayStr)!.isHealthy = false;
        }
    }
    
    const days = Array.from(dayMap.keys())
        .map(d => ({ date: new Date(d), ...dayMap.get(d)! }))
        .sort((a, b) => b.date.getTime() - a.date.getTime()); // Descending
        
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
        const next = days[i+1].date; // strictly older
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
             const next = days[i+1].date;
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
    let tempHealthyArgs = 0;

    // Filter to only healthy days for calculation? 
    // No, streaks break if you miss a day OR if you have a bad day.
    // Wait, usually "Healthy Streak" implies "Consecutive days of healthy readings".
    // If you don't log, does it break? Yes.
    // If you log unhealthy, does it break? Yes.
    
    // So we iterate the *same* days array.
    
    // Best Healthy
    tempHealthyArgs = days[0].isHealthy ? 1 : 0;
    bestHealthyStreak = tempHealthyArgs;
    
    for (let i = 0; i < days.length - 1; i++) {
        const currDay = days[i];
        const nextDay = days[i+1];
        const gap = differenceInCalendarDays(currDay.date, nextDay.date);

        if (gap === 1 && currDay.isHealthy && nextDay.isHealthy) { // Consecutive AND both healthy
             tempHealthyArgs++; 
        } else if (gap === 1 && !nextDay.isHealthy) { // Consecutive but next is unhealthy -> break
             if (tempHealthyArgs > bestHealthyStreak) bestHealthyStreak = tempHealthyArgs;
             tempHealthyArgs = 0; // Reset
        } else if (gap > 1) { // Gap -> break
             if (tempHealthyArgs > bestHealthyStreak) bestHealthyStreak = tempHealthyArgs;
             // Start new streak if next day is healthy
             tempHealthyArgs = nextDay.isHealthy ? 1 : 0;
        } else {
            // Case: currDay not healthy. Streak is 0.
            if (tempHealthyArgs > bestHealthyStreak) bestHealthyStreak = tempHealthyArgs;
             tempHealthyArgs = nextDay.isHealthy ? 1 : 0;
        }
    }
    if (tempHealthyArgs > bestHealthyStreak) bestHealthyStreak = tempHealthyArgs;

    // Current Healthy
    if (diff <= 1 && days[0].isHealthy) {
        currentHealthyStreak = 1;
        for (let i = 0; i < days.length - 1; i++) {
            const curr = days[i];
            const next = days[i+1];
            if (differenceInCalendarDays(curr.date, next.date) === 1 && next.isHealthy) {
                currentHealthyStreak++;
            } else {
                break;
            }
        }
    }

    return { currentStreak, bestStreak, currentHealthyStreak, bestHealthyStreak };
};

