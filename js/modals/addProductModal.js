
const addProductView = new AddProductView();
const addProductController = new ProductController(addProductView, window.productService, window.categoryService);

addProductController.onProductCreated = () => fetchAndRenderProducts();

window.showAddProductModal = () => {
    addProductView.showWithLoading();
    addProductController.loadCategories();
};

document.addEventListener('DOMContentLoaded', () => {
    addProductController.initialize();
});
