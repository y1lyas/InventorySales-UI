import { getProductId, getProductName, getProductSku } from '../../utils/productDisplay.js';

export class ProductController {

    constructor(view, productService , categoryService, state, options) {
        this.view = view;
        this.stockAdjustmentView = options?.stockAdjustmentView || null;
        this.priceAdjustmentView = options?.priceAdjustmentView || null;
        this.productService = productService;
        this.categoryService = categoryService;
        this.state = state;
        this.feedbackView = options?.feedbackView || view;
        this.onProductCreated = null;
        this.onProductDeleted = null;
        this.onStockAdjusted = null;
        this.onPriceAdjusted = null;
        this.onProductNameUpdated = null;
        this.toastRootId = 'delete-confirm-toast-root';
        this.isConfirming = false;
        this.pendingConfirmation = null;
    }

    async loadCategories() {
        if (this.state.loaded.allCategories) {
            this.view.renderCategories(this.state.categories);
            return;
        }

        try {
            this.state.categories = await this.categoryService.getAllCategories();
            this.state.loaded.categories = true;
            this.state.loaded.allCategories = true;
            this.view.renderCategories(this.state.categories);
        } catch (error) {
            this.view.showCategoryError(error.message || 'Failed to load categories');
        }
    }

    async openCreateModal() {
        this.view.showWithLoading();
        await this.loadCategories();
    }

    async handleFormSubmit() {
        const formData = this.view.getFormData();
        const validation = this.productService.validateProductFormData(formData);

        if (!validation.valid) {
            this.view.showError(validation.error);
            return;
        }

        const payload = this.productService.buildProductPayload(formData, validation.price);

        try {
            const createdProduct = await this.productService.createProduct(payload);
            const normalizedProduct = this.productService.normalizeCreatedProduct(createdProduct, payload, this.state.categories);
         

            this.state.movement.products.unshift(normalizedProduct);
            this.state.ui.productsPage = 1;
            this.state.loaded.products = false;

            this.view.resetForm();
            this.view.hide();
            this.feedbackView.showSuccess('Product added successfully!');

            if (typeof this.onProductCreated === 'function') {
                this.onProductCreated();
            }
        } catch (error) {
            this.view.showError(error.message || 'Failed to create product');
        }
    }

    async handleDelete(productId) {
        if (!productId) {
            return;
        }

        const product = this.findProductById(productId);
        const confirmed = await this.requestDeleteConfirmation(product);
        if (!confirmed) {
            return;
        }

        try {
            await this.productService.deleteProduct(productId);
            this.moveProductToDeletedState(productId);
            this.state.loaded.products = false;
            this.state.loaded.deletedProducts = false;
            this.feedbackView.showSuccess('Product deleted successfully!');


            if (typeof this.onProductDeleted === 'function') {
                this.onProductDeleted();
            }
        } catch (error) {
            this.feedbackView.showActionError(error.message || 'Failed to delete product');
        }
    }

    async openAdjustStockModal() {
        if (!this.stockAdjustmentView) {
            return;
        }

        this.stockAdjustmentView.show(this.state.movement.products);

        try {
            const products = await this.getProductOptions();
            this.stockAdjustmentView.renderProducts(products);
        } catch (error) {
            this.feedbackView.showActionError(error.message || 'Failed to load products');
        }
    }

    async openAdjustPriceModal(productId = '') {
        if (!this.priceAdjustmentView) {
            return;
        }

        const initialProduct = productId ? this.findProductById(productId) : null;
        this.priceAdjustmentView.show(this.state.movement.products, initialProduct);

        try {
            const products = await this.getProductOptions();
            const product = productId ? this.findProductById(productId) : null;
            if (productId && !product) {
                this.feedbackView.showActionError('Product not found');
                return;
            }

            this.priceAdjustmentView.show(products, product);
        } catch (error) {
            this.feedbackView.showActionError(error.message || 'Failed to load products');
        }
    }

    async handleStockAdjustmentSubmit() {
        if (!this.stockAdjustmentView) {
            return;
        }

        const formData = this.stockAdjustmentView.getFormData();
        const validation = this.productService.validateStockAdjustmentFormData(formData);

        if (!validation.valid) {
            this.stockAdjustmentView.showError(validation.error);
            return;
        }

        try {
            if (formData.action === 'increase') {
                await this.productService.increaseStock(formData.productId, validation.quantity);
                this.updateProductStock(formData.productId, validation.quantity);
            } else {
                await this.productService.decreaseStock(formData.productId, validation.quantity);
                this.updateProductStock(formData.productId, -validation.quantity);
            }

            this.stockAdjustmentView.resetForm();
            this.stockAdjustmentView.hide();
            this.feedbackView.showSuccess('Stock adjusted successfully!');

            if (typeof this.onStockAdjusted === 'function') {
                this.onStockAdjusted();
            }
        } catch (error) {
            this.stockAdjustmentView.showError(error.message || 'Failed to adjust stock');
        }
    }

    async handlePriceAdjustmentSubmit() {
        if (!this.priceAdjustmentView) {
            return;
        }

        const formData = this.priceAdjustmentView.getFormData();
        const validation = this.productService.validatePriceAdjustmentFormData(formData);

        if (!validation.valid) {
            this.priceAdjustmentView.showError(validation.error);
            return;
        }

        try {
            await this.productService.adjustPrice(formData.productId, validation.newPrice);
            this.updateProductPrice(formData.productId, validation.newPrice);

            this.priceAdjustmentView.resetForm();
            this.priceAdjustmentView.hide();
            this.feedbackView.showSuccess('Price adjusted successfully!');

            if (typeof this.onPriceAdjusted === 'function') {
                this.onPriceAdjusted();
            }
        } catch (error) {
            this.priceAdjustmentView.showError(error.message || 'Failed to adjust price');
        }
    }

    async handleNameUpdate(productId, newName) {
        if (!productId) {
            return false;
        }

        const validation = this.productService.validateProductName(newName);

        if (!validation.valid) {
            this.feedbackView.showActionError(validation.error);
            return false;
        }

        const product = this.findProductById(productId);
        const currentName = getProductName(product, '').trim();

        if (currentName === validation.name) {
            return true;
        }

        try {
            await this.productService.updateName(productId, validation.name);
            this.updateProductName(productId, validation.name);
            this.feedbackView.showSuccess('Product name updated successfully!');

            if (typeof this.onProductNameUpdated === 'function') {
                this.onProductNameUpdated();
            }

            return true;
        } catch (error) {
            this.feedbackView.showActionError(error.message || 'Failed to update product name');
            return false;
        }
    }

    handleRestore(productId) {
        console.warn(`Restore is not implemented yet for product ${productId}.`);
    }

    handlePermanentDelete(productId) {
        console.warn(`Permanent delete is not implemented yet for product ${productId}.`);
    }

    moveProductToDeletedState(productId) {
        const index = this.state.products.findIndex((product) => String(getProductId(product)) === String(productId));
        if (index === -1) {
            return;
        }

        const removedProduct = this.state.products.splice(index, 1)[0];
        this.state.movement.products = this.state.movement.products.filter((product) => String(getProductId(product)) !== String(productId));

        if (this.state.loaded.deletedProducts) {
            this.state.deletedProducts.unshift({
                ...removedProduct,
                deletedAt: new Date().toISOString()
            });
        }
    }

    findProductById(productId) {
        return [...this.state.products, ...this.state.movement.products]
            .find((product) => String(getProductId(product)) === String(productId)) || null;
    }

    async getProductOptions() {
        if (!this.state.movement.products.length) {
            if (this.state.products.length) {
                this.state.movement.products = [...this.state.products];
            } else {
                this.state.movement.products = await this.productService.getAllProducts({ isDeleted: false });
            }
        }

        return this.state.movement.products;
    }

    updateProductStock(productId, quantityChange) {
        const updateStock = (product) => {
            if (String(getProductId(product)) !== String(productId)) {
                return;
            }

            const currentStock = product.currentStock ?? product.stock ?? 0;
            product.currentStock = Math.max(0, currentStock + quantityChange);
            product.stock = product.currentStock;
        };

        this.state.products.forEach(updateStock);
        this.state.movement.products.forEach(updateStock);
    }

    updateProductPrice(productId, price) {
        const updatePrice = (product) => {
            if (String(getProductId(product)) !== String(productId)) {
                return;
            }

            product.unitPrice = price;
            product.price = price;
        };

        this.state.products.forEach(updatePrice);
        this.state.movement.products.forEach(updatePrice);
    }

    updateProductName(productId, name) {
        const updateName = (product) => {
            if (String(getProductId(product)) !== String(productId)) {
                return;
            }

            product.name = name;
        };

        this.state.products.forEach(updateName);
        this.state.movement.products.forEach(updateName);
    }

    requestDeleteConfirmation(product) {
        return new Promise((resolve) => {
            if (this.pendingConfirmation && typeof this.pendingConfirmation.cleanup === 'function') {
                this.pendingConfirmation.cleanup(false);
            }

            this.isConfirming = true;

            const root = this.getToastRoot();
            const toast = document.createElement('div');
            const productName = getProductName(product, 'this product');
            const productSku = getProductSku(product, '');
            const productLabel = productSku
                ? `${productName} (${productSku})`
                : productName;

            toast.className = 'toast d-flex align-items-center text-bg-light border shadow-sm p-3';
            toast.style.minWidth = '320px';
            toast.style.maxWidth = '360px';
            toast.style.cursor = 'default';
            toast.style.boxShadow = '0 0.75rem 1.5rem rgba(0, 0, 0, 0.12)';
            toast.innerHTML = `
                <div class="d-flex align-items-start flex-grow-1">
                    <i class="bi bi-exclamation-triangle-fill text-warning fs-4 me-3"></i>
                    <div>
                        <div class="fw-semibold mb-1">Confirm delete</div>
                        <div class="small text-muted mb-1">Are you sure you want to delete this product?</div>
                        <div class="small fw-semibold text-dark">${this.escapeHtml(productLabel)}</div>
                    </div>
                </div>
                <div class="ms-3 d-flex gap-2">
                    <button type="button" class="btn btn-sm btn-outline-secondary">Cancel</button>
                    <button type="button" class="btn btn-sm btn-danger">Delete</button>
                </div>
            `;

            root.appendChild(toast);

            const buttons = toast.querySelectorAll('button');
            const cancelButton = buttons[0];
            const confirmButton = buttons[1];
            let settled = false;

            const cleanup = (result) => {
                if (settled) {
                    return;
                }

                settled = true;
                this.isConfirming = false;
                clearTimeout(timeoutId);

                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }

                if (this.pendingConfirmation?.toast === toast) {
                    this.pendingConfirmation = null;
                }

                resolve(result);
            };

            this.pendingConfirmation = {
                toast: toast,
                cleanup: cleanup
            };

            cancelButton.addEventListener('click', function () {
                cleanup(false);
            }, { once: true });

            confirmButton.addEventListener('click', function () {
                cleanup(true);
            }, { once: true });

            const timeoutId = window.setTimeout(function () {
                cleanup(false);
            }, 12000);
        });
    }

    getToastRoot() {
        let root = document.getElementById(this.toastRootId);

        if (!root) {
            root = document.createElement('div');
            root.id = this.toastRootId;
            root.style.position = 'fixed';
            root.style.top = '0';
            root.style.right = '0';
            root.style.zIndex = '9999';
            root.style.padding = '1rem';
            document.body.appendChild(root);
        }

        return root;
    }

    escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}
