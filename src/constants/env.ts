import { Platform } from 'react-native';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:9000/api';

// For Android emulator to access localhost on host machine
export const getBaseUrl = () => {
    if (Platform.OS === 'android' && API_URL.includes('localhost')) {
        return API_URL.replace('localhost', '10.0.2.2');
    }
    return API_URL;
};
