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

    async create(payload) {
        const response = await fetch(`${API_BASE_URL}/products/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
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

    async getAllStockMovements({ page = 1, size = 10, search = '', productId = '', movementType = '' } = {}) {
        const params = new URLSearchParams();
        params.append('PageNumber', page);
        params.append('PageSize', size);

        if (productId !== null && productId !== undefined && productId !== '') {
            params.append('productId', productId);
        }

        if (search) {
            params.append('SearchTerm', search);
        }

        if (movementType !== null && movementType !== undefined && movementType !== '') {
            params.append('MovementType', movementType);
        }

        const queryString = params.toString();
        const url = `${API_BASE_URL}/products/stock-movements-all${queryString ? `?${queryString}` : ''}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch stock movements');
        }

        return await response.json();
    },

    async getStockMovements(productId) {
        const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(productId)}/stock-movements`);
        if (!response.ok) {
            throw new Error('Failed to fetch stock movements');
        }

        return await response.json();
    },

    async increaseStock(payload) {
        const response = await fetch(`${API_BASE_URL}/products/increase-stock`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Failed to increase stock');
        }
    },

    async decreaseStock(payload) {
        const response = await fetch(`${API_BASE_URL}/products/decrease-stock`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Failed to decrease stock');
        }
    },
    async adjustPrice(payload) {
        const response = await fetch(`${API_BASE_URL}/products/price`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

         if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to adjust price');
        }
    }
};
