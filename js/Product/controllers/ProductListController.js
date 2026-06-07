export class ProductListController {
    constructor(view, productService, state, options) {
        this.view = view;
        this.productService = productService;
        this.state = state;
        this.isDeletedList = options?.isDeletedList === true;
        this.onCreateProduct = options?.onCreateProduct || null;
        this.onUpdateProductName = options?.onUpdateProductName || null;
        this.editingProductId = null;
        this.busyTimerId = null;
    }
    
    async loadProducts(forceReload = false) {
        const stateKey = this.getStateKey();
        const loadingKey = this.getLoadingKey();
        const loadedKey = this.getLoadedKey();
        const pageKey = this.getPageKey();
        const paginationKey = this.getPaginationKey();

        if (!forceReload && this.state.loaded[loadedKey]) {
            this.render();
            return;
        }

        this.state.ui[loadingKey] = true;
        this.startLoadingFeedback(this.state[stateKey]?.length > 0);

        try {
            const result = await this.productService.getProductsPage({
                page: this.state.ui[pageKey],
                size: this.state.ui.pageSize,
                isDeleted: this.isDeletedList,
                categoryId: this.isDeletedList ? '' : this.state.ui.productCategoryId,
                searchTerm: this.isDeletedList ? this.state.ui.trashSearchTerm : this.state.ui.productSearchTerm,
                filters: this.isDeletedList ? {} : this.getAdvancedFilters()
            });

            if (!result.products.length && this.state.ui[pageKey] > 1) {
                this.state.ui[pageKey] = 1;
                return await this.loadProducts(true);
            }

            this.state[stateKey] = result.products;
            this.state[paginationKey] = result.pagination;
            this.state.ui[pageKey] = result.pagination.currentPage;
            this.state.loaded[loadedKey] = true;
        } catch (error) {
            this.view.showError(error.message || 'Unable to load products');
        } finally {
            this.stopLoadingFeedback();
            this.state.ui[loadingKey] = false;
            this.render();
        }
    }

    render() {
        if (this.state.ui[this.getLoadingKey()]) {
            this.view.showLoading();
            return;
        }

        const products = this.state[this.getStateKey()];
        const pagination = this.state[this.getPaginationKey()];

        if (!products.length) {
            this.view.showEmptyState(this.getEmptyStateOptions());
            return;
        }

        this.view.renderProducts(products, {
            editingProductId: this.isDeletedList ? null : this.editingProductId
        });
        this.view.renderPagination(pagination, (nextPage) => {
            this.state.ui[this.getPageKey()] = nextPage;
            this.editingProductId = null;
            this.loadProducts(true);
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

    async setSearchTerm(searchTerm) {
        if (this.isDeletedList) {
            this.state.ui.trashSearchTerm = String(searchTerm || '').trim();
            this.state.ui.trashPage = 1;
        } else {
            this.state.ui.productSearchTerm = String(searchTerm || '').trim();
            this.state.ui.productsPage = 1;
        }

        this.state.loaded[this.getLoadedKey()] = false;
        await this.loadProducts(true);
    }

    async setCategoryId(categoryId) {
        if (this.isDeletedList) {
            return;
        }

        this.state.ui.productCategoryId = categoryId || '';
        this.state.ui.productsPage = 1;
        this.state.loaded.products = false;
        await this.loadProducts(true);
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

    getPaginationKey() {
        return this.isDeletedList ? 'deletedProductPagination' : 'productPagination';
    }

    startLoadingFeedback(hasVisibleRows) {
        this.stopLoadingFeedback();

        if (!hasVisibleRows) {
            this.view.showLoading();
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
