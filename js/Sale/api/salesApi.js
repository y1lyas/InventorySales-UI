import { API_BASE_URL } from '../../apiConfig.js';

export const salesApi = {
    async getAll(page = 1, size = 12, filters = {}) {
        const params = new URLSearchParams();
        params.append('PageNumber', page);
        params.append('PageSize', size);

        if (filters.startDate) {
            params.append('StartDate', filters.startDate);
        }
        if (filters.endDate) {
            params.append('EndDate', filters.endDate);
        }
        if (filters.minAmount) {
            params.append('MinAmount', filters.minAmount);
        }
        if (filters.maxAmount) {
            params.append('MaxAmount', filters.maxAmount);
        }
        if (filters.saleId) {
            params.append('SaleId', filters.saleId);
        }

        const url = `${API_BASE_URL}/sales/sales?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch sales');
        }

        return await response.json();
    },

    async getById(saleId) {
        const response = await fetch(`${API_BASE_URL}/sales/sales/${encodeURIComponent(saleId)}`);

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error('Failed to fetch sale details');
        }

        return await response.json();
    },

    async create(payload) {
        const url = `${API_BASE_URL}/sales/sales`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to create sale');
        }

        return await response.json();
    }
};
