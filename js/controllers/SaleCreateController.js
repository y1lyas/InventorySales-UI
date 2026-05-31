import { Toast } from '../utils/toast.js';

export class SaleCreateController {
    constructor(view, saleService, productService, state) {
        this.view = view;
        this.saleService = saleService;
        this.productService = productService;
        this.state = state;
        this.products = [];
        this.cartItems = [];
        this.currentPage = this.state.ui.saleCreatePage || 1;
        this.searchTerm = this.state.ui.saleCreateSearchTerm || '';
    }

    async initialize() {
        this.bindEvents();
        await this.loadProducts();
    }

    bindEvents() {
        const submitButton = document.getElementById('sale-submit-button');
        submitButton?.addEventListener('click', () => {
            this.handleSubmit();
        });

        const searchInput = document.getElementById('sale-product-search');
        let searchDebounceId = null;
        searchInput?.addEventListener('input', (event) => {
            clearTimeout(searchDebounceId);
            searchDebounceId = window.setTimeout(() => {
                this.setSearchTerm(event.target.value);
            }, 250);
        });

        document.addEventListener('click', (event) => {
            const addButton = event.target.closest('.btn-add-to-cart');
            if (addButton) {
                const row = addButton.closest('tr');
                const productId = row?.dataset.productId;
                if (productId) {
                    this.handleAddToCart(productId);
                }
            }

            const removeButton = event.target.closest('.btn-remove-cart-item');
            if (removeButton) {
                const row = removeButton.closest('tr');
                const productId = row?.dataset.productId;
                if (productId) {
                    this.removeFromCart(productId);
                }
            }
        });

        document.addEventListener('input', (event) => {
            const quantityInput = event.target.closest('.cart-item-quantity');
            if (quantityInput) {
                const row = quantityInput.closest('tr');
                const productId = row?.dataset.productId;
                if (productId) {
                    this.updateCartQuantity(productId, Number(quantityInput.value));
                }
            }
        });
    }

    async loadProducts() {
        try {
            this.products = await this.productService.getAllProducts({ isDeleted: false });
            this.renderProductSelection();
            this.view.showProductTable();
        } catch (error) {
            this.view.showError(error.message || 'Unable to load products');
        }
    }

    handleAddToCart(productId) {
        const product = this.products.find((item) => String(item.id) === String(productId));
        if (!product) {
            this.view.showError('Selected product could not be found.');
            return;
        }

        const row = document.querySelector(`tr[data-product-id="${this.escapeHtml(productId)}"]`);
        const quantityInput = row?.querySelector('.product-quantity-input');
        const quantity = Number(quantityInput?.value ?? 0);

        if (!Number.isFinite(quantity) || quantity <= 0) {
            this.view.showError('Quantity must be greater than zero.');
            return;
        }

        const availableStock = Number(product.currentStock ?? product.stock ?? 0);
        if (quantity > availableStock) {
            this.view.showError('Quantity cannot exceed available stock.');
            return;
        }

        const existingItem = this.cartItems.find((item) => String(item.productId) === String(productId));

        if (existingItem) {
            existingItem.quantity = Math.min(availableStock, existingItem.quantity + quantity);
        } else {
            this.cartItems.push({
                productId: productId,
                productName: product.name,
                unitPrice: Number(product.unitPrice ?? product.price ?? 0),
                quantity: quantity,
                currentStock: availableStock
            });
        }

        this.view.renderCart(this.cartItems);
        this.view.clearError();
    }

    updateCartQuantity(productId, quantity) {
        const item = this.cartItems.find((entry) => String(entry.productId) === String(productId));
        if (!item) return;

        if (!Number.isFinite(quantity) || quantity <= 0) {
            this.view.showError('Quantity must be greater than zero.');
            return;
        }

        if (quantity > item.currentStock) {
            this.view.showError('Quantity cannot exceed available stock.');
            return;
        }

        item.quantity = quantity;
        this.view.renderCart(this.cartItems);
        this.view.clearError();
    }

    removeFromCart(productId) {
        this.cartItems = this.cartItems.filter((item) => String(item.productId) !== String(productId));
        this.view.renderCart(this.cartItems);
        this.view.clearError();
    }

    setSearchTerm(searchTerm) {
        this.searchTerm = String(searchTerm || '').trim();
        this.state.ui.saleCreateSearchTerm = this.searchTerm;
        this.state.ui.saleCreatePage = 1;
        this.currentPage = 1;
        this.renderProductSelection();
    }

    renderProductSelection() {
        const filteredProducts = this.productService.filterProducts(this.products, {
            searchTerm: this.searchTerm
        });

        const pageData = this.productService.paginateProducts(filteredProducts, this.currentPage);
        this.currentPage = pageData.pagination.currentPage;
        this.state.ui.saleCreatePage = this.currentPage;

        this.view.renderProductList(pageData.products);
        this.view.renderPagination(pageData.pagination, (nextPage) => {
            this.currentPage = nextPage;
            this.state.ui.saleCreatePage = nextPage;
            this.renderProductSelection();
        });
    }

    async handleSubmit() {
        if (!this.cartItems.length) {
            this.view.showError('Add at least one product to the sale.');
            return;
        }

        const payload = {
            items: this.cartItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity
            }))
        };

        try {
            await this.saleService.createSale(payload);
            Toast.show('Sale created successfully.', 'success');
            this.cartItems = [];
            this.view.renderCart(this.cartItems);
            window.location.href = '/pages/sales.html';
        } catch (error) {
            this.view.showError(error.message || 'Failed to create sale.');
        }
    }

    escapeHtml(value) {
        return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[character]));
    }
}
