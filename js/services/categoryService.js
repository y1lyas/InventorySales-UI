import { extractCollection } from '../utils/apiResponse.js';


export class CategoryService {
    constructor(categoryApi) {
        this.categoryApi = categoryApi;
    }

    async getCategories() {
        const data = await this.categoryApi.getAll();
        return extractCollection(data);
    }

    async createCategory(data) {
        return await this.categoryApi.create({
            name: data.name,
            description: data.description
        });
    }

    async assignProduct(productId, categoryId) {
        return await this.categoryApi.assignProduct({ productId, categoryId });
    }

    async unassignProduct(productId) {
        return await this.categoryApi.unassignProduct({ productId });
    }

    validateCategory(data) {
        if (!data.name || data.name.trim().length < 2) {
            return { valid: false, error: 'Invalid category name' };
        }

        if (data.description && data.description.length > 300) {
            return { valid: false, error: 'Description too long' };
        }

        return { valid: true };
    }

    validateAssignment(productId, categoryId) {
        if (!productId) {
            return { valid: false, error: 'Please select a product' };
        }

        if (!categoryId) {
            return { valid: false, error: 'Please select a category' };
        }

        return { valid: true };
    }

    validateUnassign(productId) {
        if (!productId) {
            return { valid: false, error: 'Please select a product' };
        }

        return { valid: true };
    }

    getCategoryId(item) {
        return item?.id ?? item?.categoryId ?? item?.categoryGuid ?? item?._id ?? '';
    }
}

