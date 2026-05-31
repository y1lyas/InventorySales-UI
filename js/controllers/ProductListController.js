export class ProductListController {
    constructor(view, productService, state, options) {
        this.view = view;
        this.productService = productService;
        this.state = state;
        this.isDeletedList = options?.isDeletedList === true;
        this.onCreateProduct = options?.onCreateProduct || null;
        this.onUpdateProductName = options?.onUpdateProductName || null;
        this.editingProductId = null;
    }
    
    async loadProducts(forceReload = false) {
        const stateKey = this.getStateKey();
        const loadingKey = this.getLoadingKey();
        const loadedKey = this.getLoadedKey();

        if (!forceReload && this.state.loaded[loadedKey]) {
            this.render();
            return;
        }

        this.state.ui[loadingKey] = true;
        this.view.showLoading();

        try {
            this.state[stateKey] = await this.productService.getAllProducts({
                isDeleted: this.isDeletedList,
                categoryId: this.isDeletedList ? '' : this.state.ui.productCategoryId,
                searchTerm: this.isDeletedList ? this.state.ui.trashSearchTerm : this.state.ui.productSearchTerm,
                filters: this.isDeletedList ? {} : this.getAdvancedFilters()
            });
            this.state.loaded[loadedKey] = true;
        } catch (error) {
            this.view.showError(error.message || 'Unable to load products');
        } finally {
            this.state.ui[loadingKey] = false;
            this.render();
        }
    }

    render() {
        if (this.state.ui[this.getLoadingKey()]) {
            this.view.showLoading();
            return;
        }

        const filteredProducts = this.getFilteredProducts();
        const pageKey = this.getPageKey();
        const pageData = this.productService.paginateProducts(filteredProducts, this.state.ui[pageKey]);

        this.state.ui[pageKey] = pageData.pagination.currentPage;

        if (!filteredProducts.length) {
            this.view.showEmptyState(this.getEmptyStateOptions());
            return;
        }

        this.view.renderProducts(pageData.products, {
            editingProductId: this.isDeletedList ? null : this.editingProductId
        });
        this.view.renderPagination(pageData.pagination, (nextPage) => {
            this.state.ui[pageKey] = nextPage;
            this.editingProductId = null;
            this.render();
        });
        this.view.showTable();
    }

    async handleEditAction(productId) {
        if (this.isDeletedList || !productId) {
            return;
        }

        if (String(this.editingProductId) !== String(productId)) {
            this.editingProductId = productId;
            this.render();
            this.view.focusInlineProductName?.(productId);
            return;
        }

        await this.saveInlineName(productId);
    }

    async saveInlineName(productId) {
        if (typeof this.onUpdateProductName !== 'function') {
            return;
        }

        const newName = this.view.getInlineProductName?.(productId);
        const updated = await this.onUpdateProductName(productId, newName);

        if (updated) {
            this.editingProductId = null;
            this.render();
        } else {
            this.view.focusInlineProductName?.(productId);
        }
    }

    cancelInlineEdit() {
        if (!this.editingProductId) {
            return;
        }

        this.editingProductId = null;
        this.render();
    }

    setSearchTerm(searchTerm) {
        if (this.isDeletedList) {
            this.state.ui.trashSearchTerm = String(searchTerm || '').trim();
            this.state.ui.trashPage = 1;
        } else {
            this.state.ui.productSearchTerm = String(searchTerm || '').trim();
            this.state.ui.productsPage = 1;
        }

        this.render();
    }

    setCategoryId(categoryId) {
        if (this.isDeletedList) {
            return;
        }

        this.state.ui.productCategoryId = categoryId || '';
        this.state.ui.productsPage = 1;
        this.render();
    }

    clearSearch() {
        this.setSearchTerm('');

        const input = document.getElementById(this.isDeletedList ? 'trash-search' : 'product-search');
        if (input) {
            input.value = '';
        }
    }

    clearFilters() {
        this.state.ui.productSearchTerm = '';
        this.state.ui.productCategoryId = '';
        this.setAdvancedFilterState({});
        this.state.ui.productsPage = 1;

        const searchInput = document.getElementById('product-search');
        const categoryFilter = document.getElementById('category-filter');

        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = '';
        this.view.setCategoryFilterValue?.('');
        this.view.setAdvancedFilterValues?.(this.getAdvancedFilters());

        this.state.loaded.products = false;
        this.loadProducts(true);
    }

    setAdvancedFilters(filters = {}) {
        if (this.isDeletedList) {
            return;
        }

        this.setAdvancedFilterState(filters);
        this.state.ui.productsPage = 1;
        this.state.loaded.products = false;
        this.loadProducts(true);
    }

    setAdvancedFilterState(filters = {}) {
        this.state.ui.productMinStock = this.normalizeFilterValue(filters.minStock);
        this.state.ui.productMaxStock = this.normalizeFilterValue(filters.maxStock);
        this.state.ui.productMinPrice = this.normalizeFilterValue(filters.minPrice);
        this.state.ui.productMaxPrice = this.normalizeFilterValue(filters.maxPrice);
        this.state.ui.productStartDate = this.normalizeFilterValue(filters.startDate);
        this.state.ui.productEndDate = this.normalizeFilterValue(filters.endDate);
    }

    normalizeFilterValue(value) {
        return value === undefined || value === null ? '' : String(value).trim();
    }

    getAdvancedFilters() {
        return {
            minStock: this.state.ui.productMinStock,
            maxStock: this.state.ui.productMaxStock,
            minPrice: this.state.ui.productMinPrice,
            maxPrice: this.state.ui.productMaxPrice,
            startDate: this.state.ui.productStartDate,
            endDate: this.state.ui.productEndDate
        };
    }

    hasAdvancedFilters() {
        return Object.values(this.getAdvancedFilters()).some((value) => value !== '');
    }

    getFilteredProducts() {
        return this.productService.filterProducts(this.state[this.getStateKey()], {
            searchTerm: this.isDeletedList ? this.state.ui.trashSearchTerm : this.state.ui.productSearchTerm,
            categoryId: this.isDeletedList ? '' : this.state.ui.productCategoryId,
            ...(this.isDeletedList ? {} : this.getAdvancedFilters())
        });
    }

    getEmptyStateOptions() {
        if (this.isDeletedList) {
            if (this.state.ui.trashSearchTerm) {
                return {
                    title: 'No removed products found',
                    text: 'No removed products match the current search.',
                    buttonText: 'Clear search',
                    buttonAction: () => this.clearSearch(),
                    isSearch: true
                };
            }

            return {
                title: 'Bin is empty',
                text: 'There are no removed products to display.'
            };
        }

        if (this.state.ui.productSearchTerm || this.state.ui.productCategoryId || this.hasAdvancedFilters()) {
            return {
                icon: 'bi-search',
                title: 'No products found',
                text: 'No products match the current filters.',
                buttonText: 'Clear filters',
                buttonAction: () => this.clearFilters()
            };
        }

        return {
            title: 'No products',
            text: 'Add your first product to get started.',
            buttonText: 'Create Your First Product',
            buttonAction: this.onCreateProduct
        };
    }

    getStateKey() {
        return this.isDeletedList ? 'deletedProducts' : 'products';
    }

    getLoadedKey() {
        return this.isDeletedList ? 'deletedProducts' : 'products';
    }

    getLoadingKey() {
        return this.isDeletedList ? 'isLoadingDeletedProducts' : 'isLoadingProducts';
    }

    getPageKey() {
        return this.isDeletedList ? 'trashPage' : 'productsPage';
    }
}
