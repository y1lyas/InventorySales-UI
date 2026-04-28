import { API_BASE_URL } from './apiConfig.js';

export const categoryApi = {
    async getAll() {
        const response = await fetch(`${API_BASE_URL}/categories/GetAll`);

        if (!response.ok) {
            throw new Error('Failed to load categories');
        }

        return await response.json();
    }
};
