// Auth context. Holds the current user + tokens and exposes login/logout to
// the rest of the app. Tokens live in localStorage so a refresh keeps you in.

import { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // `booting` is true while we check for an existing session on first mount —
  // pages use it to render a loader instead of bouncing to /login.
  const [booting, setBooting] = useState(true);

  // On first load, try to hydrate the user from a stored token.
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setBooting(false);
      return;
    }
    authApi
      .me()
      .then((u) => setUser(u))
      .catch(() => {
        // Token was bad/expired — drop it so we don't keep trying.
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
      .finally(() => setBooting(false));
  }, []);

  async function login(email, password) {
    const { user: u, accessToken, refreshToken } = await authApi.login(email, password);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(u);
    return u;
  }

  async function register(payload) {
    const { user: u, accessToken, refreshToken } = await authApi.register(payload);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(u);
    return u;
  }

  function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, booting, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
