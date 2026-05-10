export class StockMovementService {
    constructor(productApi) {
        this.productApi = productApi;
    }

    async getStockMovements(productId) {
        const data = await this.productApi.getStockMovements(productId);
        return this.extractStockMovements(data);
    }

    async getAllStockMovements({ page = 1, size = 10, search = '', productId = '', movementType = '' } = {}) {
        const data = await this.productApi.getAllStockMovements({ page, size, search, productId, movementType });
        const movements = this.extractStockMovements(data);

        return {
            movements: movements,
            pagination: this.extractPagination(data, movements.length, page, size)
        };
    }

    extractStockMovements(data) {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.stockMovements)) return data.stockMovements;
        if (Array.isArray(data.movements)) return data.movements;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data.items)) return data.items;
        if (Array.isArray(data.result)) return data.result;
        return [];
    }

    extractPagination(data, currentCount, currentPage, fallbackPageSize) {
        if (currentPage === 1 && currentCount < fallbackPageSize) {
            return {
                currentPage: 1,
                totalPages: 1
            };
        }

        const explicitTotalPages = typeof data.totalPages === 'number'
            ? data.totalPages
            : typeof data.pageCount === 'number'
                ? data.pageCount
                : null;
        const totalItems = typeof data.totalCount === 'number'
            ? data.totalCount
            : typeof data.totalItems === 'number'
                ? data.totalItems
                : typeof data.total === 'number'
                    ? data.total
                    : null;
        const pageSize = parseInt(data.pageSize ?? data.size ?? fallbackPageSize, 10) || fallbackPageSize;
        const totalPages = explicitTotalPages !== null
            ? Math.max(1, explicitTotalPages)
            : totalItems !== null
            ? Math.max(1, Math.ceil(totalItems / pageSize))
            : Math.max(1, Math.ceil(currentCount / pageSize));

        return {
            currentPage: parseInt(data.pageNumber ?? data.currentPage ?? data.page ?? currentPage, 10) || currentPage,
            totalPages: totalPages
        };
    }
}
