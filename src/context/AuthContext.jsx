import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize and run auto login check
  useEffect(() => {
    const autoLogin = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
          setToken(storedToken);
        } catch (err) {
          console.error('Session expired or invalid token', err);
          // Token is invalid, clean up local storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    autoLogin();
  }, []);

  // Clear errors helper
  const clearError = () => setError(null);

  // Register user
  const register = async (name, email, password, confirmPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        confirmPassword,
      });

      const { token: userToken, ...userData } = response.data;
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(userToken);
      setUser(userData);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Registration failed';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  // Login user
  const login = async (email, password, rememberMe) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: userToken, ...userData } = response.data;

      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      setToken(userToken);
      setUser(userData);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Invalid email or password';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error on server', err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Update profile name or picture
  const updateProfile = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      // Need multipart headers for file uploads
      const response = await api.put('/user/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedUser = response.data;
      const localUserData = JSON.parse(localStorage.getItem('user') || '{}');
      const mergedUser = { ...localUserData, ...updatedUser };

      localStorage.setItem('user', JSON.stringify(mergedUser));
      setUser(mergedUser);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Failed to update profile';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put('/user/password', { currentPassword, newPassword });
      setLoading(false);
      return { success: true, message: response.data.message };
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Password update failed';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setLoading(false);
      return { success: true, token: response.data.token, message: response.data.message };
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Failed to initiate password reset';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  // Reset password
  const resetPassword = async (resetToken, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/reset-password', { token: resetToken, password });
      setLoading(false);
      return { success: true, message: response.data.message };
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Failed to reset password';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  // Delete account
  const deleteAccount = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.delete('/user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Failed to delete account';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
        deleteAccount,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
