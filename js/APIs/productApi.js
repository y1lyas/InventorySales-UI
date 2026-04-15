const API_BASE_URL = 'https://localhost:7298/api';

const ProductApi = {
    async getAll(page = 1, size = 10, search = "", isDeleted = false) {
        const url = `${API_BASE_URL}/products/GetAll?&IsDeleted=${isDeleted}&PageNumber=${page}&PageSize=${size}&SearchTerm=${encodeURIComponent(search)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch products');
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

    async delete(productId){
        const response = await fetch(`${API_BASE_URL}/products/delete/${productId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete product');
    },
};

window.ProductApi = ProductApi;