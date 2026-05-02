export class ProductController {

    constructor(view, productService , categoryService, state, options) {
        this.view = view;
        this.productService = productService;
        this.categoryService = categoryService;
        this.state = state;
        this.feedbackView = options?.feedbackView || view;
        this.onProductCreated = null;
        this.onProductDeleted = null;
        this.toastRootId = 'delete-confirm-toast-root';
        this.isConfirming = false;
        this.pendingConfirmation = null;
    }

    async loadCategories() {
        if (this.state.loaded.categories) {
            this.view.renderCategories(this.state.categories);
            return;
        }

        try {
            this.state.categories = await this.categoryService.getCategories();
            this.state.loaded.categories = true;
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
         

            this.state.products.unshift(normalizedProduct);
            this.state.ui.dashboardPage = 1;

            this.view.resetForm();
            this.view.hide();
            this.view.showSuccess('Product added successfully!');

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

            if (typeof this.onProductDeleted === 'function') {
                this.onProductDeleted();
            }
        } catch (error) {
            this.feedbackView.showActionError(error.message || 'Failed to delete product');
        }
    }

    moveProductToDeletedState(productId) {
        const index = this.state.products.findIndex((product) => String(product.id) === String(productId));
        if (index === -1) {
            return;
        }

        const removedProduct = this.state.products.splice(index, 1)[0];

        if (this.state.loaded.deletedProducts) {
            this.state.deletedProducts.unshift({
                ...removedProduct,
                deletedAt: new Date().toISOString()
            });
        }
    }

    findProductById(productId) {
        return this.state.products.find((product) => String(product.id) === String(productId)) || null;
    }

    requestDeleteConfirmation(product) {
        return new Promise((resolve) => {
            if (this.pendingConfirmation && typeof this.pendingConfirmation.cleanup === 'function') {
                this.pendingConfirmation.cleanup(false);
            }

            this.isConfirming = true;

            const root = this.getToastRoot();
            const toast = document.createElement('div');
            const productName = product?.name ?? 'this product';
            const productSku = product?.sku ?? product?.skUnit ?? '';
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
