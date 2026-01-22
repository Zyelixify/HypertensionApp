import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'bp_readings';
const XP_KEY = 'user_xp';
const USER_PROFILE_KEY = 'user_profile';
const LAST_SYNC_KEY = 'last_health_sync';
const HEALTH_CACHE_KEY = 'health_readings_cache';
const LAST_CONGRATS_KEY = 'last_congrats_notification_date';

export interface UserProfile {
  name: string;
  age: string;
  onboardingComplete: boolean;
}

export interface BPReading {
  id: string;
  systolic: number;
  diastolic: number;
  timestamp: number;
  note?: string;
  source: 'manual' | 'health_connect';
}

export const StorageService = {
  async addReading(reading: Omit<BPReading, 'id'>): Promise<BPReading> {
    const readings = await this.getReadings();
    const newReading = { ...reading, id: Date.now().toString() };
    const updatedReadings = [newReading, ...readings];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReadings));
    return newReading;
  },

  async getReadings(): Promise<BPReading[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      return json != null ? JSON.parse(json) : [];
    } catch (e) {
      console.error('Failed to load readings', e);
      return [];
    }
  },

  async bulkAddReadings(newReadings: Omit<BPReading, 'id'>[]): Promise<void> {
    const currentReadings = await this.getReadings();
    const readingsToAdd = newReadings.map(r => ({
      ...r,
      id: Math.random().toString(36).substring(7) + Date.now().toString()
    }));
    const updated = [...readingsToAdd, ...currentReadings];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const json = await AsyncStorage.getItem(USER_PROFILE_KEY);
      return json != null ? JSON.parse(json) : null;
    } catch (e) {
      console.error('Failed to load user profile', e);
      return null;
    }
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  },

  async clearUserProfile() {
    await AsyncStorage.removeItem(USER_PROFILE_KEY);
  },

  async clearReadings() {
    await AsyncStorage.removeItem(STORAGE_KEY);
    await AsyncStorage.removeItem(LAST_CONGRATS_KEY);
    await AsyncStorage.removeItem(XP_KEY);
  },

  async getXP(): Promise<number> {
    const val = await AsyncStorage.getItem(XP_KEY);
    return val ? parseInt(val) : 0;
  },

  async addXP(amount: number): Promise<number> {
    const current = await this.getXP();
    const newTotal = current + amount;
    await AsyncStorage.setItem(XP_KEY, newTotal.toString());
    return newTotal;
  },

  async getLastSyncTime(): Promise<number> {
    const val = await AsyncStorage.getItem(LAST_SYNC_KEY);
    return val ? parseInt(val) : 0;
  },

  async setLastSyncTime(timestamp: number) {
    await AsyncStorage.setItem(LAST_SYNC_KEY, timestamp.toString());
  },

  async getCachedHealthReadings(): Promise<BPReading[]> {
    try {
      const json = await AsyncStorage.getItem(HEALTH_CACHE_KEY);
      return json != null ? JSON.parse(json) : [];
    } catch { return []; }
  },

  async setCachedHealthReadings(readings: BPReading[]) {
    await AsyncStorage.setItem(HEALTH_CACHE_KEY, JSON.stringify(readings));
  },

  async getLastCongratDate(): Promise<number | null> {
    const val = await AsyncStorage.getItem(LAST_CONGRATS_KEY);
    return val ? parseInt(val) : null;
  },

  async setLastCongratDate(timestamp: number) {
    await AsyncStorage.setItem(LAST_CONGRATS_KEY, timestamp.toString());
  }
};
