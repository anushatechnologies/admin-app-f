export interface Category {
    id: string;
    _id?: string;
    name: string;
    description?: string;
    image?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SubCategory {
    id: string;
    _id?: string;
    categoryId: string;
    name: string;
    description?: string;
    image?: string;
    video?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    id: string;
    _id?: string;
    name: string;
    description: string;
    price: number;
    discountedPrice?: number;
    categoryId: string;
    subCategoryId: string;
    storeId: string;
    image: string;
    trending: boolean;
    isActive?: boolean;
    active?: boolean; // Sometimes used by backend instead of isActive
    inStock?: boolean;
    stock?: number;
    sales?: number;
    // Additional fields from Spring Boot ProductRequest schema
    bestSeller?: boolean;
    variants?: any[];
    isTrending?: boolean;
    displayOrder?: number;
    createdAt: string;
    updatedAt: string;
}

export interface Store {
    id: string;
    _id?: string;
    name: string;
    address: string;
    image?: string;
    isActive: boolean;
    status?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Store1 {
    id: string;
    name: string;
    image?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    jwt?: string;
    token?: string;
    accessToken?: string;
    user?: {
        id: string;
        email: string;
        name: string;
        role: 'ADMIN';
    };
}
