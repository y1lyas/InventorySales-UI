class CategoryService {
    constructor(categoryApi) {
        this.categoryApi = categoryApi;
    }

    async getCategories() {
        return await this.categoryApi.GetAllCategories();
    }
}

window.CategoryService = CategoryService;

