class ProductService {
    constructor(productApi, pageSize = 10) {
        this.productApi = productApi;
        this.pageSize = pageSize;
    }

    async getProductsForPage(page = 1, searchTerm = '', { isDeleted, categoryId } = {}) {
      const data = await this.productApi.getAll(
        page, 
        this.pageSize, 
        searchTerm, 
        isDeleted === true,
        categoryId
    );
        const products = this.extractProducts(data);
        const pagination = this.calculatePaginationInfo(data, products.length, page);
        
        return { products, pagination };
    }

    async createProduct(productData) {
        return await this.productApi.create(productData);
    }

    async deleteProduct(id) {
        return await this.productApi.delete(id);
    }

    validateProductFormData(formData) {
        if (!formData.name) {
            return { valid: false, error: 'Product name is required' };
        }

        if (!formData.sku) {
            return { valid: false, error: 'SKU is required' };
        }

        const price = parseFloat(formData.priceRaw);
        if (Number.isNaN(price) || price <= 0) {
            return { valid: false, error: 'Please enter a product price greater than 0' };
        }

        return { valid: true, price };
    }

    /**
     * Normalize form data into API product format
     */
    buildProductPayload(formData, price) {
        const selectedCategoryValue = formData.categoryValue?.trim() || '';
        const resolvedCategoryId = selectedCategoryValue && selectedCategoryValue !== 'undefined' && selectedCategoryValue !== 'null'
            ? (Number.isNaN(Number(selectedCategoryValue)) ? selectedCategoryValue : Number(selectedCategoryValue))
            : null;

        return {
            name: formData.name,
            categoryId: resolvedCategoryId,
            sku: formData.sku,
            unitPrice: price,
            price,
            currency: "TL"
        };
    }

    /**
     * Extract products array from API response (handles multiple response formats)
     */
    extractProducts(data) {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.products)) return data.products;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data.items)) return data.items;
        if (Array.isArray(data.result)) return data.result;
        return [];
    }

    /**
     * Calculate pagination info from API response
     */
    calculatePaginationInfo(data, currentCount, currentPage) {
        const totalItems = typeof data.totalCount === 'number'
            ? data.totalCount
            : typeof data.totalItems === 'number'
                ? data.totalItems
                : typeof data.total === 'number'
                    ? data.total
                    : null;

        const page = parseInt(data.page ?? data.currentPage ?? data.pageIndex ?? data.pageNumber ?? currentPage, 10);
        const size = parseInt(data.pageSize ?? data.size ?? this.pageSize, 10) || this.pageSize;
        const currentPageValue = Number.isFinite(page) && page > 0 ? page : currentPage;
        const totalPages = totalItems !== null
            ? Math.max(1, Math.ceil(totalItems / size))
            : Math.max(1, Math.ceil(currentCount / size));

        return { currentPage: currentPageValue, pageSize: size, totalItems, totalPages };
    }
}
