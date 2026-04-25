
// dashboardController.js - Controls dashboard functionality
import { state } from "../store.js";
import ProductService from "../services/productService.js";
import ProductApi from "../APIs/productApi.js";
import CategoryApi from "../APIs/categoryApi.js";

// Create service instance
const productService = new ProductService(ProductApi, CategoryApi);

export async function loadProducts(page = 1, searchTerm = '', options = {}) {
  state.isLoading = true;
  
  // Use global render function
  if (window.render) {
    window.render();
  }

  try {
    const data = await productService.getProductsForPage(page, searchTerm, options);
    state.products = data.products;
    state.currentPage = data.pagination.currentPage;
  } catch (err) {
    state.error = err.message;
    console.error('Failed to load products:', err);
  }

  state.isLoading = false;
  
  if (window.render) {
    window.render();
  }
}

export async function searchProducts(searchTerm) {
  await loadProducts(1, searchTerm, { isDeleted: state.isDeletedFilter });
}

export async function loadRemovedProducts(page = 1) {
  await loadProducts(page, '', { isDeleted: true });
}