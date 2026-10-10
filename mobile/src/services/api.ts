import axios, { InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  // Atualizado para o padrão do Vite:
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('@SistemaGestao:token');
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default api;