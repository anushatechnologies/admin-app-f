import { apiClient } from './client';
import { AuthResponse } from '../types/api';

export const loginAPI = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
};

export const registerAPI = async (name: string, email: string, password: string): Promise<any> => {
  const response = await apiClient.post('/auth/register', { name, email, password, role: 'ADMIN' });
  return response.data;
};

export const sendOtpAPI = async (email: string): Promise<any> => {
  const response = await apiClient.post('/auth/send-otp', { email });
  return response.data;
};

export const verifyOtpAPI = async (email: string, otp: string, newPassword: string): Promise<any> => {
  const response = await apiClient.post('/auth/verify-otp', { email, otp, newPassword });
  return response.data;
};
