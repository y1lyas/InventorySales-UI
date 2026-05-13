import { extractCollection, extractPagination } from '../utils/apiResponse.js';

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
        return extractCollection(data, ['stockMovements', 'movements']);
    }

    extractPagination(data, currentCount, currentPage, fallbackPageSize) {
        return extractPagination(data, currentCount, currentPage, fallbackPageSize);
    }
}
