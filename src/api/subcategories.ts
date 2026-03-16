import { apiClient } from './client';
import { SubCategory } from '../types/api';

export const getSubCategoriesAPI = async (): Promise<SubCategory[]> => {
  const response = await apiClient.get('/subcategories');
  return response.data;
};

export const getSubCategoriesByCategoryIdAPI = async (categoryId: string): Promise<SubCategory[]> => {
  const response = await apiClient.get(`/subcategories/${categoryId}`);
  return response.data;
};

export const createSubCategoryAPI = async (formData: FormData): Promise<SubCategory> => {
  const response = await apiClient.post('/subcategories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateSubCategoryAPI = async (id: string, formData: FormData): Promise<SubCategory> => {
  const response = await apiClient.put(`/subcategories/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteSubCategoryAPI = async (id: string): Promise<any> => {
  const response = await apiClient.delete(`/subcategories/${id}`);
  return response.data;
};
