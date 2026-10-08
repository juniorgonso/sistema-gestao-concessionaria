// mobile/src/services/api.ts
import axios from 'axios';

const api = axios.create({
  // Por enquanto deixaremos a base do IP assim. Depois pegamos o IP real do seu PC.
  baseURL: 'http://192.168.1.5:8000/api', 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(async (config) => {
  return config;
});

export default api;