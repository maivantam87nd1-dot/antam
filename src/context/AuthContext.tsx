import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, MoodType } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  loginAsGuest: () => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeSession: (minutes: number) => Promise<void>;
  logMood: (mood: MoodType, label: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  exportUserData: () => Promise<any>;
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('antam_token'));
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('antam_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync token and user in localStorage & theme
  useEffect(() => {
    if (token) {
      localStorage.setItem('antam_token', token);
    } else {
      localStorage.removeItem('antam_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('antam_user', JSON.stringify(user));
      if (user.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      localStorage.removeItem('antam_user');
    }
  }, [user]);

  // On initial mount, verify session token with server
  useEffect(() => {
    const verifyInitialSession = async () => {
      const storedToken = localStorage.getItem('antam_token');
      if (storedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser({ ...data.user, token: storedToken });
            return;
          }
        } catch (e) {}
      }

      // If no valid session, initialize Guest
      loginAsGuest();
    };

    verifyInitialSession();
  }, []);

  const loginAsGuest = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/guest', { method: 'POST' });
      const data = await res.json();
      if (data.user && data.token) {
        setToken(data.token);
        setUser({
          ...data.user,
          token: data.token,
          selectedGoals: ['Giảm căng thẳng', 'Tập thở'],
          mindfulnessBell: {
            enabled: true,
            times: ['08:00', '12:00', '21:00'],
            sound: 'singing_bowl'
          },
          theme: 'light',
          fontSize: 'normal'
        });
      }
    } catch (e) {
      console.warn('Backend offline, using fallback local profile');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPassword = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Đăng nhập không thành công.' };
      }

      setToken(data.token);
      setUser({
        ...data.user,
        token: data.token,
        selectedGoals: user?.selectedGoals || ['Tìm kiếm bình an'],
        mindfulnessBell: user?.mindfulnessBell || {
          enabled: true,
          times: ['08:00', '21:00'],
          sound: 'singing_bowl'
        },
        theme: user?.theme || 'light',
        fontSize: user?.fontSize || 'normal'
      });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: 'Lỗi mạng khi kết nối máy chủ.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Đăng ký không thành công.' };
      }

      setToken(data.token);
      setUser({
        ...data.user,
        token: data.token,
        selectedGoals: ['Giảm căng thẳng', 'Học thiền'],
        mindfulnessBell: {
          enabled: true,
          times: ['08:00', '12:00', '21:00'],
          sound: 'singing_bowl'
        },
        theme: 'light',
        fontSize: 'normal'
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Lỗi mạng khi kết nối máy chủ.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {}
    }
    setToken(null);
    localStorage.removeItem('antam_token');
    localStorage.removeItem('antam_user');
    loginAsGuest();
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);

    if (token) {
      try {
        await fetch('/api/auth/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(updates)
        });
      } catch (e) {}
    }
  };

  const completeSession = async (minutes: number) => {
    if (!user) return;
    const newMins = user.totalMeditationMinutes + minutes;
    const newSessions = user.totalSessions + 1;
    const updated = {
      ...user,
      totalMeditationMinutes: newMins,
      totalSessions: newSessions,
      streakDays: user.streakDays + 1
    };
    setUser(updated);

    if (token) {
      try {
        await fetch('/api/user/complete-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ minutes })
        });
      } catch (e) {}
    }
  };

  const logMood = async (mood: MoodType, label: string) => {
    if (!user || !token) return;
    try {
      await fetch('/api/user/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ mood, label })
      });
    } catch (e) {}
  };

  const deleteAccount = async () => {
    if (!user || !token) return;
    try {
      await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
    } catch (e) {}
    setToken(null);
    localStorage.clear();
    loginAsGuest();
  };

  const exportUserData = async () => {
    if (!user || !token) return null;
    try {
      const res = await fetch('/api/auth/export-data', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    } catch (e) {
      return { user };
    }
  };

  const toggleTheme = () => {
    if (!user) return;
    const nextTheme = user.theme === 'dark' ? 'light' : 'dark';
    updateProfile({ theme: nextTheme });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        loginAsGuest,
        loginWithPassword,
        register,
        logout,
        updateProfile,
        completeSession,
        logMood,
        deleteAccount,
        exportUserData,
        toggleTheme
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
