import type { AuthUser } from '@repo/shared';
import { apiGet, apiPatch, apiPost } from './api';
import { API_URL } from './utils';

/** Must match AUTH_COOKIE in apps/api/src/modules/auth/auth.service.ts */
export const AUTH_COOKIE = 'access_token';

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput extends LoginInput {
  name: string;
}

export const login = (input: LoginInput) => apiPost<AuthUser>('/auth/login', input);
export const signup = (input: SignupInput) => apiPost<AuthUser>('/auth/signup', input);
export const logout = () => apiPost<void>('/auth/logout');
export const getCurrentUser = () => apiGet<AuthUser>('/auth/me');
export const updateProfile = (input: { name?: string; username?: string }) =>
  apiPatch<AuthUser>('/users/me', input);

/** Full-page navigation: the API redirects to Google's consent screen. */
export const GOOGLE_LOGIN_URL = `${API_URL}/auth/google`;
