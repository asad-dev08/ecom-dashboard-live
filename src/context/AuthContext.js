import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for saved auth token
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const updateUser = (newUserData) => {
    setUser(newUserData);
  };

  const login = async (email, password) => {
    try {
      const user = await api.login(email, password);
      console.log('user:', user);
      if (!user || user.role !== 'admin') {
        throw new Error('Invalid credentials or unauthorized access');
      }
      
      // In a real app, you would receive a token from the server
      const fakeToken = 'fake-jwt-token';
      localStorage.setItem('authToken', fakeToken);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      navigate('/dashboard');
      return user;
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const register = async (userData) => {
    try {
      const user = await api.register(userData);
      // In a real app, you might want to auto-login after registration
      return user;
    } catch (error) {
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 