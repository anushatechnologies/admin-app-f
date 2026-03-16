import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { getStoresAPI, updateStoreAPI } from '../api/stores';
import { Store } from '../types/api';

export const useStores = () => {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStores = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getStoresAPI();
            
            let storesArray: Store[] = [];
            if (Array.isArray(data)) {
                storesArray = data;
            } else if (data && typeof data === 'object') {
                if (Array.isArray(data.content)) storesArray = data.content;
                else if (Array.isArray(data.stores)) storesArray = data.stores;
                else if (Array.isArray(data.data)) storesArray = data.data;
                else if (Array.isArray(data.results)) storesArray = data.results;
                else if (Array.isArray(data.items)) storesArray = data.items;
            }

            if (storesArray.length > 0) {
                // Map backend fields to frontend interface
                const formattedStores: Store[] = storesArray.map((item: any) => ({
                    ...item,
                    image: item.imageUrl || item.image,
                    isActive: item.active !== undefined ? item.active : item.isActive,
                    address: item.label || item.address || '',
                    id: String(item.id || item._id), // Ensure ID is string
                }));
                setStores(formattedStores);
            } else if (storesArray.length === 0) {
                setStores([]);
                // Optional: alert empty
                // Alert.alert('Debug API', 'Stores array is empty []');
            } else {
                // Silently handle or log to a non-user-facing service
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch stores');
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleStoreStatus = useCallback(async (store: Store) => {
        const storeId = store.id;
        const newStatus = !store.isActive;

        try {
            const backendStore = {
                name: store.name,
                address: store.address,
                active: newStatus,
                status: store.status,
            };

            const fd = new FormData();
            
            if (Platform.OS === 'web') {
                const storeBlob = new Blob([JSON.stringify(backendStore)], { type: 'application/json' });
                fd.append('store', storeBlob as any);
            } else {
                fd.append('store', {
                    string: JSON.stringify(backendStore),
                    type: 'application/json',
                    name: 'store.json'
                } as any);
            }

            await updateStoreAPI(storeId, fd);
            
            setStores(prev =>
                prev.map(s => (s.id === storeId ? { ...s, isActive: newStatus } : s))
            );
            return true;
        } catch (err: any) {
            console.error('Store Update Failed:', err);
            console.error('Response Data:', err.response?.data);
            console.error('Response Headers:', err.response?.headers);
            
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update store';
            setError(errorMessage);
            Alert.alert('Update Error', JSON.stringify(err.response?.data || errorMessage));
            return false;
        }
    }, []);

    useEffect(() => {
        fetchStores();
    }, [fetchStores]);

    return {
        stores,
        loading,
        error,
        fetchStores,
        toggleStoreStatus,
    };
};
