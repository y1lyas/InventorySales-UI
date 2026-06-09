import { API_BASE_URL } from '../../apiConfig.js';

export const dashboardApi = {
    async get() {
        const response = await fetch(`${API_BASE_URL}/dashboard`);

        if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
        }

        return await response.json();
    }
};
