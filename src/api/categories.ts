import { apiClient } from './client';
import { Category } from '../types/api';

export const getCategoriesAPI = async (): Promise<Category[]> => {
  const response = await apiClient.get('/categories');
  return response.data;
};

export const createCategoryAPI = async (formData: FormData): Promise<Category> => {
  const response = await apiClient.post('/categories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateCategoryAPI = async (id: string, formData: FormData): Promise<Category> => {
  const response = await apiClient.put(`/categories/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteCategoryAPI = async (id: string, hard = false): Promise<any> => {
  const url = hard ? `/categories/${id}/hard` : `/categories/${id}`;
  const response = await apiClient.delete(url);
  return response.data;
};
