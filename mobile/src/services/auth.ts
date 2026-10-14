
import api from './api';

interface AuthResponse {
  access: string;
  refresh: string;
}

const TOKEN_KEY = '@SistemaGestao:token';
const REFRESH_KEY = '@SistemaGestao:refresh_token';

export const login = async (
  username: string,
  password: string
): Promise<string> => {
  const response = await api.post<AuthResponse>('/token/', {
    username,
    password
  });

  const { access, refresh } = response.data;

  if (!access || !refresh) {
    throw new Error('Resposta de autenticação incompleta.');
  }

  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);

  return access;
};

export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
};
