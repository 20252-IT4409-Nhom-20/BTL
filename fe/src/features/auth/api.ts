import { authApi, setToken, setUser, clearAuth, type StoredUser } from '@/lib/auth-client';

export type User = StoredUser;

type LoginResponse = { message: string; token: string; user: User };
type RegisterResponse = { message: string; user: User };
type MeResponse = { user: User };

export async function login(credentials: { username?: string; email?: string; password: string }) {
  const data = (await authApi.post('/auth/login', credentials)) as unknown as LoginResponse;
  setToken(data.token);
  setUser(data.user);
  return data;
}

export async function register(payload: { username: string; email: string; password: string }) {
  return (await authApi.post('/auth/register', payload)) as unknown as RegisterResponse;
}

export async function fetchMe() {
  const data = (await authApi.get('/auth/me')) as unknown as MeResponse;
  setUser(data.user);
  return data;
}

export function logout() {
  clearAuth();
}
