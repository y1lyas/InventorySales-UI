export class DashboardController {
    constructor(view, productService, state, options) {
        this.view = view;
        this.productService = productService;
        this.state = state;
        this.isTrashMode = options?.isTrashMode === true;
    }

    async loadProducts(forceReload) {
        const stateKey = this.isTrashMode ? 'deletedProducts' : 'products';
        const loadingKey = this.isTrashMode ? 'isLoadingDeletedProducts' : 'isLoadingProducts';
        const loadedKey = this.isTrashMode ? 'deletedProducts' : 'products';

        if (!forceReload && this.state.loaded[loadedKey]) {
            this.render();
            return;
        }

        this.state.ui[loadingKey] = true;
        this.view.showLoading();

        try {
            const products = await this.productService.getAllProducts({ isDeleted: this.isTrashMode });
            this.state[stateKey] = products;
            this.state.loaded[loadedKey] = true;
        } catch (error) {
            this.view.showError(error.message || 'Unable to load products');
        } finally {
            this.state.ui[loadingKey] = false;
            this.render();
        }
    }

    render() {
        if (this.state.ui[this.isTrashMode ? 'isLoadingDeletedProducts' : 'isLoadingProducts']) {
            this.view.showLoading();
            return;
        }

        const filteredProducts = this.getFilteredProducts();
        const pageKey = this.isTrashMode ? 'trashPage' : 'dashboardPage';
        const pageData = this.productService.paginateProducts(filteredProducts, this.state.ui[pageKey]);

        this.state.ui[pageKey] = pageData.pagination.currentPage;

        if (!filteredProducts.length) {
            this.view.showEmptyState(this.getEmptyStateOptions());
            return;
        }

        this.view.renderProducts(pageData.products);
        this.view.renderPagination(pageData.pagination, (nextPage) => {
            this.state.ui[pageKey] = nextPage;
            this.render();
        });
        this.view.showTable();
    }

    setSearchTerm(searchTerm) {
        if (this.isTrashMode) {
            this.state.ui.trashSearchTerm = String(searchTerm || '').trim();
            this.state.ui.trashPage = 1;
        } else {
            this.state.ui.searchTerm = String(searchTerm || '').trim();
            this.state.ui.dashboardPage = 1;
        }

        this.render();
    }

    setCategoryId(categoryId) {
        this.state.ui.categoryId = categoryId || '';
        this.state.ui.dashboardPage = 1;
        this.render();
    }

    getFilteredProducts() {
        const source = this.isTrashMode ? this.state.deletedProducts : this.state.products;

        return this.productService.filterProducts(source, {
            searchTerm: this.isTrashMode ? this.state.ui.trashSearchTerm : this.state.ui.searchTerm,
            categoryId: this.isTrashMode ? '' : this.state.ui.categoryId
        });
    }

    getEmptyStateOptions() {
        if (this.isTrashMode) {
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

        if (this.state.ui.searchTerm || this.state.ui.categoryId) {
            return {
                title: 'No products found',
                text: 'No products match the current search or category filter.',
                buttonText: 'Clear filters',
                buttonAction: () => this.clearFilters()
            };
        }

        return {
            title: 'No products',
            text: 'Add your first product to get started.'
        };
    }

    clearSearch() {
        this.setSearchTerm('');

        const input = document.getElementById(this.isTrashMode ? 'trash-search' : 'product-search');
        if (input) {
            input.value = '';
        }
    }

    clearFilters() {
        this.state.ui.searchTerm = '';
        this.state.ui.categoryId = '';
        this.state.ui.dashboardPage = 1;

        const searchInput = document.getElementById('product-search');
        const categoryFilter = document.getElementById('category-filter');

        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = '';

        this.render();
    }
}
