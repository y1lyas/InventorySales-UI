export class CategoryController {
    constructor(view, categoryService, productService, state) {
        this.view = view;
        this.categoryService = categoryService;
        this.productService = productService;
        this.state = state;
        this.busyTimerId = null;
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

    async loadCategories(showBusyFeedback = false) {
        if (showBusyFeedback) {
            this.startLoadingFeedback(this.state.categories?.length > 0);
        }

        try {
            const result = await this.categoryService.getCategories({
                page: this.state.ui.categoriesPage,
                size: this.state.ui.categoriesPageSize
            });

            if (!result.categories.length && this.state.ui.categoriesPage > 1) {
                this.state.ui.categoriesPage = 1;
                return await this.loadCategories();
            }

            this.state.categories = result.categories;
            this.state.categoriesPagination = result.pagination;
            this.state.ui.categoriesPage = result.pagination.currentPage;
            this.state.loaded.categories = true;
        } finally {
            if (showBusyFeedback) {
                this.stopLoadingFeedback();
            }
        }
    }

    async loadProducts() {
        this.state.products = await this.productService.getAllProducts({ isDeleted: false });
        this.state.loaded.products = true;
    }

    render() {
        const allCategories = this.state.categories;
        const getCategoryId = (category) => this.categoryService.getCategoryId(category);

        this.view.renderCategoryList(allCategories, getCategoryId);
        this.view.renderCategoryOptions(allCategories, getCategoryId);
        this.view.assignCategoryPicker?.refreshOptions();

        this.view.renderCategoryPagination(this.state.categoriesPagination, (nextPage) => {
            this.state.ui.categoriesPage = nextPage;
            this.loadCategories(true).then(() => this.render());
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
            this.state.ui.categoriesPage = 1;
            this.state.loaded.allCategories = false;
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

    startLoadingFeedback(hasVisibleRows) {
        this.stopLoadingFeedback();

        if (!hasVisibleRows) {
            return;
        }

        this.busyTimerId = window.setTimeout(() => {
            this.view.setTableBusy?.(true);
        }, 200);
    }

    stopLoadingFeedback() {
        if (this.busyTimerId) {
            window.clearTimeout(this.busyTimerId);
            this.busyTimerId = null;
        }

        this.view.setTableBusy?.(false);
    }
}
