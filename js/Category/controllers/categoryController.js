export class CategoryController {
    constructor(view, categoryService, productService, state) {
        this.view = view;
        this.categoryService = categoryService;
        this.productService = productService;
        this.state = state;
    }

    async initialize() {
        this.view.showLoading();

        try {
            await Promise.all([
                this.loadCategories(),
                this.loadProducts()
            ]);
            this.render();
        } catch (error) {
            this.view.showError(error.message || 'Unable to load categories');
        } finally {
            this.view.showContent();
        }
    }

    async loadCategories() {
        this.state.categories = await this.categoryService.getCategories();
        this.state.loaded.categories = true;
    }

    async loadProducts() {
        this.state.products = await this.productService.getAllProducts({ isDeleted: false });
        this.state.loaded.products = true;
    }

    render() {
        const allCategories = this.state.categories;
        const getCategoryId = (category) => this.categoryService.getCategoryId(category);
        const pageSize = this.state.ui.categoriesPageSize;
        const totalPages = Math.max(1, Math.ceil(allCategories.length / pageSize));
        const currentPage = Math.min(Math.max(this.state.ui.categoriesPage, 1), totalPages);

        this.state.ui.categoriesPage = currentPage;

        const startIndex = (currentPage - 1) * pageSize;
        const pageCategories = allCategories.slice(startIndex, startIndex + pageSize);

        this.view.renderCategoryList(pageCategories, getCategoryId);
        this.view.renderCategoryOptions(allCategories, getCategoryId);
        this.view.assignCategoryPicker?.refreshOptions();

        this.view.renderCategoryPagination({ currentPage, totalPages }, (nextPage) => {
            this.state.ui.categoriesPage = nextPage;
            this.render();
        });

        this.view.renderProducts(this.state.products);
    }

    async handleCreate() {
        const formData = this.view.getCreateFormData();
        const validation = this.categoryService.validateCategory(formData);

        if (!validation.valid) {
            this.view.showError(validation.error);
            return;
        }

        try {
            await this.categoryService.createCategory(formData);
            this.view.resetCreateForm();
            await this.loadCategories();
            this.state.ui.categoriesPage = 1;
            this.render();
            this.view.showSuccess('Category created successfully.');
        } catch (error) {
            this.view.showError(error.message || 'Failed to create category');
        }
    }

    async handleAssign() {
        const formData = this.view.getAssignFormData();
        const validation = this.categoryService.validateAssignment(formData.productId, formData.categoryId);

        if (!validation.valid) {
            this.view.showError(validation.error);
            return;
        }

        try {
            await this.categoryService.assignProduct(formData.productId, formData.categoryId);
            this.view.resetAssignForm();
            await this.loadProducts();
            this.render();
            this.view.showSuccess('Category assigned successfully.');
        } catch (error) {
            this.view.showError(error.message || 'Failed to assign category');
        }
    }

    async handleUnassign() {
        const formData = this.view.getUnassignFormData();
        const validation = this.categoryService.validateUnassign(formData.productId);

        if (!validation.valid) {
            this.view.showError(validation.error);
            return;
        }

        try {
            await this.categoryService.unassignProduct(formData.productId);
            this.view.resetUnassignForm();
            await this.loadProducts();
            this.render();
            this.view.showSuccess('Category unassigned successfully.');
        } catch (error) {
            this.view.showError(error.message || 'Failed to unassign category');
        }
    }
}
