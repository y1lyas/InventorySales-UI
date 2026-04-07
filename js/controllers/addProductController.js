class AddProductController {
    constructor(view, service) {
        this.view = view;
        this.service = service;
        this.onProductCreated = null;
    }

    async initialize() {
        try {
            await this.loadCategories();
            this.setupFormHandler();
        } catch (error) {
            console.error('AddProductController initialize error:', error);
        }
    }

    async loadCategories() {
        try {
            const categories = await this.service.getCategories();
            this.view.renderCategories(categories);
        } catch (error) {
            console.error('AddProductController loadCategories error:', error);
            this.view.showCategoryError(error.message || 'Failed to load categories');
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
            console.log('Sending product data:', productData);
            await this.service.createProduct(productData);

            this.view.resetForm();
            this.view.hide();
            this.view.showSuccess('Product added successfully!');

            if (typeof this.onProductCreated === 'function') {
                await this.onProductCreated();
            }
        } catch (error) {
            console.error('AddProductController handleFormSubmit error:', error);
            this.view.showError(error.message || 'Failed to create product');
        }
    }

    showModal() {
        this.view.show();
    }
}

window.AddProductController = AddProductController;
