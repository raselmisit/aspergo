import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, getAuthToken } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      api.getProfile()
        .then((res) => {
          if (res.user) setUser(res.user);
        })
        .catch(() => {
          setAuthToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    setAuthToken(res.token);
    setUser(res.user);
    setAuthModalOpen(false);
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    setAuthToken(res.token);
    setUser(res.user);
    setAuthModalOpen(false);
    return res;
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const updateProfile = async (userData) => {
    const res = await api.updateProfile(userData);
    setUser(res.user);
    return res;
  };

  // Quick switch for demo testing
  const switchDemoRole = async (roleType) => {
    if (roleType === 'super_admin') {
      await login('admin@aspergo.com', 'admin123');
    } else if (roleType === 'manager') {
      await login('manager@aspergo.com', 'manager123');
    } else if (roleType === 'customer') {
      await login('customer@aspergo.com', 'customer123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        switchDemoRole,
        authModalOpen,
        setAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        isSuperAdmin: user?.role === 'super_admin',
        isManager: user?.role === 'manager',
        isAdminOrManager: user?.role === 'super_admin' || user?.role === 'manager',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
