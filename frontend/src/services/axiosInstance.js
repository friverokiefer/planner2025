// frontend/src/services/axiosInstance.js
import axios from 'axios';
import authService from './authService';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api', // Base URL para todos los endpoints de la API
});

instance.interceptors.request.use(
  config => {
    // Obtén el usuario actual y, si existe un token, agrégalo en el header
    const user = authService.getCurrentUser();
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default instance;
