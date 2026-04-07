let currentPage = 1;
const pageSize = 10;

const productService = new ProductService(ProductApi, pageSize);
window.productService = productService;

// Initialize dashboard
const dashboardView = new DashboardView();
const dashboardController = new DashboardController(dashboardView, productService);

window.fetchAndRenderProducts = (page = 1) => dashboardController.loadProducts(page);

document.addEventListener('DOMContentLoaded', () => dashboardController.loadProducts(currentPage));