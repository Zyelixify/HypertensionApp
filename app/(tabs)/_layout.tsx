import { MaterialCommunityIcons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        tabBarStyle: {
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.outlineVariant,
        },
        headerStyle: {
            backgroundColor: theme.colors.background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.outlineVariant,
        },
        headerTitleStyle: {
            fontWeight: 'bold',
        },
        headerTintColor: theme.colors.onBackground,
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          headerShown: false,
        }}
      />
      
      {/* Central Add Button */}
      <Tabs.Screen
        name="add_reading_placeholder"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <View
                style={{
                    backgroundColor: theme.colors.primary,
                    height: 56,
                    width: 56,
                    borderRadius: 28,
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: theme.colors.shadow,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 5,
                }}
            >
                <MaterialCommunityIcons name="plus" size={48} color={theme.colors.onPrimary} />
            </View>
          ),
          tabBarLabel: () => null, // No label
        }}
        listeners={() => ({
            tabPress: (e) => {
                e.preventDefault(); // Stop default navigation
                router.push('/add-reading'); // Manual modal push
            }
        })}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
        }}
      />

    </Tabs>
  );
}
