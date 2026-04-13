let currentPage = 1;
let searchDebounceTimeout;
const pageSize = 10;

const productService = new ProductService(ProductApi, pageSize);
window.productService = productService;

// Initialize dashboard
const dashboardView = new DashboardView();
const dashboardController = new DashboardController(dashboardView, productService);

window.fetchAndRenderProducts = (page = 1) => dashboardController.loadProducts(page);

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

    dashboardController.loadProducts(currentPage);
});