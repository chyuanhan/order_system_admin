import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  // 驗證 token 的函數
  const verifyToken = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.admin);
        setIsAuthenticated(true);
      } else {
        // token 無效，清除本地存儲
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 登入函數
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      
      if (data.token && data.admin) {
        // 保存 token 到 localStorage
        localStorage.setItem('token', data.token);
        setUser(data.admin);
        setIsAuthenticated(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  // 登出函數
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // 帶 token 的請求函數
  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };

    return fetch(url, { ...options, headers });
  }, []);

  // 初始化時驗證 token
  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  if (isLoading) {
    return <div>Loading...</div>; // 或者使用一個加載組件
  }

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    fetchWithAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
