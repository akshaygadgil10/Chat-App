"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const GUEST_LIMIT = 3;
const STORAGE_KEY = "guest_message_count";
const AUTH_MODE_KEY = "auth_mode";
const USER_DATA_KEY = "user_data";

type AuthMode = "none" | "guest" | "signed-in";

interface UserData {
  name: string;
  email: string;
  mobile: string;
  consentGiven: boolean;
  registeredAt: string;
}

interface AuthContextType {
  authMode: AuthMode;
  guestMessagesUsed: number;
  guestLimitReached: boolean;
  loginAsGuest: () => void;
  loginAsUser: (data: UserData) => void;
  logout: () => void;
  incrementGuestCount: () => void;
  userData: UserData | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authMode, setAuthMode] = useState<AuthMode>("none");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [guestMessagesUsed, setGuestMessagesUsed] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedCount = localStorage.getItem(STORAGE_KEY);
    const storedMode = localStorage.getItem(AUTH_MODE_KEY) as AuthMode | null;
    const storedData = localStorage.getItem(USER_DATA_KEY);

    if (storedCount) setGuestMessagesUsed(parseInt(storedCount, 10));
    if (storedMode) setAuthMode(storedMode);
    if (storedData) {
      try { setUserData(JSON.parse(storedData)); } catch {}
    }
    setHydrated(true);
  }, []);

  const loginAsGuest = () => {
    setAuthMode("guest");
    setGuestMessagesUsed(0);
    localStorage.setItem(AUTH_MODE_KEY, "guest");
    localStorage.removeItem(STORAGE_KEY);
  };

  const loginAsUser = (data: UserData) => {
    setAuthMode("signed-in");
    setUserData(data);
    setGuestMessagesUsed(0);
    localStorage.setItem(AUTH_MODE_KEY, "signed-in");
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
    localStorage.removeItem(STORAGE_KEY);
  };

  const logout = () => {
    setAuthMode("none");
    setUserData(null);
    setGuestMessagesUsed(0);
    localStorage.removeItem(AUTH_MODE_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(STORAGE_KEY);
  };

  const incrementGuestCount = () => {
    setGuestMessagesUsed((prev) => {
      const next = prev + 1;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  if (!hydrated) return null;

  return (
    <AuthContext.Provider
      value={{
        authMode,
        guestMessagesUsed,
        guestLimitReached: guestMessagesUsed >= GUEST_LIMIT,
        loginAsGuest,
        loginAsUser,
        logout,
        incrementGuestCount,
        userData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}