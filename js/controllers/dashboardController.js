export class DashboardController {
    constructor(view, productService, stockMovementService, state) {
        this.view = view;
        this.productService = productService;
        this.stockMovementService = stockMovementService;
        this.state = state;
        this.stockMovementsRequestId = 0;
    }

    async initialize() {
        await this.loadProducts();
        await this.loadStockMovements();
    }

    async loadProducts() {
        if (this.state.loaded.dashboardProducts) {
            this.view.renderProductOptions(this.state.dashboard.products);
            return;
        }

        try {
            this.state.dashboard.products = await this.productService.getAllProducts({ isDeleted: false });
            this.state.loaded.dashboardProducts = true;
            this.view.renderProductOptions(this.state.dashboard.products);
        } catch (error) {
            this.view.renderProductOptions([]);
            console.error(error);
        }
    }

    async loadStockMovements() {
        const requestId = ++this.stockMovementsRequestId;
        const requestOptions = {
            page: this.state.dashboard.movementsPage,
            size: this.state.dashboard.movementsPageSize,
            search: this.state.dashboard.movementSearchTerm,
            productId: this.state.dashboard.productFilterId,
            movementType: this.state.dashboard.movementTypeFilter
        };

        this.view.showLoading();

        try {
            const movements = await this.stockMovementService.getAllStockMovements(requestOptions);

            if (requestId !== this.stockMovementsRequestId) {
                return;
            }

            if (!movements.movements.length && this.state.dashboard.movementsPage > 1) {
                this.state.dashboard.movementsPage = 1;
                await this.loadStockMovements();
                return;
            }

            this.state.dashboard.stockMovements = movements.movements;
            this.state.dashboard.movementsPagination = movements.pagination;
            this.state.dashboard.movementsPage = movements.pagination.currentPage;

            this.view.renderMovements(movements.movements);
            this.view.renderPagination(movements.pagination, (nextPage) => {
                this.state.dashboard.movementsPage = nextPage;
                this.loadStockMovements();
            });
        } catch (error) {
            if (requestId !== this.stockMovementsRequestId) {
                return;
            }

            this.state.dashboard.stockMovements = [];
            this.view.showError(error.message || 'Unable to load stock movements');
        }
    }

    setProductFilter(productId) {
        this.state.dashboard.productFilterId = productId || '';
        this.state.dashboard.movementsPage = 1;
        this.view.setSelectedProduct(this.state.dashboard.productFilterId);
        this.loadStockMovements();
    }

    setSearchTerm(searchTerm) {
        this.state.dashboard.movementSearchTerm = String(searchTerm || '').trim();
        this.state.dashboard.movementsPage = 1;
        this.loadStockMovements();
    }

    setMovementTypeFilter(movementType) {
        this.state.dashboard.movementTypeFilter = movementType ?? '';
        this.state.dashboard.movementsPage = 1;
        this.view.setSelectedMovementType(this.state.dashboard.movementTypeFilter);
        this.loadStockMovements();
    }
}
