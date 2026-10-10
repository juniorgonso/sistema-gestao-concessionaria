import api from './api';

interface AuthResponse {
  access: string;
  refresh: string;
}

export const login = async (username: string, password: string): Promise<string> => {
  try {
    const response = await api.post<AuthResponse>('/token/', { username, password });
    const { access, refresh } = response.data;
    
    localStorage.setItem('@SistemaGestao:token', access);
    localStorage.setItem('@SistemaGestao:refresh_token', refresh);
    
    return access;
  } catch (error) {
    console.error("Erro no login:", error);
    throw new Error('Falha na autenticação. Verifique as credenciais.');
  }
};

export const logout = (): void => {
  localStorage.removeItem('@SistemaGestao:token');
  localStorage.removeItem('@SistemaGestao:refresh_token');
};