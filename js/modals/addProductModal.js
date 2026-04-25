
const addProductView = new AddProductView();
const addProductController = new AddProductController(addProductView, window.productService);

addProductController.onProductCreated = () => fetchAndRenderProducts();

window.showAddProductModal = () => {
    addProductView.showWithLoading();
    addProductController.loadCategories();
};

document.addEventListener('DOMContentLoaded', () => {
    addProductController.initialize();
});
