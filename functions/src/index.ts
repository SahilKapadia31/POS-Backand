import * as functions from 'firebase-functions';
import { onRequest } from "firebase-functions/v2/https";
import axios from 'axios';
import { applyCors } from './middleware/cors-middleware';
import { handleError } from './utils/error-handler';
import {
    productService,
    customerService,
    invoiceService,
    repairService,
    inventoryService,
    orderService
} from './services/fireberry';

// Generic function to access any Fireberry API endpoint
export const callFireberryAPI = onRequest(async (request, response) => {
    // Handle CORS
    try {
        await applyCors(request, response);

        if (request.method !== 'POST') {
            response.status(405).json({
                success: false,
                message: 'Method Not Allowed. Use POST to call this endpoint.'
            });
            return;
        }

        // Extract values from request body
        const { endpoint, method, payload } = request.body;

        if (!endpoint) {
            response.status(400).json({
                success: false,
                message: 'Missing required parameter: endpoint'
            });
            return;
        }

        // Get Fireberry Token from config
        const FIREBERRY_TOKEN = functions.config().fireberry?.token;

        const apiResponse = await axios({
            url: `https://api.fireberry.com/${endpoint}`,
            method: method || "GET",
            headers: {
                'accept': 'application/json',
                'tokenid': FIREBERRY_TOKEN,
                "Content-Type": "application/json",
            },
            data: payload,
        });

        // Return response in standardized format
        response.json({
            success: true,
            data: apiResponse.data,
            message: ''
        });
    } catch (error) {
        handleError(error, response);
    }
});

export const getProducts = onRequest(async (request, response) => {
    // Handle CORS
    try {
        await applyCors(request, response);

        if (request.method !== 'GET') {
            response.status(405).json({
                success: false,
                message: 'Method Not Allowed'
            });
            return;
        }

        const pageSize = Number(request.query.pageSize || 50);
        const pageNumber = Number(request.query.pageNumber || 1);

        const result = await productService.getAllProductsPaginated({
            pageSize,
            pageNumber
        });

        if (!result.success) {
            response.status(500).json({
                success: false,
                message: result.error?.message || 'Failed to fetch paginated products'
            });
            return;
        }

        // Return response in the standardized format
        response.json({
            success: true,
            data: result.data,
            message: ''
        });
    } catch (error) {
        handleError(error, response);
    }
});

// Create a new product
export const createProduct = onRequest(async (request, response) => {
    // Handle CORS
    try {
        await applyCors(request, response);

        if (request.method !== 'POST') {
            response.status(405).json({
                success: false,
                message: 'Method Not Allowed'
            });
            return;
        }

        const productData = request.body;
        if (!productData || !productData.name) {
            response.status(400).json({
                success: false,
                message: 'Product data is required with at least a name'
            });
            return;
        }

        const result = await productService.createProduct(productData);

        if (!result.success) {
            response.status(500).json({
                success: false,
                message: result.error?.message || 'Failed to create product'
            });
            return;
        }

        // Return response in standardized format
        response.json({
            success: true,
            data: result.data,
            message: 'Product created successfully'
        });
    } catch (error) {
        handleError(error, response);
    }
});

// Update an existing product
export const updateProduct = onRequest(async (request, response) => {
    // Handle CORS
    try {
        await applyCors(request, response);

        if (request.method !== 'PUT' && request.method !== 'POST') {
            response.status(405).json({
                success: false,
                message: 'Method Not Allowed'
            });
            return;
        }

        const id = request.query.id as string || request.body.id;
        const productData = request.body;


        if (!id) {
            response.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
            return;
        }

        if (!productData) {
            response.status(400).json({
                success: false,
                message: 'Product data is required'
            });
            return;
        }

        // Remove id from the data if it exists to avoid overwriting
        if (productData.id) {
            delete productData.id;
        }

        const result = await productService.updateProduct(id, productData);

        if (!result.success) {
            response.status(500).json({
                success: false,
                message: result.error?.message || 'Failed to update product'
            });
            return;
        }

        // Return response in standardized format
        response.json({
            success: true,
            data: result.data,
            message: 'Product updated successfully'
        });
    } catch (error) {
        handleError(error, response);
    }
});

// Delete a product
export const deleteProduct = onRequest(async (request, response) => {
    // Handle CORS
    try {
        await applyCors(request, response);

        if (request.method !== 'DELETE' && request.method !== 'POST') {
            response.status(405).json({
                success: false,
                message: 'Method Not Allowed'
            });
            return;
        }

        const id = request.query.id as string || request.body.id;
        if (!id) {
            response.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
            return;
        }

        const result = await productService.deleteProduct(id);

        if (!result.success) {
            response.status(500).json({
                success: false,
                message: result.error?.message || 'Failed to delete product'
            });
            return;
        }

        // Return response in standardized format
        response.json({
            success: true,
            data: null,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        handleError(error, response);
    }
});

export const getProductById = onRequest(async (request, response) => {
    // Handle CORS
    try {
        await applyCors(request, response);

        if (request.method !== 'GET') {
            response.status(405).json({
                success: false,
                message: 'Method Not Allowed'
            });
            return;
        }

        const id = request.query.id as string;
        if (!id) {
            response.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
            return;
        }

        const result = await productService.getProductById(id);

        if (!result.success) {
            response.status(500).json({
                success: false,
                message: result.error?.message || 'Failed to fetch product'
            });
            return;
        }

        // Return response in standardized format
        response.json({
            success: true,
            data: result.data,
            message: ''
        });
    } catch (error) {
        handleError(error, response);
    }
});

export const getInvoices = onRequest(async (request, response) => {
    // Handle CORS
    try {
        await applyCors(request, response);

        if (request.method !== 'GET') {
            response.status(405).json({
                success: false,
                message: 'Method Not Allowed'
            });
            return;
        }

        const pageSize = Number(request.query.pageSize || 50);
        const pageNumber = Number(request.query.pageNumber || 1);

        const result = await invoiceService.getAllInvoices({
            pageSize,
            pageNumber
        });

        if (!result.success) {
            response.status(500).json({
                success: false,
                message: result.error?.message || 'Failed to fetch invoices'
            });
            return;
        }

        // Return response in standardized format
        response.json({
            success: true,
            data: result.data,
            message: ''
        });
    } catch (error) {
        handleError(error, response);
    }
});

export const getRepairs = onRequest(async (request, response) => {
    // Handle CORS
    try {
        await applyCors(request, response);

        if (request.method !== 'GET') {
            response.status(405).json({
                success: false,
                message: 'Method Not Allowed'
            });
            return;
        }

        const pageSize = Number(request.query.pageSize || 50);
        const pageNumber = Number(request.query.pageNumber || 1);

        const result = await repairService.getAllRepairs({
            pageSize,
            pageNumber
        });

        if (!result.success) {
            response.status(500).json({
                success: false,
                message: result.error?.message || 'Failed to fetch repairs'
            });
            return;
        }

        // Return response in standardized format
        response.json({
            success: true,
            data: result.data,
            message: ''
        });
    } catch (error) {
        handleError(error, response);
    }
});

// Create a new repair ticket
export const createRepair = onRequest(async (request, response) => {
    // Handle CORS
    try {
        await applyCors(request, response);

        if (request.method !== 'POST') {
            response.status(405).json({
                success: false,
                message: 'Method Not Allowed'
            });
            return;
        }

        const repairData = request.body;
        if (!repairData || !repairData.title) {
            response.status(400).json({
                success: false,
                message: 'Repair data is required with at least an title'
            });
            return;
        }

        const result = await repairService.createRepair(repairData);

        if (!result.success) {
            response.status(500).json({
                success: false,
                message: result.error?.message || 'Failed to create repair ticket'
            });
            return;
        }

        // Return response in standardized format
        response.json({
            success: true,
            data: result.data,
            message: 'Repair ticket created successfully'
        });
    } catch (error) {
        handleError(error, response);
    }
});

// Get repair by ID
export const getRepairById = onRequest(async (request, response) => {
    // Handle CORS
    try {
        await applyCors(request, response);

        if (request.method !== 'GET') {
            response.status(405).json({
                success: false,
                message: 'Method Not Allowed'
            });
            return;
        }

        const id = request.query.id as string;
        if (!id) {
            response.status(400).json({
                success: false,
                message: 'Repair ticket ID is required'
            });
            return;
        }

        const result = await repairService.getRepairById(id);

        if (!result.success) {
            response.status(500).json({
                success: false,
                message: result.error?.message || 'Failed to fetch repair ticket'
            });
            return;
        }

        // Return response in standardized format
        response.json({
            success: true,
            data: result.data,
            message: ''
        });
    } catch (error) {
        handleError(error, response);
    }
});

// Update repair ticket
export const updateRepair = onRequest(async (request, response) => {
    // Handle CORS
    try {
        await applyCors(request, response);

        if (request.method !== 'PUT' && request.method !== 'POST') {
            response.status(405).json({
                success: false,
                message: 'Method Not Allowed'
            });
            return;
        }

        const id = request.query.id as string || request.body.id;
        const repairData = request.body;

        if (!id) {
            response.status(400).json({
                success: false,
                message: 'Repair ticket ID is required'
            });
            return;
        }

        if (!repairData) {
            response.status(400).json({
                success: false,
                message: 'Repair data is required'
            });
            return;
        }

        // Remove id from the data if it exists to avoid overwriting
        if (repairData.id) {
            delete repairData.id;
        }

        const result = await repairService.updateRepair(id, repairData);

        if (!result.success) {
            response.status(500).json({
                success: false,
                message: result.error?.message || 'Failed to update repair ticket'
            });
            return;
        }

        // Return response in standardized format
        response.json({
            success: true,
            data: result.data,
            message: 'Repair ticket updated successfully'
        });
    } catch (error) {
        handleError(error, response);
    }
});

// Delete a repair ticket
export const deleteRepair = onRequest(async (request, response) => {
    // Handle CORS
    try {
        await applyCors(request, response);

        if (request.method !== 'DELETE' && request.method !== 'POST') {
            response.status(405).json({
                success: false,
                message: 'Method Not Allowed'
            });
            return;
        }

        const id = request.query.id as string || request.body.id;
        if (!id) {
            response.status(400).json({
                success: false,
                message: 'Repair ticket ID is required'
            });
            return;
        }

        const result = await repairService.deleteRepair(id);

        if (!result.success) {
            response.status(500).json({
                success: false,
                message: result.error?.message || 'Failed to delete repair ticket'
            });
            return;
        }

        // Return response in standardized format
        response.json({
            success: true,
            data: null,
            message: 'Repair ticket deleted successfully'
        });
    } catch (error) {
        handleError(error, response);
    }
});

export const getInventory = onRequest(async (request, response) => {
    // Handle CORS
    try {
        await applyCors(request, response);

        if (request.method !== 'GET') {
            response.status(405).json({
                success: false,
                message: 'Method Not Allowed'
            });
            return;
        }

        const pageSize = Number(request.query.pageSize || 50);
        const pageNumber = Number(request.query.pageNumber || 1);

        const result = await inventoryService.getAllInventory({
            pageSize,
            pageNumber
        });

        if (!result.success) {
            response.status(500).json({
                success: false,
                message: result.error?.message || 'Failed to fetch inventory'
            });
            return;
        }

        // Return response in standardized format
        response.json({
            success: true,
            data: result.data,
            message: ''
        });
    } catch (error) {
        handleError(error, response);
    }
});

export const getLowStockInventory = onRequest(async (request, response) => {
    // Handle CORS
    try {
        await applyCors(request, response);

        if (request.method !== 'GET') {
            response.status(405).json({
                success: false,
                message: 'Method Not Allowed'
            });
            return;
        }

        const pageSize = Number(request.query.pageSize || 50);
        const pageNumber = Number(request.query.pageNumber || 1);

        const result = await inventoryService.getLowStock({
            pageSize,
            pageNumber
        });

        if (!result.success) {
            response.status(500).json({
                success: false,
                message: result.error?.message || 'Failed to fetch low stock items'
            });
            return;
        }

        // Return response in standardized format
        response.json({
            success: true,
            data: result.data,
            message: ''
        });
    } catch (error) {
        handleError(error, response);
    }
});

export const getOrders = onRequest(async (request, response) => {
    // Handle CORS
    try {
        await applyCors(request, response);

        if (request.method !== 'GET') {
            response.status(405).json({
                success: false,
                message: 'Method Not Allowed'
            });
            return;
        }

        const pageSize = Number(request.query.pageSize || 50);
        const pageNumber = Number(request.query.pageNumber || 1);

        const result = await orderService.getAllOrders({
            pageSize,
            pageNumber
        });

        if (!result.success) {
            response.status(500).json({
                success: false,
                message: result.error?.message || 'Failed to fetch orders'
            });
            return;
        }

        // Return response in standardized format
        response.json({
            success: true,
            data: result.data,
            message: ''
        });
    } catch (error) {
        handleError(error, response);
    }
});

export const getOrderById = onRequest(async (request, response) => {
    // Handle CORS
    try {
        await applyCors(request, response);

        if (request.method !== 'GET') {
            response.status(405).json({
                success: false,
                message: 'Method Not Allowed'
            });
            return;
        }

        const id = request.query.id as string;
        if (!id) {
            response.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
            return;
        }

        const result = await orderService.getOrderById(id);

        if (!result.success) {
            response.status(500).json({
                success: false,
                message: result.error?.message || 'Failed to fetch order'
            });
            return;
        }

        // Return response in standardized format
        response.json({
            success: true,
            data: result.data,
            message: ''
        });
    } catch (error) {
        handleError(error, response);
    }
});

export const getOrderItems = onRequest(async (request, response) => {
    // Handle CORS
    try {
        await applyCors(request, response);

        if (request.method !== 'GET') {
            response.status(405).json({
                success: false,
                message: 'Method Not Allowed'
            });
            return;
        }

        const id = request.query.id as string;
        if (!id) {
            response.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
            return;
        }

        const result = await orderService.getOrderItems(id);

        if (!result.success) {
            response.status(500).json({
                success: false,
                message: result.error?.message || 'Failed to fetch order items'
            });
            return;
        }

        // Return response in standardized format
        response.json({
            success: true,
            data: result.data,
            message: ''
        });
    } catch (error) {
        handleError(error, response);
    }
});

export const createOrder = onRequest(async (request, response) => {
    // Handle CORS
    try {
        await applyCors(request, response);

        if (request.method !== 'POST') {
            response.status(405).json({
                success: false,
                message: 'Method Not Allowed'
            });
            return;
        }

        const orderData = request.body;
        if (!orderData || !orderData.accountid || !orderData.companyname) {
            response.status(400).json({
                success: false,
                message: 'Order data is required with at least accountid and companyname'
            });
            return;
        }

        const result = await orderService.createOrder(orderData);

        if (!result.success) {
            response.status(500).json({
                success: false,
                message: result.error?.message || 'Failed to create order'
            });
            return;
        }

        // Return response in standardized format
        response.json({
            success: true,
            data: result.data,
            message: 'Order created successfully'
        });
    } catch (error) {
        handleError(error, response);
    }
});

export const updateOrder = onRequest(async (request, response) => {
    // Handle CORS
    try {
        await applyCors(request, response);

        if (request.method !== 'PUT' && request.method !== 'POST') {
            response.status(405).json({
                success: false,
                message: 'Method Not Allowed'
            });
            return;
        }

        const id = request.query.id as string || request.body.id;
        const orderData = request.body;

        if (!id) {
            response.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
            return;
        }

        if (!orderData) {
            response.status(400).json({
                success: false,
                message: 'Order data is required'
            });
            return;
        }

        // Remove id from the data if it exists to avoid overwriting
        if (orderData.id) {
            delete orderData.id;
        }

        const result = await orderService.updateOrder(id, orderData);

        if (!result.success) {
            response.status(500).json({
                success: false,
                message: result.error?.message || 'Failed to update order'
            });
            return;
        }

        // Return response in standardized format
        response.json({
            success: true,
            data: result.data,
            message: 'Order updated successfully'
        });
    } catch (error) {
        handleError(error, response);
    }
});

export const deleteOrder = onRequest(async (request, response) => {
    // Handle CORS
    try {
        await applyCors(request, response);

        if (request.method !== 'DELETE' && request.method !== 'POST') {
            response.status(405).json({
                success: false,
                message: 'Method Not Allowed'
            });
            return;
        }

        const id = request.query.id as string || request.body.id;
        if (!id) {
            response.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
            return;
        }

        const result = await orderService.deleteOrder(id);

        if (!result.success) {
            response.status(500).json({
                success: false,
                message: result.error?.message || 'Failed to delete order'
            });
            return;
        }

        // Return response in standardized format
        response.json({
            success: true,
            data: null,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        handleError(error, response);
    }
});

// Get all customers with pagination
export const getCustomers = onRequest(async (request, response) => {
    // Handle CORS
    try {
        await applyCors(request, response);

        if (request.method !== 'GET') {
            response.status(405).json({
                success: false,
                message: 'Method Not Allowed'
            });
            return;
        }

        const pageSize = Number(request.query.pageSize || 50);
        const pageNumber = Number(request.query.pageNumber || 1);

        const result = await customerService.getAllCustomers({
            pageSize,
            pageNumber
        });

        if (!result.success) {
            response.status(500).json({
                success: false,
                message: result.error?.message || 'Failed to fetch customers'
            });
            return;
        }

        // Return response in standardized format
        response.json({
            success: true,
            data: result.data,
            message: ''
        });
    } catch (error) {
        handleError(error, response);
    }
});

// Get customer by ID
export const getCustomerById = onRequest(async (request, response) => {
    // Handle CORS
    try {
        await applyCors(request, response);

        if (request.method !== 'GET') {
            response.status(405).json({
                success: false,
                message: 'Method Not Allowed'
            });
            return;
        }

        const id = request.query.id as string;
        if (!id) {
            response.status(400).json({
                success: false,
                message: 'Customer ID is required'
            });
            return;
        }

        const result = await customerService.getCustomerById(id);

        if (!result.success) {
            response.status(500).json({
                success: false,
                message: result.error?.message || 'Failed to fetch customer'
            });
            return;
        }

        // Return response in standardized format
        response.json({
            success: true,
            data: result.data,
            message: ''
        });
    } catch (error) {
        handleError(error, response);
    }
});

// Create a new customer
export const createCustomer = onRequest(async (request, response) => {
    // Handle CORS
    try {
        await applyCors(request, response);

        if (request.method !== 'POST') {
            response.status(405).json({
                success: false,
                message: 'Method Not Allowed'
            });
            return;
        }

        const customerData = request.body;
        if (!customerData || !customerData.accountname) {
            response.status(400).json({
                success: false,
                message: 'Customer data is required with at least an account name'
            });
            return;
        }

        const result = await customerService.createCustomer(customerData);

        if (!result.success) {
            response.status(500).json({
                success: false,
                message: result.error?.message || 'Failed to create customer'
            });
            return;
        }

        // Return response in standardized format
        response.json({
            success: true,
            data: result.data,
            message: 'Customer created successfully'
        });
    } catch (error) {
        handleError(error, response);
    }
});

// Update an existing customer
export const updateCustomer = onRequest(async (request, response) => {
    // Handle CORS
    try {
        await applyCors(request, response);

        if (request.method !== 'PUT' && request.method !== 'POST') {
            response.status(405).json({
                success: false,
                message: 'Method Not Allowed'
            });
            return;
        }

        const id = request.query.id as string || request.body.id;
        const customerData = request.body;

        if (!id) {
            response.status(400).json({
                success: false,
                message: 'Customer ID is required'
            });
            return;
        }

        if (!customerData) {
            response.status(400).json({
                success: false,
                message: 'Customer data is required'
            });
            return;
        }

        // Remove id from the data if it exists to avoid overwriting
        if (customerData.id) {
            delete customerData.id;
        }

        const result = await customerService.updateCustomer(id, customerData);

        if (!result.success) {
            response.status(500).json({
                success: false,
                message: result.error?.message || 'Failed to update customer'
            });
            return;
        }

        // Return response in standardized format
        response.json({
            success: true,
            data: result.data,
            message: 'Customer updated successfully'
        });
    } catch (error) {
        handleError(error, response);
    }
});

// Delete a customer
export const deleteCustomer = onRequest(async (request, response) => {
    // Handle CORS
    try {
        await applyCors(request, response);

        if (request.method !== 'DELETE' && request.method !== 'POST') {
            response.status(405).json({
                success: false,
                message: 'Method Not Allowed'
            });
            return;
        }

        const id = request.query.id as string || request.body.id;
        if (!id) {
            response.status(400).json({
                success: false,
                message: 'Customer ID is required'
            });
            return;
        }

        const result = await customerService.deleteCustomer(id);

        if (!result.success) {
            response.status(500).json({
                success: false,
                message: result.error?.message || 'Failed to delete customer'
            });
            return;
        }

        // Return response in standardized format
        response.json({
            success: true,
            data: null,
            message: 'Customer deleted successfully'
        });
    } catch (error) {
        handleError(error, response);
    }
});

// Get customers with upcoming birthdays
export const getUpcomingBirthdays = onRequest(async (request, response) => {
    // Handle CORS
    try {
        await applyCors(request, response);

        if (request.method !== 'GET') {
            response.status(405).json({
                success: false,
                message: 'Method Not Allowed'
            });
            return;
        }

        const days = Number(request.query.days || 30);

        const result = await customerService.getUpcomingBirthdays(days);

        if (!result.success) {
            response.status(500).json({
                success: false,
                message: result.error?.message || 'Failed to fetch upcoming birthdays'
            });
            return;
        }

        // Return response in standardized format
        response.json({
            success: true,
            data: result.data,
            message: ''
        });
    } catch (error) {
        handleError(error, response);
    }
});

// Query customers with advanced filtering, sorting, and pagination
export const queryCustomers = onRequest(async (request, response) => {
    // Handle CORS
    try {
        await applyCors(request, response);

        // Accept both GET and POST for flexibility
        if (request.method !== 'GET' && request.method !== 'POST') {
            response.status(405).json({
                success: false,
                message: 'Method Not Allowed'
            });
            return;
        }

        // Extract query parameters 
        // For GET requests, use query parameters
        // For POST requests, use body
        const queryParams = request.method === 'GET'
            ? request.query
            : request.body;

        const searchQuery = queryParams.query as string || '';
        const pageSize = Number(queryParams.pageSize || 50);
        const pageNumber = Number(queryParams.pageNumber || 1);
        const sortBy = queryParams.sortBy as string || 'accountname';
        const sortDirection = (queryParams.sortDirection as 'asc' | 'desc') || 'asc';

        const result = await customerService.queryCustomers({
            query: searchQuery,
            pageSize,
            pageNumber,
            sortBy,
            sortDirection
        });

        if (!result.success) {
            response.status(500).json({
                success: false,
                message: result.error?.message || 'Failed to query customers'
            });
            return;
        }

        // Return response in standardized format, preserving the Fireberry API response structure
        response.json({
            success: true,
            data: result.data,
            message: ''
        });
    } catch (error) {
        handleError(error, response);
    }
});

