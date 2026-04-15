class DeleteProductController {
    constructor(view, service) {
        this.service = service;
        this.view = view;
        this.onProductDeleted = null;
        this.toastRootId = 'delete-confirm-toast-root';
        this.isConfirming = false;
    }

    async handleDelete(productId) {
        if (!productId) return;

        if (this.isConfirming) {
            console.warn("Lütfen mevcut silme işlemini tamamlayın.");
            return;
        }

        const confirmed = await this.requestDeleteConfirmation();
        if (!confirmed) return;

        try {
            await this.service.deleteProduct(productId);
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
            root.style.right = '1rem';
            root.style.bottom = '1rem';
            root.style.zIndex = '1080';
            root.style.display = 'flex';
            root.style.flexDirection = 'column';
            root.style.alignItems = 'flex-end';
            root.style.gap = '0.75rem';
            document.body.appendChild(root);
        }
        return root;
    }
}

window.DeleteProductController = DeleteProductController;
