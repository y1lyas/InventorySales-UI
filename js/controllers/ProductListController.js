export class ProductListController {
    constructor(view, productService, state, options) {
        this.view = view;
        this.productService = productService;
        this.state = state;
        this.isDeletedList = options?.isDeletedList === true;
        this.onCreateProduct = options?.onCreateProduct || null;
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
                isDeleted: this.isDeletedList
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

        this.view.renderProducts(pageData.products);
        this.view.renderPagination(pageData.pagination, (nextPage) => {
            this.state.ui[pageKey] = nextPage;
            this.render();
        });
        this.view.showTable();
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
        this.state.ui.productsPage = 1;

        const searchInput = document.getElementById('product-search');
        const categoryFilter = document.getElementById('category-filter');

        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = '';

        this.render();
    }

    getFilteredProducts() {
        return this.productService.filterProducts(this.state[this.getStateKey()], {
            searchTerm: this.isDeletedList ? this.state.ui.trashSearchTerm : this.state.ui.productSearchTerm,
            categoryId: this.isDeletedList ? '' : this.state.ui.productCategoryId
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

        if (this.state.ui.productSearchTerm || this.state.ui.productCategoryId) {
            return {
                icon: 'bi-search',
                title: 'No products found',
                text: 'No products match the current search or category filter.',
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
