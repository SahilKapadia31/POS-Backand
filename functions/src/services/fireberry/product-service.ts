import { fireberryService, FireberryResponse } from './fireberry-service';

// Product interface
export interface Product {
    id?: string;
    name: string;                   // required
    catalognumber?: string;         // string
    categorycode?: number;          // int32
    description?: string;           // string, up to 4000 characters
    itemprice?: number;            // float
    itemquantity?: number;         // float
    ownerid?: string;              // string, GUID of system user
    ProductCost?: number;          // float
    productid?: string;          // string
    statuscode?: number;           // int32
    vendorname?: string;           // string
    vendorpartnumber?: string;     // string
}

// Pagination params interface
export interface PaginationParams {
    pageSize?: number;
    pageNumber?: number;
}

export class ProductService {
    private basePath = 'products';
    private apiRecordPath = 'api/record/product';

    /**
     * Get all products
     */
    async getAllProducts(): Promise<FireberryResponse<Product[]>> {
        return fireberryService.callApi<Product[]>(this.basePath);
    }

    /**
     * Get all products with pagination
     */
    async getAllProductsPaginated(params: PaginationParams = {}): Promise<FireberryResponse<Product[]>> {
        const pageSize = params.pageSize || 50;
        const pageNumber = params.pageNumber || 1;

        const queryParams = `pagesize=${pageSize}&pagenumber=${pageNumber}`;
        return fireberryService.callApi<Product[]>(`${this.apiRecordPath}?${queryParams}`);
    }

    /**
     * Get a product by ID
     */
    async getProductById(id: string): Promise<FireberryResponse<Product>> {
        return fireberryService.callApi<Product>(`${this.apiRecordPath}/${id}`);
    }

    /**
     * Create a new product
     * Only sends the fields that are provided, with name being required
     */
    async createProduct(product: Pick<Product, 'name'> & Partial<Omit<Product, 'name' | 'id'>>): Promise<FireberryResponse<Product>> {
        // Remove any undefined fields to avoid sending them to the API
        const cleanedProduct = Object.fromEntries(
            Object.entries(product).filter(([_, value]) => value !== undefined)
        );

        return fireberryService.callApi<Product>(this.apiRecordPath, 'POST', cleanedProduct);
    }

    /**
     * Update an existing product
     */
    async updateProduct(id: string, product: Partial<Product>): Promise<FireberryResponse<Product>> {
        // Remove any undefined fields to avoid sending them to the API
        const cleanedProduct = Object.fromEntries(
            Object.entries(product).filter(([_, value]) => value !== undefined)
        );

        return fireberryService.callApi<Product>(`${this.apiRecordPath}/${id}`, 'PUT', cleanedProduct);
    }

    /**
     * Delete a product
     */
    async deleteProduct(id: string): Promise<FireberryResponse<void>> {
        return fireberryService.callApi<void>(`${this.apiRecordPath}/${id}`, 'DELETE');
    }

    /**
     * Adjust product stock
     */
    async adjustStock(id: string, adjustment: number): Promise<FireberryResponse<Product>> {
        return fireberryService.callApi<Product>(
            `${this.basePath}/${id}/adjust-stock`,
            'POST',
            { adjustment }
        );
    }

    /**
     * Search products by query
     */
    async searchProducts(query: string): Promise<FireberryResponse<Product[]>> {
        return fireberryService.callApi<Product[]>(`${this.basePath}/search?q=${encodeURIComponent(query)}`);
    }
}

// Export a singleton instance
export const productService = new ProductService(); 