const { withMainActivity } = require('@expo/config-plugins');

const withHealthConnectFix = (config) => {
  return withMainActivity(config, async (config) => {
    let src = config.modResults.contents;
    
    // 1. Add the Import
    const importStatement = 'import dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate';
    if (!src.includes(importStatement)) {
      // Insert after the package declaration or imports
      src = src.replace(
        /package .*/,
        (match) => `${match}\n${importStatement}`
      );
    }
    
    // 2. Add the Delegate Call in onCreate
    const delegateCall = 'HealthConnectPermissionDelegate.setPermissionDelegate(this)';
    if (!src.includes(delegateCall)) {
      // Find the end of super.onCreate(...)
      // In Kotlin it might be super.onCreate(null) or super.onCreate(savedInstanceState)
      const onCreateRegex = /super\.onCreate\((?:null|savedInstanceState)\)/;
      
      if (onCreateRegex.test(src)) {
          src = src.replace(
              onCreateRegex,
              (match) => `${match}\n    ${delegateCall}`
          );
      }
    }
    
    config.modResults.contents = src;
    return config;
  });
};

module.exports = withHealthConnectFix;
