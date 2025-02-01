// frontend/src/services/authService.js
import axios from './axiosInstance'; // Se utiliza la instancia configurada

const authService = {
  login: token => {
    localStorage.setItem('token', token);
  },
  logout: () => {
    localStorage.removeItem('token');
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  getToken: () => {
    return localStorage.getItem('token');
  },
  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payloadBase64 = token.split('.')[1];
      const payloadString = atob(payloadBase64);
      const payload = JSON.parse(payloadString);

      // Verifica si el token ha expirado
      if (Date.now() >= payload.exp * 1000) {
        console.warn('El token ha expirado. Cerrando sesión...');
        authService.logout(); // Cierra la sesión
        return null;
      }

      return {
        id: payload.user.id,
        role: payload.user.role,
        token: token,
      };
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  },
  register: async (userData) => {
    // Se envía la petición al endpoint de registro (http://localhost:5000/api/auth/register)
    const response = await axios.post('/auth/register', userData);
    const token = response.data.token;
    
    // Guarda el token en localStorage
    authService.login(token);
    
    // Devuelve el usuario decodificado a partir del token
    return authService.getCurrentUser();
  }
};

export default authService;
