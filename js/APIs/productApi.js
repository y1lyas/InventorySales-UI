import { API_BASE_URL } from './apiConfig.js';

export const productApi = {
    async getAll(page, size, search, isDeleted, categoryId, filters = {}) {
        const params = new URLSearchParams();
        params.append('PageNumber', page);
        params.append('PageSize', size);
        params.append('IsDeleted', isDeleted === true);
        params.append('SearchTerm', search || '');

        if (categoryId) {
            params.append('categoryId', categoryId);
        }

        this.appendOptionalParams(params, filters, [
            'MinStock',
            'MaxStock',
            'MinPrice',
            'MaxPrice',
            'StartDate',
            'EndDate'
        ]);

        const url = `${API_BASE_URL}/products/GetAll?${params.toString()}`;

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

    async getAllStockMovements({
        page = 1,
        size = 10,
        search = '',
        productId = '',
        movementType = '',
        movementReason = '',
        startDate = '',
        endDate = '',
        minQuantity = '',
        maxQuantity = ''
    } = {}) {
        const params = new URLSearchParams();
        params.append('PageNumber', page);
        params.append('PageSize', size);

        if (productId) {
            params.append('productId', productId);
        }

        if (search) {
            params.append('SearchTerm', search);
        }

        if (movementType) {
            params.append('MovementType', movementType);
        }

        this.appendOptionalParams(params, {
            MovementReason: movementReason,
            StartDate: startDate,
            EndDate: endDate,
            MinQuantity: minQuantity,
            MaxQuantity: maxQuantity
        }, [
            'MovementReason',
            'StartDate',
            'EndDate',
            'MinQuantity',
            'MaxQuantity'
        ]);

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
    },

    async updateName(payload) {
        const response = await fetch(`${API_BASE_URL}/products/name`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to update product name');
        }
    },

    appendOptionalParams(params, source, keys) {
        keys.forEach((key) => {
            const value = source?.[key] ?? source?.[key.charAt(0).toLowerCase() + key.slice(1)];

            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value);
            }
        });
    }
};
