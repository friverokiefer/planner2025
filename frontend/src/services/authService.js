// frontend/src/services/authService.js

import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Importación corregida

const API_URL = '/api/auth/';

const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}register`, userData);
    if (response.data.token) {
      const decoded = jwtDecode(response.data.token); // Uso corregido
      const user = {
        token: response.data.token,
        id: decoded.user.id,
        role: decoded.user.role,
      };
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }
    return null;
  } catch (error) {
    console.error('Error en el registro:', error.response?.data || error.message);
    throw error;
  }
};

const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}login`, credentials);
    if (response.data.token) {
      const decoded = jwtDecode(response.data.token); // Uso corregido
      const user = {
        token: response.data.token,
        id: decoded.user.id,
        role: decoded.user.role,
      };
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }
    return null;
  } catch (error) {
    console.error('Error en el login:', error.response?.data || error.message);
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user;
  } catch (error) {
    console.error('Error al parsear el usuario de localStorage:', error);
    return null;
  }
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default authService;
