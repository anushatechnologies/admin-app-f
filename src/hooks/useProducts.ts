import { useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { getProductsAPI, updateProductAPI } from '../api/products';
import { Product } from '../types/api';

export const useProducts = (storeId?: string) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getProductsAPI(storeId);
            
            let productsArray: Product[] = [];
            if (Array.isArray(data)) {
                productsArray = data;
            } else if (data && typeof data === 'object') {
                if (Array.isArray(data.content)) productsArray = data.content;
                else if (Array.isArray(data.products)) productsArray = data.products;
                else if (Array.isArray(data.data)) productsArray = data.data;
                else if (Array.isArray(data.results)) productsArray = data.results;
                else if (Array.isArray(data.items)) productsArray = data.items;
            }

            if (productsArray.length > 0) {
                // Map backend fields to frontend interface
                const formattedProducts: Product[] = productsArray.map((item: any) => ({
                    ...item,
                    image: item.imageUrl || item.image,
                    inStock: item.inStock !== undefined ? item.inStock : true, // Assuming default true or map it
                    isActive: item.active !== undefined ? item.active : item.isActive,
                    id: String(item.id || item._id),
                }));
                setProducts(formattedProducts);
            } else if (productsArray.length === 0) {
                setProducts([]);
            } else {
                console.log('Products API did not return an array:', data);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    }, [storeId]);

    const toggleProductStock = useCallback(async (product: Product) => {
        const productId = product.id;
        const newStatus = !product.inStock;

        try {
            // The backend error explicitly provided the EXACT 10 allowed fields for ProductRequest:
            const backendProduct = {
                isActive: newStatus,
                bestSeller: product.bestSeller ?? false,
                categoryId: product.categoryId ?? null,
                name: product.name,
                description: product.description ?? '',
                variants: product.variants ?? [],
                isTrending: product.isTrending ?? product.trending ?? false,
                subCategoryId: product.subCategoryId ?? null,
                displayOrder: product.displayOrder ?? 0,
                storeId: product.storeId,
            };

            const fd = new FormData();
            
            if (Platform.OS === 'web') {
                const productBlob = new Blob([JSON.stringify(backendProduct)], { type: 'application/json' });
                fd.append('product', productBlob as any);
            } else {
                fd.append('product', {
                    string: JSON.stringify(backendProduct),
                    type: 'application/json',
                    name: 'product.json'
                } as any);
            }

            await updateProductAPI(productId, fd);

            setProducts(prev =>
                prev.map(p => (p.id === productId ? { ...p, inStock: newStatus, isActive: newStatus } : p))
            );
            return true;
        } catch (err: any) {
            console.error('Product Update Failed:', err);
            console.error('Response Data:', err.response?.data);
            console.error('Response Headers:', err.response?.headers);
            
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update product';
            setError(errorMessage);
            Alert.alert('Update Error', JSON.stringify(err.response?.data || errorMessage));
            return false;
        }
    }, []);

    return {
        products,
        loading,
        error,
        fetchProducts,
        toggleProductStock,
        setProducts, // Allow local updates if needed
    };
};
