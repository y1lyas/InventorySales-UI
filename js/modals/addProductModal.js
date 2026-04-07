
const addProductView = new AddProductView();
const addProductController = new AddProductController(addProductView, window.productService);

addProductController.onProductCreated = () => fetchAndRenderProducts();

window.showAddProductModal = async () => {
    await addProductController.loadCategories();
    addProductView.show();
};

document.addEventListener('DOMContentLoaded', () => {
    addProductController.initialize();
});
