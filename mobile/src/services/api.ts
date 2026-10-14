import axios, { InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: 'https://sistema-gestao-concessionaria.onrender.com/api/v1',
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('@SistemaGestao:token');
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default api;