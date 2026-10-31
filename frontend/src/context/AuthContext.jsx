import { createContext, useCallback, useMemo, useRef, useState } from 'react';
import { getStoredUser, getToken, setAuthStorage, clearAuthStorage } from '../api/axiosClient';
import { authService } from '../services/authService';

// Context chia sẻ trạng thái đăng nhập cho toàn bộ ứng dụng
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Khởi tạo từ localStorage để tải lại trang (F5) vẫn giữ đăng nhập
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getStoredUser());

  // Đăng nhập: lưu token + user vào localStorage và state
  const login = useCallback((newToken, newUser) => {
    setAuthStorage(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
  }, []);

  // Keep the bearer token until the server confirms revocation.
  const logoutPending = useRef(null);
  const logout = useCallback(() => {
    if (logoutPending.current) return logoutPending.current;
    logoutPending.current = (async () => {
      try {
        const response = await authService.logout();
        if (!(response?.ok && response.data?.success) && response?.status !== 401) return false;
        clearAuthStorage();
        setToken(null);
        setUser(null);
        return true;
      } catch {
        return false;
      } finally {
        logoutPending.current = null;
      }
    })();
    return logoutPending.current;
  }, []);

  // Giá trị cung cấp cho các component (useMemo để tránh render lại không cần thiết)
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
