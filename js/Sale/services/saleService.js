import { extractCollection, extractPagination } from '../../utils/apiResponse.js';

export class SaleService {
    constructor(salesApi, pageSize = 12) {
        this.salesApi = salesApi;
        this.pageSize = pageSize;
    }

    async getAllSales({ page = 1, size = this.pageSize, filters = {} } = {}) {
        const data = await this.salesApi.getAll(page, size, filters);
        const sales = extractCollection(data, ['sales']);

        return {
            sales,
            pagination: this.extractPagination(data, page, size)
        };
    }

    async getSaleById(saleId) {
        return this.salesApi.getById(saleId);
    }

    async createSale(payload) {
        return this.salesApi.create(payload);
    }

    extractPagination(data, currentPage, fallbackPageSize) {
        return extractPagination(data, currentPage, fallbackPageSize);
    }
}
