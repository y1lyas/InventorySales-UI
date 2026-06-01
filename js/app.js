import { state } from './state/state.js';
import { productApi } from './Product/api/productApi.js';
import { categoryApi } from './Category/api/categoryApi.js';
import { salesApi } from './Sale/api/salesApi.js';
import { ProductService } from './Product/services/productService.js';
import { CategoryService } from './Category/services/categoryService.js';
import { StockMovementService } from './Product/services/stockMovementService.js';
import { SaleService } from './Sale/services/saleService.js';
import { ProductListController } from './Product/controllers/ProductListController.js';
import { ProductController } from './Product/controllers/ProductController.js';
import { MovementController } from './Product/controllers/movementController.js';
import { CategoryController } from './Category/controllers/categoryController.js';
import { SaleListController } from './Sale/controllers/SaleListController.js';
import { SaleCreateController } from './Sale/controllers/SaleCreateController.js';
import { ProductListView } from './Product/views/productListView.js';
import { StockMovementsView } from './Product/views/stockMovementsView.js';
import { AddProductView } from './Product/views/addProductView.js';
import { RemovedProductsView } from './Product/views/removedProductsView.js';
import { StockAdjustmentView } from './Product/views/stockAdjustmentView.js';
import { PriceAdjustmentView } from './Product/views/priceAdjustmentView.js';
import { CategoryView } from './Category/views/categoryView.js';
import { SaleListView } from './Sale/views/saleListView.js';
import { SaleDetailsView } from './Sale/views/saleDetailsView.js';
import { SaleCreateView } from './Sale/views/saleCreateView.js';

let productSearchDebounceId = null;
let trashSearchDebounceId = null;
let movementSearchDebounceId = null;

document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    const productService = new ProductService(productApi, state.ui.pageSize);
    const categoryService = new CategoryService(categoryApi);
    const stockMovementService = new StockMovementService(productApi);
    const saleService = new SaleService(salesApi, state.ui.salesPageSize);

    if (document.getElementById('sales-table-body')) {
        initializeSalesPage(saleService);
    }

    if (document.getElementById('sale-product-table-body')) {
        initializeSaleCreatePage(saleService, productService);
    }

    if (document.getElementById('product-list-body')) {
        initializeProductsPage(productService, categoryService);
    }

    if (document.getElementById('stock-movement-table-body')) {
        initializeMovementPage(productService, stockMovementService);
    }

    if (document.getElementById('category-list')) {
        initializeCategoryPage(productService, categoryService);
    }
}

function initializeProductsPage(productService, categoryService) {
    const productListView = new ProductListView();
    const addProductView = new AddProductView();
    const stockAdjustmentView = new StockAdjustmentView();
    const priceAdjustmentView = new PriceAdjustmentView();
    const removedProductsView = new RemovedProductsView();

    const productController = new ProductController(
        addProductView,
        productService,
        categoryService,
        state,
        {
            feedbackView: productListView,
            stockAdjustmentView: stockAdjustmentView,
            priceAdjustmentView: priceAdjustmentView
        }
    );
    const productListController = new ProductListController(productListView, productService, state, {
        onCreateProduct: () => productController.openCreateModal(),
        onUpdateProductName: (productId, newName) => productController.handleNameUpdate(productId, newName)
    });
    const deletedProductListController = new ProductListController(removedProductsView, productService, state, {
        isDeletedList: true
    });

    productController.onProductCreated = function () {
        productListController.render();
    };

    productController.onProductDeleted = function () {
        productListController.render();
        deletedProductListController.render();
    };

    productController.onStockAdjusted = function () {
        productListController.render();
    };

    productController.onPriceAdjusted = function () {
        productListController.render();
    };

    bindProductPageEvents(productListController, deletedProductListController, productController);
    productListView.bindCategoryFilterChange((categoryId) => productListController.setCategoryId(categoryId));
    productListView.renderCategoryFilter(state.categories, (category) => productService.getCategoryId(category));
    productController.loadCategories().then(function () {
        productListView.renderCategoryFilter(state.categories, (category) => productService.getCategoryId(category));
    });
    productListController.loadProducts(false);
    bindTrashActionEvents(productController);
}

function initializeMovementPage(productService, stockMovementService) {
    const movementView = new StockMovementsView();
    const movementController = new MovementController(movementView, productService, stockMovementService, state);

    movementView.bindSaleReferenceCopy(async function (saleReferenceId, button) {
        try {
            await navigator.clipboard.writeText(saleReferenceId);
            movementView.showCopySuccess(button);
        } catch (error) {
            movementView.showCopyError(button);
        }
    });

    document.getElementById('movement-product-select')?.addEventListener('change', function (event) {
        movementController.setProductFilter(event.target.value);
    });

    document.getElementById('movement-type-select')?.addEventListener('change', function (event) {
        movementController.setMovementTypeFilter(event.target.value);
    });

    document.getElementById('movement-search')?.addEventListener('input', function (event) {
        clearTimeout(movementSearchDebounceId);
        movementSearchDebounceId = window.setTimeout(function () {
            movementController.setSearchTerm(event.target.value);
        }, 250);
    });

    document.getElementById('btnToggleMovementFilters')?.addEventListener('click', function () {
        movementView.toggleFilterPanel();
    });

    document.getElementById('btnToggleMovementFilters')?.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            movementView.toggleFilterPanel();
        }
    });

    document.getElementById('movement-filter-apply')?.addEventListener('click', function () {
        movementController.setAdvancedFilters(movementView.getAdvancedFilterValues());
    });

    document.getElementById('movement-filter-clear')?.addEventListener('click', function () {
        movementController.clearFilters();
    });

    movementController.initialize();
}

function initializeCategoryPage(productService, categoryService) {
    const categoryView = new CategoryView();
    const categoryController = new CategoryController(categoryView, categoryService, productService, state);

    document.getElementById('createCategoryForm')?.addEventListener('submit', function (event) {
        event.preventDefault();
        categoryController.handleCreate();
    });

    document.getElementById('assignCategoryForm')?.addEventListener('submit', function (event) {
        event.preventDefault();
        categoryController.handleAssign();
    });

    document.getElementById('unassignCategoryForm')?.addEventListener('submit', function (event) {
        event.preventDefault();
        categoryController.handleUnassign();
    });

    categoryController.initialize();
}

function initializeSalesPage(saleService) {
    const saleListView = new SaleListView();
    const saleDetailsView = new SaleDetailsView();
    const saleListController = new SaleListController(saleListView, saleService, state, {
        detailsView: saleDetailsView
    });

    const saleIdInput = document.getElementById('sales-filter-sale-id');
    const startDateInput = document.getElementById('sales-filter-start-date');
    const endDateInput = document.getElementById('sales-filter-end-date');
    const minAmountInput = document.getElementById('sales-filter-min-amount');
    const maxAmountInput = document.getElementById('sales-filter-max-amount');
    const clearFiltersButton = document.getElementById('sales-filter-clear-button');
    const todayButton = document.getElementById('sales-filter-today');
    const last7Button = document.getElementById('sales-filter-last-7');
    const monthButton = document.getElementById('sales-filter-month');

    if (saleIdInput) {
        saleIdInput.value = state.ui.salesSaleId || '';
        saleIdInput.addEventListener('input', function (event) {
            saleListController.setFilter('saleId', event.target.value.trim());
        });
    }

    if (startDateInput) {
        startDateInput.value = state.ui.salesStartDate || '';
        startDateInput.addEventListener('change', function (event) {
            saleListController.setFilter('startDate', event.target.value);
        });
    }

    if (endDateInput) {
        endDateInput.value = state.ui.salesEndDate || '';
        endDateInput.addEventListener('change', function (event) {
            saleListController.setFilter('endDate', event.target.value);
        });
    }

    let amountDebounceId = null;
    const amountInputHandler = function (filterName, value) {
        clearTimeout(amountDebounceId);
        amountDebounceId = window.setTimeout(function () {
            saleListController.setFilter(filterName, value);
        }, 250);
    };

    if (minAmountInput) {
        minAmountInput.value = state.ui.salesMinAmount || '';
        minAmountInput.addEventListener('input', function (event) {
            amountInputHandler('minAmount', event.target.value);
        });
    }

    if (maxAmountInput) {
        maxAmountInput.value = state.ui.salesMaxAmount || '';
        maxAmountInput.addEventListener('input', function (event) {
            amountInputHandler('maxAmount', event.target.value);
        });
    }

    clearFiltersButton?.addEventListener('click', function () {
        if (saleIdInput) saleIdInput.value = '';
        if (startDateInput) startDateInput.value = '';
        if (endDateInput) endDateInput.value = '';
        if (minAmountInput) minAmountInput.value = '';
        if (maxAmountInput) maxAmountInput.value = '';
        saleListController.clearFilters();
    });

    todayButton?.addEventListener('click', function () {
        if (saleIdInput) saleIdInput.value = '';
        saleListController.setQuickFilter('today');
    });
    last7Button?.addEventListener('click', function () {
        if (saleIdInput) saleIdInput.value = '';
        saleListController.setQuickFilter('last7');
    });
    monthButton?.addEventListener('click', function () {
        if (saleIdInput) saleIdInput.value = '';
        saleListController.setQuickFilter('month');
    });

    document.addEventListener('click', function (event) {
        const detailsButton = event.target.closest('.btn-view-sale-details');
        if (detailsButton) {
            const row = detailsButton.closest('tr');
            const saleId = row?.dataset.saleId;
            if (saleId) {
                saleListController.handleViewDetails(saleId);
            }
        }
    });

    saleListController.initialize();
}

function initializeSaleCreatePage(saleService, productService) {
    const saleCreateView = new SaleCreateView();
    const saleCreateController = new SaleCreateController(saleCreateView, saleService, productService, state);

    saleCreateController.initialize();
}

function bindProductPageEvents(productListController, deletedProductListController, productController) {
    document.getElementById('btnAddProduct')?.addEventListener('click', function () {
        productController.openCreateModal();
    });

    document.getElementById('btnAdjustStock')?.addEventListener('click', function () {
        productController.openAdjustStockModal();
    });

    document.getElementById('btnAdjustPrice')?.addEventListener('click', function () {
        productController.openAdjustPriceModal();
    });

    document.getElementById('btnToggleProductFilters')?.addEventListener('click', function () {
        productListController.view.toggleFilterPanel();
    });

    document.getElementById('btnToggleProductFilters')?.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            productListController.view.toggleFilterPanel();
        }
    });

    document.getElementById('product-filter-apply')?.addEventListener('click', function () {
        productListController.setAdvancedFilters(productListController.view.getAdvancedFilterValues());
    });

    document.getElementById('product-filter-clear')?.addEventListener('click', function () {
        productListController.clearFilters();
    });

    document.getElementById('btnToggleTrash')?.addEventListener('click', function () {
        deletedProductListController.view.show();
        deletedProductListController.loadProducts(false);
    });

    document.getElementById('product-search')?.addEventListener('input', function (event) {
        clearTimeout(productSearchDebounceId);
        productSearchDebounceId = window.setTimeout(function () {
            productListController.setSearchTerm(event.target.value);
        }, 250);
    });

    document.getElementById('trash-search')?.addEventListener('input', function (event) {
        clearTimeout(trashSearchDebounceId);
        trashSearchDebounceId = window.setTimeout(function () {
            deletedProductListController.setSearchTerm(event.target.value);
        }, 250);
    });

    document.getElementById('addProductForm')?.addEventListener('submit', function (event) {
        event.preventDefault();
        productController.handleFormSubmit();
    });

    document.getElementById('adjustStockForm')?.addEventListener('submit', function (event) {
        event.preventDefault();
        productController.handleStockAdjustmentSubmit();
    });

    document.getElementById('adjustPriceForm')?.addEventListener('submit', function (event) {
        event.preventDefault();
        productController.handlePriceAdjustmentSubmit();
    });

    document.addEventListener('click', function (event) {
        const editButton = event.target.closest('.btn-edit-action');
        if (editButton) {
            const row = editButton.closest('tr');
            const productId = row?.dataset.productId;
            if (productId) {
                productListController.handleEditAction(productId);
            }
        }

        const deleteButton = event.target.closest('.btn-delete-action');
        if (deleteButton) {
            const row = deleteButton.closest('tr');
            const productId = row?.dataset.productId;
            if (productId) {
                productController.handleDelete(productId);
            }
        }
    });

    document.addEventListener('keydown', function (event) {
        const input = event.target.closest('.product-name-edit-input');
        if (!input) {
            return;
        }

        const row = input.closest('tr');
        const productId = row?.dataset.productId;

        if (!productId) {
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            productListController.saveInlineName(productId);
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            productListController.cancelInlineEdit();
        }
    });
}

function bindTrashActionEvents(productController) {
    document.addEventListener('click', function (event) {
        const restoreButton = event.target.closest('.btn-restore-action');
        if (restoreButton) {
            const row = restoreButton.closest('tr');
            const productId = row?.dataset.productId;
            if (productId) {
                productController.handleRestore(productId);
            }
        }

        const permanentDeleteButton = event.target.closest('.btn-permanent-delete-action');
        if (permanentDeleteButton) {
            const row = permanentDeleteButton.closest('tr');
            const productId = row?.dataset.productId;
            if (productId) {
                productController.handlePermanentDelete(productId);
            }
        }
    });
}
