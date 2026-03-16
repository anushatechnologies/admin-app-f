import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBaseUrl } from '../constants/env';

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await AsyncStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: any) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['adminToken', 'adminUser']);
      // Note: Full redirect to login would happen via navigation state change 
      // or by the next high-level component check.
    }
    
    // Extract a meaningful error message from the backend structure
    const backendMessage = error.response?.data?.message || error.response?.data?.error;
    const message = backendMessage || error.message || 'Something went wrong';
    
    return Promise.reject(new Error(message));
  }
);
