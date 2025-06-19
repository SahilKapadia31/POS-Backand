import { CustomerService } from './customer-service';
import { ProductService } from './product-service';
import { RepairService } from './repair-service';
import { InventoryService } from './inventory-service';
import { InvoiceService } from './invoice-service';
import { OrderService } from './order-service';
import { AxiosError } from 'axios';
import { FireberryService } from './fireberry-service';

// Create service instances
const customerService = new CustomerService();
const productService = new ProductService();
const repairService = new RepairService();
const inventoryService = new InventoryService();
const invoiceService = new InvoiceService();
const orderService = new OrderService();

// Helper function to handle Fireberry API errors
export function handleFireberryError(error: AxiosError): { success: false, error: { code: string, message: string } } {
    console.error('Fireberry API Error:', error);

    const statusCode = error.response?.status;
    const errorMessage = (error.response?.data as any)?.Message || error.message || 'Unknown error';

    return {
        success: false,
        error: {
            code: `FIREBERRY_ERROR_${statusCode || 'UNKNOWN'}`,
            message: errorMessage
        }
    };
}

// Export service instances
export {
    customerService,
    productService,
    repairService,
    inventoryService,
    invoiceService,
    orderService,
    FireberryService
};

// Export interfaces for type checking
export type { Customer } from './customer-service';
export type { Product } from './product-service';
export type { Invoice, InvoiceItem } from './invoice-service';
export type { RepairTicket, RepairPart, RepairLog } from './repair-service';
export type { InventoryItem } from './inventory-service'; 