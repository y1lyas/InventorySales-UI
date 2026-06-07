import { API_BASE_URL } from '../../apiConfig.js';

export const categoryApi = {
    async getAll(page = 1, size = 10) {
        const params = new URLSearchParams();
        params.append('PageNumber', page);
        params.append('PageSize', size);

        const response = await fetch(`${API_BASE_URL}/categories/GetAll?${params.toString()}`);

        if (!response.ok) {
            throw new Error('Failed to load categories');
        }

        const responseText = await response.text();
        return responseText ? JSON.parse(responseText) : null;
    },

    async create(payload) {
        const response = await fetch(`${API_BASE_URL}/categories/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to create category');
        }

        return await response.json();
    },

    async assignProduct(payload) {
        const response = await fetch(`${API_BASE_URL}/categories/assign`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to assign category');
        }
    },

    async unassignProduct(payload) {
        const response = await fetch(`${API_BASE_URL}/categories/unassign`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to unassign category');
        }
    }
};
