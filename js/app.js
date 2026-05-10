import { state } from './state/state.js';
import { productApi } from './APIs/productApi.js';
import { categoryApi } from './APIs/categoryApi.js';
import { ProductService } from './services/productService.js';
import { CategoryService } from './services/categoryService.js';
import { StockMovementService } from './services/stockMovementService.js';
import { ProductListController } from './controllers/ProductListController.js';
import { ProductController } from './controllers/ProductController.js';
import { DashboardController } from './controllers/dashboardController.js';
import { ProductListView } from './views/productListView.js';
import { StockMovementsView } from './views/stockMovementsView.js';
import { AddProductView } from './views/addProductView.js';
import { RemovedProductsView } from './views/removedProductsView.js';
import { StockAdjustmentView } from './views/stockAdjustmentView.js';

let productSearchDebounceId = null;
let trashSearchDebounceId = null;
let movementSearchDebounceId = null;

document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    const productService = new ProductService(productApi, state.ui.pageSize);
    const categoryService = new CategoryService(categoryApi);
    const stockMovementService = new StockMovementService(productApi);

    if (document.getElementById('product-list-body')) {
        initializeProductsPage(productService, categoryService);
    }

    if (document.getElementById('stock-movement-table-body')) {
        initializeDashboardPage(productService, stockMovementService);
    }
}

function initializeProductsPage(productService, categoryService) {
    const productListView = new ProductListView();
    const addProductView = new AddProductView();
    const stockAdjustmentView = new StockAdjustmentView();
    const removedProductsView = new RemovedProductsView();

    const productController = new ProductController(
        addProductView,
        productService,
        categoryService,
        state,
        {
            feedbackView: productListView,
            stockAdjustmentView: stockAdjustmentView
        }
    );
    const productListController = new ProductListController(productListView, productService, state, {
        onCreateProduct: () => productController.openCreateModal()
    });
    const deletedProductListController = new ProductListController(removedProductsView, productService, state, {
        isDeletedList: true
    });

    productController.onProductCreated = function () {
        productListController.render();
    };

    productController.onProductDeleted = function () {
        productListView.showSuccess('Product deleted successfully!');
        productListController.render();
        deletedProductListController.render();
    };

    productController.onStockAdjusted = function () {
        productListController.render();
    };

    bindProductPageEvents(productListController, deletedProductListController, productController);
    renderCategoryFilter(state.categories, productService);
    productController.loadCategories().then(function () {
        renderCategoryFilter(state.categories, productService);
    });
    productListController.loadProducts(false);
    bindTrashActionEvents(productController);
}

function initializeDashboardPage(productService, stockMovementService) {
    const dashboardView = new StockMovementsView();
    const dashboardController = new DashboardController(dashboardView, productService, stockMovementService, state);

    document.getElementById('dashboard-product-select')?.addEventListener('change', function (event) {
        dashboardController.setProductFilter(event.target.value);
    });

    document.getElementById('dashboard-movement-type-select')?.addEventListener('change', function (event) {
        dashboardController.setMovementTypeFilter(event.target.value);
    });

    document.getElementById('dashboard-movement-search')?.addEventListener('input', function (event) {
        clearTimeout(movementSearchDebounceId);
        movementSearchDebounceId = window.setTimeout(function () {
            dashboardController.setSearchTerm(event.target.value);
        }, 250);
    });

    dashboardController.initialize();
}

function bindProductPageEvents(productListController, deletedProductListController, productController) {
    document.getElementById('btnAddProduct')?.addEventListener('click', function () {
        productController.openCreateModal();
    });

    document.getElementById('btnAdjustStock')?.addEventListener('click', function () {
        productController.openAdjustStockModal();
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

    document.getElementById('category-filter')?.addEventListener('change', function (event) {
        productListController.setCategoryId(event.target.value);
    });

    document.getElementById('addProductForm')?.addEventListener('submit', function (event) {
        event.preventDefault();
        productController.handleFormSubmit();
    });

    document.getElementById('adjustStockForm')?.addEventListener('submit', function (event) {
        event.preventDefault();
        productController.handleStockAdjustmentSubmit();
    });

    document.addEventListener('click', function (event) {
        const deleteButton = event.target.closest('.btn-delete-action');
        if (deleteButton) {
            const row = deleteButton.closest('tr');
            const productId = row?.dataset.productId;
            if (productId) {
                productController.handleDelete(productId);
            }
        }
    });
}

function renderCategoryFilter(categories, productService) {
    const categoryFilter = document.getElementById('category-filter');
    if (!categoryFilter) {
        return;
    }

    categoryFilter.innerHTML = '<option value="">All Categories</option>';

    categories.forEach(function (category) {
        const option = document.createElement('option');
        option.value = productService.getCategoryId(category);
        option.textContent = category.name ?? 'Unknown category';
        categoryFilter.appendChild(option);
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
