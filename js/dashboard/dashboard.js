let currentPage = 1;
let searchDebounceTimeout;
const pageSize = 10;

const productService = new ProductService(ProductApi,CategoryApi, pageSize);
window.productService = productService;

const dashboardView = new DashboardView();
const removedProductsView = new RemovedProductsView();
const dashboardController = new DashboardController(dashboardView, productService);
const trashController     = new DashboardController(removedProductsView, productService, { isTrashMode: true });
const deleteController = new DeleteProductController(dashboardView, productService);

document.getElementById('btnToggleTrash').addEventListener('click', () => {
    trashController.open();
});

deleteController.onProductDeleted = () => {
    dashboardController.loadProducts(currentPage);
};

window.fetchAndRenderProducts = (page = 1) => dashboardController.loadProducts(page);

window.deleteProduct = (id) => {
    deleteController.handleDelete(id);
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

    dashboardController.loadProducts(currentPage);
});