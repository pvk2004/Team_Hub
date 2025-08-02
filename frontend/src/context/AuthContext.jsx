import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, handleApiError } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('teamhub_token');
    const user = localStorage.getItem('teamhub_user');
    
    if (token && user) {
      try {
        setCurrentUser(JSON.parse(user));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const signup = async (email, password, role) => {
    try {
      const response = await authAPI.signup(email, password, role);
      
      if (response.success) {
        localStorage.setItem('teamhub_token', response.token);
        localStorage.setItem('teamhub_user', JSON.stringify(response.user));
        setCurrentUser(response.user);
        return { success: true, user: response.user };
      }
      
      return { success: false, error: 'Signup failed' };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return { success: false, error: errorMessage };
    }
  };

  const signin = async (email, password) => {
    try {
      const response = await authAPI.signin(email, password);
      
      if (response.success) {
        localStorage.setItem('teamhub_token', response.token);
        localStorage.setItem('teamhub_user', JSON.stringify(response.user));
        setCurrentUser(response.user);
        return { success: true, user: response.user };
      }
      
      return { success: false, error: 'Signin failed' };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('teamhub_token');
    localStorage.removeItem('teamhub_user');
    setCurrentUser(null);
  };

  const isAdmin = () => {
    return currentUser && currentUser.role === 'admin';
  };

  const value = {
    currentUser,
    loading,
    signup,
    signin,
    logout,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};