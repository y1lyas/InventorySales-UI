import { API_BASE_URL } from './apiConfig.js';

export const productApi = {
    async getAll(page, size, search, isDeleted, categoryId) {
        let url = `${API_BASE_URL}/products/GetAll?PageNumber=${page}&PageSize=${size}&IsDeleted=${isDeleted === true}&SearchTerm=${encodeURIComponent(search || '')}`;

        if (categoryId !== null && categoryId !== undefined && categoryId !== '') {
            url += `&categoryId=${categoryId}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        return await response.json();
    },

    async create(productData) {
        const response = await fetch(`${API_BASE_URL}/products/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to create product');
        }

        return await response.json();
    },

    async delete(productId) {
        const response = await fetch(`${API_BASE_URL}/products/delete?productId=${productId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete product');
        }
    },
     async getStockMovement(productId) {
        const response = await fetch(`${API_BASE_URL}/products/stock-movements?productId=${productId}`);
   
   const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch stock movements');
        }

        return await response.json();
    }
};
