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
        this.view.renderCategories(this.state.categories, (category) => this.categoryService.getCategoryId(category));
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
