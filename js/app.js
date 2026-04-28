
let currentPage = 1;
let searchDebounceTimeout;
const pageSize = 10;

const productService = new ProductService(ProductApi, pageSize);
window.productService = productService;
    
const categoryService = new CategoryService(CategoryApi);
window.categoryService = categoryService;

const dashboardView = new DashboardView();
const removedProductsView = new RemovedProductsView();
const dashboardController = new DashboardController(dashboardView, productService);
const trashController     = new DashboardController(removedProductsView, productService, { isTrashMode: true });
const productController = new ProductController(dashboardView, productService, categoryService);

document.getElementById('btnToggleTrash').addEventListener('click', () => {
    trashController.open();
});

document.addEventListener('click', (e) => {
    const addProductBtn = e.target.closest('#btnAddProduct');
    if (addProductBtn) {
        window.showAddProductModal();
    }
});

productController.onProductDeleted = () => {
    dashboardController.loadProducts(currentPage);
};

window.fetchAndRenderProducts = (page = 1) => dashboardController.loadProducts(page);

window.deleteProduct = (id) => {
    productController.handleDelete(id);
};
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('product-search');
    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            clearTimeout(searchDebounceTimeout);
            searchDebounceTimeout = window.setTimeout(() => {
                dashboardController.setSearchTerm(event.target.value);
            }, 250);
        });
    }
    const trashSearchInput = document.getElementById('trash-search');
    if (trashSearchInput) {
        trashSearchInput.addEventListener('input', (event) => {
            clearTimeout(searchDebounceTimeout);
            searchDebounceTimeout = window.setTimeout(() => {
                trashController.setSearchTerm(event.target.value);
            }, 250);
        });
    }

    // Category filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (event) => {
            const categoryId = event.target.value || null;
            dashboardController.setCategoryId(categoryId);
        });
        
        // Load categories for filter dropdown
        categoryService.getCategories().then(categories => {
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id || cat.categoryId || cat.categoryGuid;
                option.textContent = cat.name;
                categoryFilter.appendChild(option);
            });
        }).catch(err => console.error('Failed to load categories for filter:', err));
    }

    dashboardController.loadProducts(currentPage);
});