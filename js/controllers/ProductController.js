// filepath: js/controllers/ProductController.js
class ProductController {
    // =====================================================
    // CONSTRUCTOR
    // =====================================================
    constructor(view, productService, categoryService) {
        this.view = view;
        this.productService = productService;
        this.categoryService = categoryService;
     
        // Callbacks
        this.onProductCreated = null;
        this.onProductDeleted = null;
        
        // Delete specific
        this.toastRootId = 'delete-confirm-toast-root';
        this.isConfirming = false;
    }

    // =====================================================
    // INITIALIZATION
    // =====================================================
    async initialize() {
        try {
            await this.loadCategories();
            this.setupFormHandler();
        } catch (error) {
            console.error('ProductController initialize error:', error);
        }
    }

    // =====================================================
    // ADD OPERATIONS
    // =====================================================
    async loadCategories() {
        try {
            const categories = await this.categoryService.getCategories();
            this.view.renderCategories(categories);
        } catch (error) {
            console.error('ProductController loadCategories error:', error);
            this.view.showCategoryError(error.message || 'Failed to load categories');
        }
    }

    setupFormHandler() {
        this.view.onFormSubmit(() => this.handleFormSubmit());
    }

    async handleFormSubmit() {
        const formData = this.view.getFormData();

        const validation = this.productService.validateProductFormData(formData);
        if (!validation.valid) {
            this.view.showError(validation.error);
            return;
        }

        const productData = this.productService.buildProductPayload(formData, validation.price);

        try {
            console.log('Sending product data:', productData);
            await this.productService.createProduct(productData);

            this.view.resetForm();
            this.view.hide();
            this.view.showSuccess('Product added successfully!');

            if (typeof this.onProductCreated === 'function') {
                await this.onProductCreated();
            }
        } catch (error) {
            console.error('ProductController handleFormSubmit error:', error);
            this.view.showError(error.message || 'Failed to create product');
        }
    }

    showModal() {
        this.view.show();
    }

    // =====================================================
    // DELETE OPERATIONS
    // =====================================================
    async handleDelete(productId) {
        if (!productId) return;

        if (this.isConfirming) {
            console.warn("Lütfen mevcut silme işlemini tamamlayın.");
            return;
        }

        const confirmed = await this.requestDeleteConfirmation();
        if (!confirmed) return;

        try {
            await this.productService.deleteProduct(productId);
            this.view.showSuccess('Product deleted successfully!');

            if (typeof this.onProductDeleted === 'function') {
                await this.onProductDeleted();
            }
        } catch (error) {
            this.view.showActionError('Error: ' + error.message);
        }
    }

    requestDeleteConfirmation() {
        return new Promise((resolve) => {
            this.isConfirming = true;
            const root = this.getToastRoot();
            const toast = document.createElement('div');
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
                        <div class="small text-muted">Are you sure you want to delete this product?</div>
                    </div>
                </div>
                <div class="ms-3 d-flex gap-2">
                    <button type="button" class="btn btn-sm btn-outline-secondary">Cancel</button>
                    <button type="button" class="btn btn-sm btn-danger">Delete</button>
                </div>
            `;

            root.appendChild(toast);

            const [cancelButton, confirmButton] = toast.querySelectorAll('button');
            let settled = false;
            const cleanup = (result) => {
                if (settled) return;
                settled = true;
                this.isConfirming = false;
                clearTimeout(timeoutId);
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
                resolve(result);
            };

            cancelButton.addEventListener('click', () => cleanup(false), { once: true });
            confirmButton.addEventListener('click', () => cleanup(true), { once: true });

            const timeoutId = window.setTimeout(() => cleanup(false), 12000);
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
}

window.ProductController = ProductController;