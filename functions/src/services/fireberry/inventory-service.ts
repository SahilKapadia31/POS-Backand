import { fireberryService, FireberryResponse } from './fireberry-service';
import { Product } from './product-service';

// Additional inventory fields beyond products
export interface InventoryItem extends Product {
    location?: string;
    lastStockUpdate?: string;
    reorderThreshold?: number;
    supplier?: string;
    supplierContact?: string;
    purchasePrice?: number;
    markup?: number;
}

// Pagination params interface
export interface PaginationParams {
    pageSize?: number;
    pageNumber?: number;
}

export class InventoryService {
    private apiRecordPath = 'api/record/inventory';

    /**
     * Get all inventory items
     */
    async getAllInventory(params: PaginationParams = {}): Promise<FireberryResponse<InventoryItem[]>> {
        const pageSize = params.pageSize || 50;
        const pageNumber = params.pageNumber || 1;

        const queryParams = `pagesize=${pageSize}&pagenumber=${pageNumber}`;
        return fireberryService.callApi<InventoryItem[]>(`${this.apiRecordPath}?${queryParams}`);
    }

    /**
     * Get an inventory item by ID
     */
    async getInventoryById(id: string): Promise<FireberryResponse<InventoryItem>> {
        return fireberryService.callApi<InventoryItem>(`${this.apiRecordPath}/${id}`);
    }

    /**
     * Create a new inventory item
     */
    async createInventory(item: Omit<InventoryItem, 'id'>): Promise<FireberryResponse<InventoryItem>> {
        return fireberryService.callApi<InventoryItem>(this.apiRecordPath, 'POST', item);
    }

    /**
     * Update an existing inventory item
     */
    async updateInventory(id: string, item: Partial<InventoryItem>): Promise<FireberryResponse<InventoryItem>> {
        return fireberryService.callApi<InventoryItem>(`${this.apiRecordPath}/${id}`, 'PUT', item);
    }

    /**
     * Delete an inventory item
     */
    async deleteInventory(id: string): Promise<FireberryResponse<void>> {
        return fireberryService.callApi<void>(`${this.apiRecordPath}/${id}`, 'DELETE');
    }

    /**
     * Adjust inventory stock
     */
    async adjustStock(id: string, adjustment: number): Promise<FireberryResponse<InventoryItem>> {
        return fireberryService.callApi<InventoryItem>(
            `${this.apiRecordPath}/${id}/adjust`,
            'POST',
            { adjustment }
        );
    }

    /**
     * Get low stock items
     */
    async getLowStock(params: PaginationParams = {}): Promise<FireberryResponse<InventoryItem[]>> {
        const pageSize = params.pageSize || 50;
        const pageNumber = params.pageNumber || 1;

        const queryParams = `pagesize=${pageSize}&pagenumber=${pageNumber}`;
        return fireberryService.callApi<InventoryItem[]>(`${this.apiRecordPath}/low-stock?${queryParams}`);
    }

    /**
     * Get inventory valuation
     */
    async getValuation(): Promise<FireberryResponse<{ totalCost: number, totalRetail: number }>> {
        return fireberryService.callApi<{ totalCost: number, totalRetail: number }>(`${this.apiRecordPath}/valuation`);
    }
}

// Export a singleton instance
export const inventoryService = new InventoryService(); 