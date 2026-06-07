export class MovementController {
    constructor(view, productService, stockMovementService, state) {
        this.view = view;
        this.productService = productService;
        this.stockMovementService = stockMovementService;
        this.state = state;
        this.stockMovementsRequestId = 0;
        this.busyTimerId = null;
    }

    async initialize() {
        await this.loadProducts();
        await this.loadStockMovements();
    }

    async loadProducts() {
        if (this.state.loaded.movementProducts) {
            this.view.renderProductOptions(this.state.movement.products);
            return;
        }

        try {
            this.state.movement.products = await this.productService.getAllProducts({ isDeleted: false });
            this.state.loaded.movementProducts = true;
            this.view.renderProductOptions(this.state.movement.products);
        } catch (error) {
            this.view.renderProductOptions([]);
            console.error(error);
        }
    }

    async loadStockMovements() {
        const requestId = ++this.stockMovementsRequestId;
        const requestOptions = {
            page: this.state.movement.movementsPage,
            size: this.state.movement.movementsPageSize,
            search: this.state.movement.movementSearchTerm,
            productId: this.state.movement.productFilterId,
            movementType: this.state.movement.movementTypeFilter,
            movementReason: this.state.movement.movementReasonFilter,
            startDate: this.state.movement.movementStartDate,
            endDate: this.state.movement.movementEndDate,
            minQuantity: this.state.movement.movementMinQuantity,
            maxQuantity: this.state.movement.movementMaxQuantity
        };

        this.startLoadingFeedback(this.state.movement.stockMovements?.length > 0);

        try {
            const movements = await this.stockMovementService.getAllStockMovements(requestOptions);

            if (requestId !== this.stockMovementsRequestId) {
                return;
            }

            if (!movements.movements.length && this.state.movement.movementsPage > 1) {
                this.state.movement.movementsPage = 1;
                await this.loadStockMovements();
                return;
            }

            this.state.movement.stockMovements = movements.movements;
            this.state.movement.movementsPagination = movements.pagination;
            this.state.movement.movementsPage = movements.pagination.currentPage;

            this.view.renderMovements(movements.movements, this.getEmptyStateOptions());
            this.view.renderPagination(movements.pagination, (nextPage) => {
                this.state.movement.movementsPage = nextPage;
                this.loadStockMovements();
            });
        } catch (error) {
            if (requestId !== this.stockMovementsRequestId) {
                return;
            }

            this.state.movement.stockMovements = [];
            this.view.showError(error.message || 'Unable to load stock movements');
        } finally {
            if (requestId === this.stockMovementsRequestId) {
                this.stopLoadingFeedback();
            }
        }
    }

    setProductFilter(productId) {
        this.state.movement.productFilterId = productId || '';
        this.state.movement.movementsPage = 1;
        this.view.setSelectedProduct(this.state.movement.productFilterId);
        this.loadStockMovements();
    }

    setSearchTerm(searchTerm) {
        this.state.movement.movementSearchTerm = String(searchTerm || '').trim();
        this.state.movement.movementsPage = 1;
        this.loadStockMovements();
    }

    setMovementTypeFilter(movementType) {
        this.state.movement.movementTypeFilter = movementType ?? '';
        this.state.movement.movementsPage = 1;
        this.view.setSelectedMovementType(this.state.movement.movementTypeFilter);
        this.loadStockMovements();
    }

    clearFilters() {
        this.state.movement.movementSearchTerm = '';
        this.state.movement.productFilterId = '';
        this.state.movement.movementTypeFilter = '';
        this.state.movement.movementReasonFilter = '';
        this.state.movement.movementStartDate = '';
        this.state.movement.movementEndDate = '';
        this.state.movement.movementMinQuantity = '';
        this.state.movement.movementMaxQuantity = '';
        this.state.movement.movementsPage = 1;

        this.view.setSearchTerm('');
        this.view.setSelectedProduct('');
        this.view.setSelectedMovementType('');
        this.view.setAdvancedFilterValues(this.getAdvancedFilters());
        this.loadStockMovements();
    }

    setAdvancedFilters(filters = {}) {
        this.state.movement.movementReasonFilter = this.normalizeFilterValue(filters.movementReason);
        this.state.movement.movementStartDate = this.normalizeFilterValue(filters.startDate);
        this.state.movement.movementEndDate = this.normalizeFilterValue(filters.endDate);
        this.state.movement.movementMinQuantity = this.normalizeFilterValue(filters.minQuantity);
        this.state.movement.movementMaxQuantity = this.normalizeFilterValue(filters.maxQuantity);
        this.state.movement.movementsPage = 1;
        this.loadStockMovements();
    }

    normalizeFilterValue(value) {
        return value === undefined || value === null ? '' : String(value).trim();
    }

    getAdvancedFilters() {
        return {
            movementReason: this.state.movement.movementReasonFilter,
            startDate: this.state.movement.movementStartDate,
            endDate: this.state.movement.movementEndDate,
            minQuantity: this.state.movement.movementMinQuantity,
            maxQuantity: this.state.movement.movementMaxQuantity
        };
    }

    hasAdvancedFilters() {
        return Object.values(this.getAdvancedFilters()).some((value) => value !== '');
    }

    getEmptyStateOptions() {
        if (this.state.movement.productFilterId) {
            return {
                title: 'There are no movements for this product',
                text: 'Try selecting another product or clear filters to see all stock movements.',
                buttonText: 'Clear filters',
                buttonAction: () => this.clearFilters()
            };
        }

        if (
            this.state.movement.movementSearchTerm ||
            this.state.movement.movementTypeFilter ||
            this.hasAdvancedFilters()
        ) {
            return {
                title: 'No stock movements found',
                text: 'No stock movements match the current search or filters.',
                buttonText: 'Clear filters',
                buttonAction: () => this.clearFilters()
            };
        }

        return {
            title: 'No stock movements',
            text: 'Stock changes will appear here after inventory is adjusted.'
        };
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
