import { fireberryService, FireberryResponse } from './fireberry-service';

// Order interface
export interface Order {
    id?: string;
    accountid?: string;          // required - customer account id
    companyname?: string;        // required - customer company name
    name?: string;
    description?: string;
    statuscode?: number;         // int32 - order status code
    orderdate?: string;          // date in ISO format
    totalamount?: number;        // float - total order amount
    subtotal?: number;           // float - subtotal amount
    discount?: number;           // float - discount amount
    tax?: number;                // float - tax amount
    shippingaddress?: string;    // shipping address
    billingaddress?: string;     // billing address
    paymentterms?: string;       // payment terms
}

// Order item interface
export interface OrderItem {
    id?: string;
    orderid: string;             // parent order id
    productid?: string;          // product id
    name: string;                // item name
    quantity: number;            // float - quantity
    unitprice: number;           // float - price per unit
    amount: number;              // float - total line amount
    description?: string;        // description
}

// Pagination params interface
export interface PaginationParams {
    pageSize?: number;
    pageNumber?: number;
}

export class OrderService {
    private apiRecordPath = 'api/record/crmorder';

    /**
     * Get all orders with pagination
     */
    async getAllOrders(params: PaginationParams = {}): Promise<FireberryResponse<Order[]>> {
        const pageSize = params.pageSize || 50;
        const pageNumber = params.pageNumber || 1;

        const queryParams = `pagesize=${pageSize}&pagenumber=${pageNumber}`;
        return fireberryService.callApi<Order[]>(`${this.apiRecordPath}?${queryParams}`);
    }

    /**
     * Get a specific order by ID
     */
    async getOrderById(id: string): Promise<FireberryResponse<Order>> {
        return fireberryService.callApi<Order>(`${this.apiRecordPath}/${id}`);
    }

    /**
     * Get items for a specific order
     */
    async getOrderItems(id: string): Promise<FireberryResponse<OrderItem[]>> {
        // Note: Using api/v2/record/13/${id}/items format as specified in the original code
        return fireberryService.callApi<OrderItem[]>(`api/v2/record/13/${id}/items`);
    }

    /**
     * Create a new order
     * Only sends the fields that are provided, with required fields validation
     */
    async createOrder(order: Pick<Order, 'accountid' | 'companyname'> & Partial<Omit<Order, 'accountid' | 'companyname' | 'id'>>): Promise<FireberryResponse<Order>> {
        // Required fields check
        if (!order.accountid || !order.companyname) {
            return {
                success: false,
                error: {
                    code: 'MISSING_REQUIRED_FIELDS',
                    message: 'Missing required fields: accountid and companyname are required'
                }
            };
        }

        // Remove any undefined fields to avoid sending them to the API
        const cleanedOrder = Object.fromEntries(
            Object.entries(order).filter(([_, value]) => value !== undefined)
        );

        return fireberryService.callApi<Order>(this.apiRecordPath, 'POST', cleanedOrder);
    }

    /**
     * Update an existing order
     */
    async updateOrder(id: string, order: Partial<Order>): Promise<FireberryResponse<Order>> {
        // Remove any undefined fields to avoid sending them to the API
        const cleanedOrder = Object.fromEntries(
            Object.entries(order).filter(([_, value]) => value !== undefined)
        );

        return fireberryService.callApi<Order>(`${this.apiRecordPath}/${id}`, 'PUT', cleanedOrder);
    }

    /**
     * Delete an order
     */
    async deleteOrder(id: string): Promise<FireberryResponse<void>> {
        return fireberryService.callApi<void>(`${this.apiRecordPath}/${id}`, 'DELETE');
    }

    /**
     * Add item to an order
     */
    async addOrderItem(orderId: string, item: Omit<OrderItem, 'id'>): Promise<FireberryResponse<OrderItem>> {
        // Remove any undefined fields to avoid sending them to the API
        const cleanedItem = Object.fromEntries(
            Object.entries(item).filter(([_, value]) => value !== undefined)
        );

        return fireberryService.callApi<OrderItem>(
            `${this.apiRecordPath}/${orderId}/items`,
            'POST',
            cleanedItem
        );
    }

    /**
     * Update order status
     */
    async updateOrderStatus(id: string, statuscode: number): Promise<FireberryResponse<Order>> {
        return fireberryService.callApi<Order>(
            `${this.apiRecordPath}/${id}`,
            'PATCH',
            { statuscode }
        );
    }
}

// Export a singleton instance
export const orderService = new OrderService(); 