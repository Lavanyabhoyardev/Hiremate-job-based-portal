import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { setClerkTokenGetter, fetchJson } from '../api/http.js';
import { API_BASE } from '../api/base.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { getToken, signOut } = useClerkAuth();
  const [dbUser, setDbUser] = useState(null);
  const [loadingDb, setLoadingDb] = useState(true);

  useEffect(() => {
    // Make getToken globally available in http.js
    setClerkTokenGetter(getToken);
  }, [getToken]);

  const loadMe = useCallback(async () => {
    if (!clerkUser) return;
    setLoadingDb(true);
    try {
      const data = await fetchJson(`${API_BASE}/api/auth/me`, { method: 'GET' }, { auth: 'required' });
      setDbUser(data?.user ?? null);
    } catch (err) {
      console.error("Failed to load db user", err);
      setDbUser(null);
    } finally {
      setLoadingDb(false);
    }
  }, [clerkUser]);

  useEffect(() => {
    if (clerkLoaded && clerkUser) {
      loadMe();
    } else if (clerkLoaded && !clerkUser) {
      setDbUser(null);
      setLoadingDb(false);
    }
  }, [clerkLoaded, clerkUser, loadMe]);

  const value = useMemo(
    () => ({
      user: dbUser || clerkUser,
      clerkUser,
      loading: !clerkLoaded || loadingDb,
      isAuthenticated: !!clerkUser,
      token: null, // Removed sync token as it's now handled asynchronously in HTTP calls
      login: () => {}, // Handled by Clerk components
      register: () => {}, // Handled by Clerk components
      logout: () => signOut(),
      reload: loadMe
    }),
    [dbUser, clerkUser, clerkLoaded, loadingDb, signOut, loadMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
