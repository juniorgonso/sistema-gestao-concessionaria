
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://sistema-gestao-concessionaria.onrender.com/api/v1',
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@SistemaGestao:token');

    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
