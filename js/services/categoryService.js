export class CategoryService {
    constructor(categoryApi) {
        this.categoryApi = categoryApi;
    }

    async getCategories() {
        return await this.categoryApi.getAll();
    }
}
