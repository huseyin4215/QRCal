import React from 'react';
import apiService from '../services/apiService';

const AuthContext = React.createContext();

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [redirectTo, setRedirectTo] = React.useState(null);

  React.useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token) {
      apiService.setToken(token);
      loadCurrentUser();
    } else {
      // Clear any stale user data if no token
      if (userData) {
        localStorage.removeItem('user');
      }
      setLoading(false);
    }
  }, []);

  const loadCurrentUser = async () => {
    try {
      const response = await apiService.getCurrentUser();

      if (response.success) {
        setUser(response.data);
      } else {
        // Token might be invalid, clear it
        apiService.clearToken();
      }
    } catch (error) {
      console.error('AuthContext: Failed to load current user:', error);
      // Token might be invalid, clear it
      apiService.clearToken();
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    setUser(userData);
    setLoading(false);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    apiService.setToken(token);

    // Set redirect path based on role and first login status
    // Only faculty and admin need to change password on first login
    if (userData.isFirstLogin && (userData.role === 'faculty' || userData.role === 'admin')) {
      setRedirectTo('/change-password');
    } else {
      switch (userData.role) {
        case 'student':
          setRedirectTo('/student-dashboard');
          break;
        case 'faculty':
          setRedirectTo('/faculty-dashboard');
          break;
        case 'admin':
          setRedirectTo('/admin-dashboard');
          break;
        default:
          setRedirectTo('/');
      }
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('qrcal_user_profile');

      // Tüm localStorage'ı temizle
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('qrcal_') || key.startsWith('auth_')) {
          localStorage.removeItem(key);
        }
      });

      apiService.clearToken();

      // Login sayfasına yönlendir
      window.location.href = '/login';
    }
  };

  const updateUser = (updates) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...updates };
      // Update localStorage if needed
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    redirectTo,
    setRedirectTo,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 