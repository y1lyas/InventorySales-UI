import { state } from './state/state.js';
import { productApi } from './APIs/productApi.js';
import { categoryApi } from './APIs/categoryApi.js';
import { ProductService } from './services/productService.js';
import { CategoryService } from './services/categoryService.js';
import { DashboardController } from './controllers/dashboardController.js';
import { ProductController } from './controllers/productController.js';
import { TrashActionsController } from './controllers/trashActionsController.js';
import { DashboardView } from './views/dashboardView.js';
import { AddProductView } from './views/addProductView.js';
import { RemovedProductsView } from './views/removedProductsView.js';

let dashboardSearchDebounceId = null;
let trashSearchDebounceId = null;

document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    const dashboardView = new DashboardView();
    const addProductView = new AddProductView();
    const removedProductsView = new RemovedProductsView();

    const productService = new ProductService(productApi, state.ui.pageSize);
    const categoryService = new CategoryService(categoryApi);

    const dashboardController = new DashboardController(dashboardView, productService, state, { isTrashMode: false });
    const trashController = new DashboardController(removedProductsView, productService, state, { isTrashMode: true });
    const productController = new ProductController(
        addProductView,
        productService,
        categoryService,
        state,
        { feedbackView: dashboardView }
    );
    const trashActionsController = new TrashActionsController();

    productController.onProductCreated = function () {
        dashboardController.render();
    };

    productController.onProductDeleted = function () {
        dashboardView.showSuccess('Product deleted successfully!');
        dashboardController.render();
        trashController.render();
    };

    bindEvents(dashboardController, trashController, productController);
    renderCategoryFilter(state.categories, productService);
    productController.loadCategories().then(function () {
        renderCategoryFilter(state.categories, productService);
    });
    dashboardController.loadProducts(false);
    bindTrashActionEvents(trashActionsController);
}

function bindEvents(dashboardController, trashController, productController) {
    document.getElementById('btnAddProduct')?.addEventListener('click', function () {
        productController.openCreateModal();
    });

    document.getElementById('btnToggleTrash')?.addEventListener('click', function () {
        trashController.view.show();
        trashController.loadProducts(false);
    });

    document.getElementById('product-search')?.addEventListener('input', function (event) {
        clearTimeout(dashboardSearchDebounceId);
        dashboardSearchDebounceId = window.setTimeout(function () {
            dashboardController.setSearchTerm(event.target.value);
        }, 250);
    });

    document.getElementById('trash-search')?.addEventListener('input', function (event) {
        clearTimeout(trashSearchDebounceId);
        trashSearchDebounceId = window.setTimeout(function () {
            trashController.setSearchTerm(event.target.value);
        }, 250);
    });

    document.getElementById('category-filter')?.addEventListener('change', function (event) {
        dashboardController.setCategoryId(event.target.value);
    });

    document.getElementById('addProductForm')?.addEventListener('submit', function (event) {
        event.preventDefault();
        productController.handleFormSubmit();
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

function bindTrashActionEvents(trashActionsController) {
    document.addEventListener('click', function (event) {
        const restoreButton = event.target.closest('.btn-restore-action');
        if (restoreButton) {
            const row = restoreButton.closest('tr');
            const productId = row?.dataset.productId;
            if (productId) {
                trashActionsController.handleRestore(productId);
            }
        }

        const permanentDeleteButton = event.target.closest('.btn-permanent-delete-action');
        if (permanentDeleteButton) {
            const row = permanentDeleteButton.closest('tr');
            const productId = row?.dataset.productId;
            if (productId) {
                trashActionsController.handlePermanentDelete(productId);
            }
        }
    });
}
