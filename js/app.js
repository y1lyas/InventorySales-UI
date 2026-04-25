// app.js - Main Application Entry Point
// This is the single entry point that initializes the entire application

import { store, state } from "./store.js";
import { renderDashboard } from "./views/dashboardRenderer.js";
import AddProductView from "./views/addProductView.js";
import ProductService from "./services/productService.js";
import ProductApi from "./APIs/productApi.js";
import CategoryApi from "./APIs/categoryApi.js";
import * as bootstrap from 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.esm.min.js';

window.bootstrap = bootstrap;

// Create service instance
const productService = new ProductService(ProductApi, CategoryApi);

// Create view instance
const addProductView = new AddProductView();

// Create controller instance
class AddProductController {
    constructor(view, service) {
        this.view = view;
        this.service = service;
    }

    async initialize() {
        await this.loadCategories();
        this.setupFormHandler();
    }

    async loadCategories() {
        try {
            const categories = await this.service.getCategories();
            state.categories = categories;
            this.view.renderCategories(categories);
        } catch (error) {
            this.view.showCategoryError("Kategori yüklenemedi");
        }
    }

    setupFormHandler() {
        this.view.onFormSubmit(() => this.handleFormSubmit());
    }

    async handleFormSubmit() {
        const formData = this.view.getFormData();
        const validation = this.service.validateProductFormData(formData);

        if (!validation.valid) {
            this.view.showError(validation.error);
            return;
        }

        const productData = this.service.buildProductPayload(formData, validation.price);

        try {
            const createdProduct = await this.service.createProduct(productData);
            state.products.push(createdProduct);
            this.view.resetForm();
            this.view.hide();
            render(); // Re-render after state change
        } catch (error) {
            this.view.showError("Ürün oluşturulamadı");
        }
    }

    showModal() {
        this.view.show();
    }
}

const addProductController = new AddProductController(addProductView, productService);

// Make controller globally available for HTML onclick handlers
window.addProductController = addProductController;


// Main render function - orchestrates all UI updates
export function render() {
    // Update dashboard
    renderDashboard(state);
    
    // Update other components as needed
    updateProductCount();
}

// Update product count in header
function updateProductCount() {
    const countElement = document.getElementById('product-count');
    if (countElement) {
        countElement.textContent = state.products.length;
    }
}

// Initialize the application
async function initializeApp() {
    // Subscribe to state changes
    store.subscribe('products', () => render());
    store.subscribe('categories', () => render());
    store.subscribe('isLoading', () => render());
    store.subscribe('error', () => render());
    
    // Set loading state
    state.isLoading = true;
    render();
    
    try {
        // Load initial data
        const data = await productService.getProductsForPage(1, '', { isDeleted: false });
        state.products = data.products;
        state.currentPage = data.pagination.currentPage;
    } catch (error) {
        state.error = error.message;
    }
    
    // Initialize controller
    await addProductController.initialize();
    
    // Set loading to false
    state.isLoading = false;
    render();
}

// Make render available globally for other modules
window.render = render;

// Make state available globally for debugging
window.appState = state;

// Global functions for HTML onclick handlers
window.showAddProductModal = function() {
    console.log('Opening add product modal...');
    addProductController.showModal();
};

window.toggleRecycleBin = function() {
    console.log('Opening recycle bin...');
    const modal = document.getElementById('recycleBinModal');
    if (modal) {
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Export for use in other modules
export { addProductController, productService };