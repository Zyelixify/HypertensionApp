const { withAndroidManifest } = require('@expo/config-plugins');

const withHealthConnectManifest = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;

    // 1. Ensure <queries> exists
    if (!androidManifest.manifest.queries) {
      androidManifest.manifest.queries = [{}];
    }
    const queries = androidManifest.manifest.queries[0];
    
    if (!queries.package) {
        queries.package = [];
    }

    const hasHealthDataQuery = queries.package.some(p => p.$['android:name'] === 'com.google.android.apps.healthdata');

    if (!hasHealthDataQuery) {
        queries.package.push({ $: { 'android:name': 'com.google.android.apps.healthdata' } });
    }

    // 2. Ensure Activity Alias exists
    // <activity-alias android:name="ViewPermissionUsageActivity" ...>
    if (!androidManifest.manifest['application']) {
        return config;
    }
    
    // Check if alias already exists
    const app = androidManifest.manifest.application[0];
    if (!app['activity-alias']) {
        app['activity-alias'] = [];
    }
    
    const hasAlias = app['activity-alias'].some(alias => alias.$['android:name'] === 'ViewPermissionUsageActivity');
    
    if (!hasAlias) {
        app['activity-alias'].push({
            $: {
                'android:name': 'ViewPermissionUsageActivity',
                'android:exported': 'true',
                'android:targetActivity': '.MainActivity',
                'android:permission': 'android.permission.START_VIEW_PERMISSION_USAGE'
            },
            'intent-filter': [{
                action: [{ $: { 'android:name': 'android.intent.action.VIEW_PERMISSION_USAGE' } }],
                category: [{ $: { 'android:name': 'android.intent.category.HEALTH_PERMISSIONS' } }]
            }]
        });
    }

    return config;
  });
};

module.exports = withHealthConnectManifest;
