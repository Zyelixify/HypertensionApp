import { Platform } from 'react-native';
import { getGrantedPermissions, initialize, insertRecords, readRecords, requestPermission } from 'react-native-health-connect';

export interface PermissionStatus {
    recordType: string;
    accessType: 'read' | 'write';
    granted: boolean;
}

export const HealthService = {
  async requestPermissions() {
    if (Platform.OS === 'android') {
        try {
            const isInitialized = await initialize();
            if (!isInitialized) {
                console.error('[HealthConnect] Initialization failed - Health Connect APK likely missing or checks failed.');
                return false;
            }

            // Check if permissions are already granted to avoid unnecessary request calls
            // which can cause crashes on some Android versions if called too early
            const grantedPermissions = await getGrantedPermissions();
            const hasBloodPressureRead = grantedPermissions.some(p => p.recordType === 'BloodPressure' && p.accessType === 'read');
            const hasBloodPressureWrite = grantedPermissions.some(p => p.recordType === 'BloodPressure' && p.accessType === 'write');
            
            if (hasBloodPressureRead && hasBloodPressureWrite) {
              console.log('[HealthConnect] Permissions already granted.');
              return true;
            }

            console.log('[HealthConnect] Requesting permissions...');
            const granted = await requestPermission([
                { accessType: 'read', recordType: 'BloodPressure' },
                { accessType: 'write', recordType: 'BloodPressure' }
            ]);
            console.log('[HealthConnect] Request result:', granted);
            return !!granted;
        } catch (e) {
            console.log('[HealthConnect] Error:', e);
            return false;
        }
    }
    return false;
  },

  async checkPermissions() {
    if (Platform.OS === 'android') {
        try {
            const isInitialized = await initialize();
            if (!isInitialized) return false;
            
            const grantedPermissions = await getGrantedPermissions();
            return grantedPermissions.some(p => p.recordType === 'BloodPressure' && p.accessType === 'read');
        } catch (e) {
            return false;
        }
    }
    return false;
  },

  async checkDetailedPermissions(): Promise<PermissionStatus[]> {
      if (Platform.OS !== 'android') return [];
      
      try {
          const isInitialized = await initialize();
          if (!isInitialized) return [];

          const granted = await getGrantedPermissions();
          const required = [
              { recordType: 'BloodPressure', accessType: 'read' },
              { recordType: 'BloodPressure', accessType: 'write' },
          ];

          return required.map(req => ({
              ...req,
              granted: granted.some(g => g.recordType === req.recordType && g.accessType === req.accessType)
          })) as PermissionStatus[];
      } catch (e) {
          console.error(e);
          return [];
      }
  },

  async writeBloodPressure(systolic: number, diastolic: number, timestamp: number) {
      if (Platform.OS !== 'android') return;

      try {
            const isInitialized = await initialize();
            if (!isInitialized) return;

            // Permission check before writing
            const granted = await getGrantedPermissions();
            const hasWrite = granted.some(p => p.recordType === 'BloodPressure' && p.accessType === 'write');
            
            if (!hasWrite) {
                console.log('[HealthConnect] Write permission missing. Attempting request...');
                await requestPermission([
                    { accessType: 'write', recordType: 'BloodPressure' }
                ]);
                
                // If still not granted, throw or return
                const newGranted = await getGrantedPermissions();
                if (!newGranted.some(p => p.recordType === 'BloodPressure' && p.accessType === 'write')) {
                     console.warn('[HealthConnect] Write permission denied by user.');
                     return;
                }
            }

          await insertRecords([
              {
                  recordType: 'BloodPressure',
                  systolic: { value: systolic, unit: 'millimetersOfMercury' },
                  diastolic: { value: diastolic, unit: 'millimetersOfMercury' },
                  time: new Date(timestamp).toISOString(),
                  bodyPosition: 2, // Sitting, placeholder
                  measurementLocation: 3 // Upper left arm, placeholder
              }
          ]);
      } catch (e) {
          console.error('[HealthConnect] Write Error:', e);
      }
  },

  async getBloodPressure() {
    // Shared formatting helper
    const processAndroidRecords = (records: any[]) => {
        return records
            .filter(r => r.systolic?.pressure && r.diastolic?.pressure) // Filter out undefined/invalid readings
            .map(r => ({
                id: r.metadata?.id || Math.random().toString(),
                systolic: r.systolic.pressure,
                diastolic: r.diastolic.pressure,
                timestamp: new Date(r.time).getTime(),
                source: 'health_connect'
            }));
    };

    if (Platform.OS === 'android') {
        try {
            const isInitialized = await initialize();
            if (!isInitialized) return [];

            // Check permission before reading to prevent SecurityException
            const permissions = await getGrantedPermissions();
            const hasBP = permissions.some(p => p.recordType === 'BloodPressure' && p.accessType === 'read');
            if (!hasBP) {
                console.log('[HealthConnect] Permission missing, skipping read.');
                return [];
            }

            const result = await readRecords('BloodPressure', {
                timeRangeFilter: {
                    operator: 'after',
                    startTime: new Date(new Date().getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
                }
            });
            // Ensure result.records exists, otherwise fallback to result if it is an array, or empty
            const records = result.records || (Array.isArray(result) ? result : []);
            return processAndroidRecords(records);
        } catch (e) {
            console.error('[HealthConnect] Read Error:', e);
            return [];
        }
    }
    return [];
  }
};
