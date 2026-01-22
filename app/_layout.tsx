import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SessionProvider, useSession } from '../context/SessionContext';
import { ThemeProvider } from '../context/ThemeContext';

// Create a client
const queryClient = new QueryClient();

function RootLayoutNav() {
  const { onboardingComplete, isLoading } = useSession();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inOnboardingGroup = segments[0] === 'onboarding';

    if (!onboardingComplete && !inOnboardingGroup) {
      // Redirect to the onboarding route
      router.replace('/onboarding');
    } else if (onboardingComplete && inOnboardingGroup) {
      // Redirect to the tabs route
      router.replace('/(tabs)');
    }
  }, [isLoading, segments, onboardingComplete]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="add-reading" options={{ presentation: 'transparentModal', headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <RootLayoutNav />
    </SessionProvider>
  );
}
