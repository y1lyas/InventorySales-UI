
const API_BASE_URL = 'https://localhost:7298/api';

const CategoryApi = {
    async GetAllCategories() {
        const response = await fetch(`${API_BASE_URL}/categories/GetAll`);
        if (!response.ok) throw new Error('Failed to load categories');
        return await response.json();
    }
};

window.CategoryApi = CategoryApi;
export default CategoryApi;