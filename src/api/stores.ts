import { apiClient } from './client';
import { Store, Store1 } from '../types/api';

export const getStoresAPI = async (name?: string): Promise<any> => {
  const url = name ? `/stores?name=${name}` : '/stores';
  const response = await apiClient.get(url);
  return response.data;
};

export const createStoreAPI = async (formData: FormData): Promise<Store> => {
  const response = await apiClient.post('/stores', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateStoreAPI = async (id: string, formData: FormData): Promise<Store> => {
  const response = await apiClient.put(`/stores/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteStoreAPI = async (id: string): Promise<any> => {
  const response = await apiClient.delete(`/stores/${id}`);
  return response.data;
};

// Main Store (Store1)
export const getStores1API = async (search?: string): Promise<Store1[]> => {
  const url = search ? `/stores1?search=${search}` : '/stores1';
  const response = await apiClient.get(url);
  return response.data;
};

export const createStore1API = async (data: any): Promise<Store1> => {
  const response = await apiClient.post('/stores1', data);
  return response.data;
};

export const updateStore1API = async (id: string, data: any): Promise<Store1> => {
  const response = await apiClient.put(`/stores1/${id}`, data);
  return response.data;
};

export const deleteStore1API = async (id: string): Promise<any> => {
  const response = await apiClient.delete(`/stores1/${id}`);
  return response.data;
};
