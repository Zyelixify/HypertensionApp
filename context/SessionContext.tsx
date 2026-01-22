import React, { createContext, useContext, useEffect, useState } from 'react';
import { StorageService } from '../services/StorageService';

type SessionContextType = {
  onboardingComplete: boolean;
  isLoading: boolean;
  setSessionOnboardingComplete: (complete: boolean) => void;
  resetOnboarding: () => Promise<void>;
};

const SessionContext = createContext<SessionContextType>({
  onboardingComplete: false,
  isLoading: true,
  setSessionOnboardingComplete: () => {},
  resetOnboarding: async () => {},
});

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const resetOnboarding = async () => {
    await StorageService.clearUserProfile();
    setOnboardingComplete(false);
  };

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const profile = await StorageService.getUserProfile();
        setOnboardingComplete(!!profile?.onboardingComplete);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    checkStatus();
  }, []);

  return (
    <SessionContext.Provider value={{ 
      onboardingComplete, 
      isLoading,
      setSessionOnboardingComplete: setOnboardingComplete,
      resetOnboarding
    }}>
      {children}
    </SessionContext.Provider>
  );
};
