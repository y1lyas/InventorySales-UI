import { extractCollection, extractPagination } from '../../utils/apiResponse.js';

export class ProductService {
    constructor(productApi, pageSize) {
        this.productApi = productApi;
        this.pageSize = pageSize || 10;
    }

    async getAllProducts({ isDeleted = false, categoryId = '', searchTerm = '', filters = {} } = {}) {
        const allProducts = [];
        let page = 1;
        let totalPages = 1;

        do {
            const data = await this.productApi.getAll(page, 100, searchTerm, isDeleted, categoryId, filters);
            const products = this.extractProducts(data);
            const pagination = this.calculatePaginationInfo(data, page, 100);

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

    async increaseStock(productId, quantity) {
        return await this.productApi.increaseStock({ productId, quantity });
    }

    async decreaseStock(productId, quantity) {
        return await this.productApi.decreaseStock({ productId, quantity });
    }

     async adjustPrice(productId, newPrice) {
        return await this.productApi.adjustPrice({ productId, newPrice });
    }

    async updateName(productId, newName) {
        return await this.productApi.updateName({ productId, name: newName });
    }

    validateProductName(name) {
        const trimmedName = String(name || '').trim();

        if (!trimmedName) {
            return { valid: false, error: 'Product name is required' };
        }

        if (trimmedName.length > 120) {
            return { valid: false, error: 'Product name must be 120 characters or less' };
        }

        return { valid: true, name: trimmedName };
    }

    validateStockAdjustmentFormData(formData) {
        if (!formData.productId) {
            return { valid: false, error: 'Please select a product' };
        }

        const quantity = parseInt(formData.quantityRaw, 10);
        if (Number.isNaN(quantity) || quantity <= 0) {
            return { valid: false, error: 'Please enter a quantity greater than 0' };
        }

        if (formData.action !== 'increase' && formData.action !== 'decrease') {
            return { valid: false, error: 'Please choose increase or decrease' };
        }

        return { valid: true, quantity: quantity };
    }
      validatePriceAdjustmentFormData(formData) {
        if (!formData.productId) {
            return { valid: false, error: 'Please select a product' };
        }

          const newPrice = Number(
        String(formData.newPrice || '').replace(',', '.')
    );
       if (!Number.isFinite(newPrice) || newPrice <= 0) {
        return { valid: false, error: 'Please enter a product price greater than 0' };
    }

        return { valid: true, newPrice };
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
            // currency: simdilik api tarafinda varsayilan olarak TRY. 
        };
    }

    filterProducts(products, {
        searchTerm = '',
        categoryId = '',
        minStock = '',
        maxStock = '',
        minPrice = '',
        maxPrice = '',
        startDate = '',
        endDate = ''
    } = {}) {
        const normalizedSearch = String(searchTerm || '').trim().toLowerCase();
        const normalizedCategoryId = String(categoryId || '');
        const stockMin = this.parseNumberFilter(minStock);
        const stockMax = this.parseNumberFilter(maxStock);
        const priceMin = this.parseNumberFilter(minPrice);
        const priceMax = this.parseNumberFilter(maxPrice);
        const startTime = this.parseDateFilter(startDate, false);
        const endTime = this.parseDateFilter(endDate, true);

        return products.filter((product) => {
            const matchesSearch = !normalizedSearch || `${product.name ?? ''} ${product.sku ?? product.skUnit ?? ''}`
                .toLowerCase()
                .includes(normalizedSearch);

            const productCategoryId = String(product.categoryId ?? this.getCategoryId(product.category ?? product) ?? '');
            const matchesCategory = !normalizedCategoryId || productCategoryId === normalizedCategoryId;
            const stock = Number(product.currentStock ?? product.stock ?? 0);
            const price = Number(product.unitPrice ?? product.price ?? 0);
            const createdTime = product.createdAt ? new Date(product.createdAt).getTime() : null;
            const matchesStock = (stockMin === null || stock >= stockMin) && (stockMax === null || stock <= stockMax);
            const matchesPrice = (priceMin === null || price >= priceMin) && (priceMax === null || price <= priceMax);
            const matchesDate = (startTime === null || (createdTime !== null && createdTime >= startTime)) &&
                (endTime === null || (createdTime !== null && createdTime <= endTime));

            return matchesSearch && matchesCategory && matchesStock && matchesPrice && matchesDate;
        });
    }

    parseNumberFilter(value) {
        if (value === undefined || value === null || value === '') {
            return null;
        }

        const parsed = Number(String(value).replace(',', '.'));
        return Number.isFinite(parsed) ? parsed : null;
    }

    parseDateFilter(value, endOfDay) {
        if (!value) {
            return null;
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return null;
        }

        if (endOfDay) {
            date.setHours(23, 59, 59, 999);
        }

        return date.getTime();
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
            id: product.id ?? product.productId,
            name: product.name ?? payload.name,
            sku: product.sku ?? payload.sku,
            skUnit: product.skUnit ?? payload.sku,
            unitPrice: product.unitPrice ?? payload.unitPrice,
            price: product.price ?? payload.price,
            currency: product.currency ?? payload.currency,
            categoryId: product.categoryId ?? payload.categoryId ?? null,
            categoryName: product.categoryName ?? category?.name ?? 'General',
            currentStock: product.currentStock ?? product.stock ?? 0,
            createdAt: product.createdAt
        };
    }

    extractProducts(data) {
        return extractCollection(data, ['products']);
    }

    calculatePaginationInfo(data, currentPage, fallbackPageSize) {
        return extractPagination(data, currentPage, fallbackPageSize ?? this.pageSize);
    }

    getCategoryId(item) {
        return item?.id ?? item?.categoryId ?? item?.categoryGuid ?? item?._id ?? '';
    }
}
