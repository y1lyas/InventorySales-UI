import { extractCollection, extractPagination } from '../../utils/apiResponse.js';

export class StockMovementService {
    constructor(productApi) {
        this.productApi = productApi;
    }

    async getStockMovements(productId) {
        const data = await this.productApi.getStockMovements(productId);
        return this.extractStockMovements(data);
    }

    async getAllStockMovements({
        page = 1,
        size = 12,
        search = '',
        productId = '',
        movementType = '',
        movementReason = '',
        startDate = '',
        endDate = '',
        minQuantity = '',
        maxQuantity = ''
    } = {}) {
        const data = await this.productApi.getAllStockMovements({
            page,
            size,
            search,
            productId,
            movementType,
            movementReason,
            startDate,
            endDate,
            minQuantity,
            maxQuantity
        });
        const movements = this.extractStockMovements(data);

        return {
            movements: movements,
            pagination: this.extractPagination(data, page, size)
        };
    }

    extractStockMovements(data) {
        return extractCollection(data, ['movements', 'stockMovements']);
    }

    extractPagination(data, currentPage, fallbackPageSize) {
        return extractPagination(data, currentPage, fallbackPageSize);
    }
}
