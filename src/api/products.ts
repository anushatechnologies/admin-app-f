import { apiClient } from './client';
import { Product } from '../types/api';

export const getProductsAPI = async (storeId?: string): Promise<any> => {
  const url = storeId ? `/products?storeId=${storeId}` : '/products';
  const response = await apiClient.get(url);
  return response.data;
};

export const getProductByIdAPI = async (id: string): Promise<any> => {
  const response = await apiClient.get(`/products/${id}`);
  return response.data;
};

export const searchProductsAPI = async (keyword: string): Promise<any> => {
  const response = await apiClient.get(`/products/search?keyword=${encodeURIComponent(keyword)}`);
  return response.data;
};

export const getTrendingProductsAPI = async (): Promise<any> => {
  const response = await apiClient.get(`/products/trending`);
  return response.data;
};

export interface ProductFilterParams {
  categoryId?: string;
  subCategoryId?: string;
  storeId?: string;
  minPrice?: number;
  maxPrice?: number;
  trending?: boolean;
  keyword?: string;
}

export const filterProductsAPI = async (params: ProductFilterParams): Promise<any> => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });
  const response = await apiClient.get(`/products/filter?${queryParams.toString()}`);
  return response.data;
};

export const createProductAPI = async (formData: FormData): Promise<Product> => {
  const response = await apiClient.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateProductAPI = async (id: string, formData: FormData): Promise<Product> => {
  const response = await apiClient.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteProductAPI = async (id: string): Promise<any> => {
  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
};
