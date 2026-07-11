import { createContext, useCallback, useMemo, useState } from 'react';
import { getStoredUser, getToken, setAuthStorage, clearAuthStorage } from '../api/axiosClient';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getStoredUser());

  const login = useCallback((newToken, newUser) => {
    setAuthStorage(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    clearAuthStorage();
    setToken(null);
    setUser(null);
    try {
      authService.logout();
    } catch {
      /* best-effort, giữ đúng hành vi bản gốc */
    }
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isLoggedIn: !!token,
      login,
      logout,
    }),
    [token, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
