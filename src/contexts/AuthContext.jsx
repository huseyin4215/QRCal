import { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirectTo, setRedirectTo] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('AuthContext - Token:', token);
    console.log('AuthContext - User data from localStorage:', userData);
    
    if (token) {
      apiService.setToken(token);
      loadCurrentUser();
    } else {
      // Clear any stale user data if no token
      if (userData) {
        console.log('AuthContext - Clearing stale user data');
        localStorage.removeItem('user');
      }
      console.log('AuthContext - No token found, setting loading to false');
      setLoading(false);
    }
  }, []);

  const loadCurrentUser = async () => {
    try {
      console.log('AuthContext: Loading current user...');
      const response = await apiService.getCurrentUser();
      console.log('AuthContext: getCurrentUser response:', response);
      
      if (response.success) {
        console.log('AuthContext: User loaded successfully:', response.data);
        setUser(response.data);
      } else {
        console.log('AuthContext: getCurrentUser failed:', response);
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
    console.log('AuthContext - Login called with token:', token);
    console.log('AuthContext - Login called with userData:', userData);
    
    setUser(userData);
    setLoading(false); // Set loading to false after login
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    apiService.setToken(token);
    
    console.log('AuthContext - After login, localStorage token:', localStorage.getItem('token'));
    console.log('AuthContext - After login, localStorage user:', localStorage.getItem('user'));
    
    // Set redirect path based on role and first login status
    if (userData.isFirstLogin) {
      console.log('AuthContext - Setting redirect to change password');
      setRedirectTo('/change-password');
    } else {
      console.log('AuthContext - Setting redirect based on role:', userData.role);
      switch (userData.role) {
        case 'student':
          setRedirectTo('/student-dashboard');
          break;
        case 'faculty':
          setRedirectTo('/faculty-dashboard');
          break;
        case 'admin':
          console.log('AuthContext - Setting redirect to admin dashboard');
          setRedirectTo('/admin-dashboard');
          break;
        default:
          console.log('AuthContext - Unknown role, setting redirect to home');
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
      apiService.clearToken();
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