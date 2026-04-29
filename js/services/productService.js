export class ProductService {
    constructor(productApi, pageSize) {
        this.productApi = productApi;
        this.pageSize = pageSize || 10;
    }

    async getAllProducts({ isDeleted = false, categoryId = '' } = {}) {
        const allProducts = [];
        let page = 1;
        let totalPages = 1;

        do {
            const data = await this.productApi.getAll(page, 100, '', isDeleted, categoryId);
            const products = this.extractProducts(data);
            const pagination = this.calculatePaginationInfo(data, products.length, page, 100);

            allProducts.push(...products);
            totalPages = pagination.totalPages;
            page += 1;
        } while (page <= totalPages);

        return allProducts;
    }

    async createProduct(productData) {
        return await this.productApi.create(productData);
    }

    async deleteProduct(productId) {
        return await this.productApi.delete(productId);
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

        return { valid: true, price: price };
    }

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
            price: price,
            // currency: simdilik currency api tarafinda varsayilan olarak TRY. 
        };
    }

    filterProducts(products, { searchTerm = '', categoryId = '' } = {}) {
        const normalizedSearch = String(searchTerm || '').trim().toLowerCase();
        const normalizedCategoryId = String(categoryId || '');

        return products.filter((product) => {
            const matchesSearch = !normalizedSearch || `${product.name ?? ''} ${product.sku ?? product.skUnit ?? ''}`
                .toLowerCase()
                .includes(normalizedSearch);

            const productCategoryId = String(product.categoryId ?? this.getCategoryId(product.category ?? product) ?? '');
            const matchesCategory = !normalizedCategoryId || productCategoryId === normalizedCategoryId;

            return matchesSearch && matchesCategory;
        });
    }

    paginateProducts(products, currentPage) {
        const totalPages = Math.max(1, Math.ceil(products.length / this.pageSize));
        const safePage = Math.min(Math.max(currentPage, 1), totalPages);
        const startIndex = (safePage - 1) * this.pageSize;

        return {
            products: products.slice(startIndex, startIndex + this.pageSize),
            pagination: {
                currentPage: safePage,
                totalPages: totalPages
            }
        };
    }

    normalizeCreatedProduct(createdProduct, payload, categories) {
        const product = createdProduct && typeof createdProduct === 'object' ? createdProduct : {};
        const category = (categories || []).find((item) => String(this.getCategoryId(item)) === String(payload.categoryId ?? ''));

        return {
            ...product,
            id: product.id ?? product.productId ?? Date.now(),
            name: product.name ?? payload.name,
            sku: product.sku ?? payload.sku,
            skUnit: product.skUnit ?? payload.sku,
            unitPrice: product.unitPrice ?? payload.unitPrice,
            price: product.price ?? payload.price,
            currency: product.currency ?? payload.currency ?? 'TRY',
            categoryId: product.categoryId ?? payload.categoryId ?? null,
            categoryName: product.categoryName ?? category?.name ?? 'General',
            currentStock: product.currentStock ?? product.stock ?? 0,
            createdAt: product.createdAt ?? new Date().toISOString()
        };
    }

    extractProducts(data) {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.products)) return data.products;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data.items)) return data.items;
        if (Array.isArray(data.result)) return data.result;
        return [];
    }

    calculatePaginationInfo(data, currentCount, currentPage, fallbackPageSize) {
        const totalItems = typeof data.totalCount === 'number'
            ? data.totalCount
            : typeof data.totalItems === 'number'
                ? data.totalItems
                : typeof data.total === 'number'
                    ? data.total
                    : null;

        const pageSize = parseInt(data.pageSize ?? data.size ?? fallbackPageSize ?? this.pageSize, 10) || this.pageSize;
        const totalPages = totalItems !== null
            ? Math.max(1, Math.ceil(totalItems / pageSize))
            : Math.max(1, Math.ceil(currentCount / pageSize));

        return {
            currentPage: currentPage,
            totalPages: totalPages
        };
    }

    getCategoryId(item) {
        return item?.id ?? item?.categoryId ?? item?.categoryGuid ?? item?._id ?? '';
    }
}
