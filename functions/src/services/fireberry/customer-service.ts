import { fireberryService, FireberryResponse } from './fireberry-service';

// Customer interface matching Fireberry Account fields
export interface Customer {
    id?: string;
    accountid?: string;          // Used for API operations
    accountname: string;         // required
    accountnumber?: string;      // Used for identification
    emailaddress1?: string;      // Primary email address
    emailaddress2?: string;      // Secondary email address
    telephone1?: string;         // Primary phone
    telephone2?: string;         // Secondary phone
    firstname?: string;          // First name
    lastname?: string;           // Last name
    birthdaydate?: string;       // Birthday in UTC format
    billingcity?: string;        // Billing city
    billingcountry?: string;     // Billing country
    billingstate?: string;       // Billing state
    billingstreet?: string;      // Billing street
    billingzipcode?: string;     // Billing zip code
    description?: string;        // Description, up to 4000 characters
    idnumber?: string;           // ID of the person or company
    revenue?: number;            // Account revenue
    statuscode?: number;         // Status code (active/inactive)
    statecode?: number;          // State of the account
    websiteurl?: string;         // Website URL
    createdon?: string;          // Creation date
    ownerid?: string;            // Owner ID
}

// Pagination params interface
export interface PaginationParams {
    pageSize?: number;
    pageNumber?: number;
}

export class CustomerService {
    private apiRecordPath = 'api/record/account';

    /**
     * Get all customers
     */
    async getAllCustomers(params: PaginationParams = {}): Promise<FireberryResponse<Customer[]>> {
        const pageSize = params.pageSize || 50;
        const pageNumber = params.pageNumber || 1;

        const queryParams = `pagesize=${pageSize}&pagenumber=${pageNumber}`;
        return fireberryService.callApi<Customer[]>(`${this.apiRecordPath}?${queryParams}`);
    }

    /**
     * Get a customer by ID
     */
    async getCustomerById(id: string): Promise<FireberryResponse<Customer>> {
        return fireberryService.callApi<Customer>(`${this.apiRecordPath}/${id}`);
    }

    /**
     * Create a new customer
     * Only sends the fields that are provided, with accountname being required
     */
    async createCustomer(customer: Pick<Customer, 'accountname'> & Partial<Omit<Customer, 'accountname' | 'id'>>): Promise<FireberryResponse<Customer>> {
        // Remove any undefined fields to avoid sending them to the API
        const cleanedCustomer = Object.fromEntries(
            Object.entries(customer).filter(([_, value]) => value !== undefined)
        );

        return fireberryService.callApi<Customer>(this.apiRecordPath, 'POST', cleanedCustomer);
    }

    /**
     * Update an existing customer
     */
    async updateCustomer(id: string, customer: Partial<Customer>): Promise<FireberryResponse<Customer>> {
        // Remove any undefined fields to avoid sending them to the API
        const cleanedCustomer = Object.fromEntries(
            Object.entries(customer).filter(([_, value]) => value !== undefined)
        );

        return fireberryService.callApi<Customer>(`${this.apiRecordPath}/${id}`, 'PUT', cleanedCustomer);
    }

    /**
     * Delete a customer
     */
    async deleteCustomer(id: string): Promise<FireberryResponse<void>> {
        return fireberryService.callApi<void>(`${this.apiRecordPath}/${id}`, 'DELETE');
    }

    /**
     * Search customers by query
     */
    async searchCustomers(query: string): Promise<FireberryResponse<Customer[]>> {
        return fireberryService.callApi<Customer[]>(`${this.apiRecordPath}/search?q=${encodeURIComponent(query)}`);
    }

    /**
     * Get customer purchase history (orders)
     */
    async getCustomerOrders(id: string): Promise<FireberryResponse<any[]>> {
        return fireberryService.callApi<any[]>(`${this.apiRecordPath}/${id}/orders`);
    }

    /**
     * Get customers with upcoming birthdays
     */
    async getUpcomingBirthdays(days: number = 30): Promise<FireberryResponse<Customer[]>> {
        return fireberryService.callApi<Customer[]>(`${this.apiRecordPath}/upcoming-birthdays?days=${days}`);
    }
}

// Export a singleton instance
export const customerService = new CustomerService(); 