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

// Interface for query parameters
export interface QueryCustomersParams {
    query?: string;                // Search query string
    pageSize?: number;             // Page size (max 50)
    pageNumber?: number;           // Page number
    sortBy?: string;               // Field to sort by (e.g., 'accountname')
    sortDirection?: 'asc' | 'desc'; // Sort direction
}

export class CustomerService {
    private apiRecordPath = 'api/record/account';

    // Object type ID for accounts in Fireberry system
    // This is fixed by the Fireberry API and represents the Account object type
    private accountObjectType = 1; // Assuming 1 is the objecttype for accounts

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
     * Search customers by query - simple search (old implementation)
     * @deprecated Use queryCustomers instead for more advanced searching
     */
    async searchCustomers(query: string): Promise<FireberryResponse<Customer[]>> {
        return fireberryService.callApi<Customer[]>(`${this.apiRecordPath}/search?q=${encodeURIComponent(query)}`);
    }

    /**
     * Query customers using the Fireberry Query API with advanced filtering and sorting
     * @param params Query parameters including search term, pagination and sorting options
     * @returns Promise with customer results
     */
    async queryCustomers(params: QueryCustomersParams = {}): Promise<FireberryResponse<Customer[]>> {
        const { query, pageSize = 50, pageNumber = 1, sortBy = 'accountname', sortDirection = 'asc' } = params;

        // Construct the query payload according to Fireberry Query API specs
        const queryPayload: {
            objecttype: number;
            fields: string;
            page_size: number;
            page_number: number;
            sort_by: string;
            sort_type: 'asc' | 'desc';
            query?: string;  // Make query property optional
        } = {
            objecttype: this.accountObjectType,
            fields: 'accountid,accountname,firstname,lastname,emailaddress1,telephone1,idnumber,statuscode,statecode,websiteurl,createdon,birthdaydate,revenue',
            page_size: Math.min(pageSize, 50), // Ensure we don't exceed the 50 limit
            page_number: pageNumber,
            sort_by: sortBy,
            sort_type: sortDirection
        };

        // Add search query if provided
        if (query && query.trim() !== '') {
            // Using Fireberry's query syntax with start-with operator
            // The % prefix makes it search anywhere in the field
            queryPayload.query = `((accountname start-with '%${query}') OR (firstname start-with '%${query}') OR (lastname start-with '%${query}') OR (emailaddress1 start-with '%${query}') OR (telephone1 start-with '%${query}'))`;
        }

        // Log the query payload for debugging
        console.log('Query payload:', JSON.stringify(queryPayload, null, 2));

        // Call the Query API
        const result = await fireberryService.callApi<any>('api/query', 'POST', queryPayload);

        // Process the response to match our Customer interface
        if (result.success && result.data) {
            // Check if the response has the expected structure with Data array
            if (result.data.Data && Array.isArray(result.data.Data)) {
                return {
                    success: true,
                    data: result.data,
                    error: result.error
                };
            }
        }

        return result;
    }

    /**
     * Get customer purchase history (orders)
     */
    async getCustomerOrders(id: string): Promise<FireberryResponse<any[]>> {
        return fireberryService.callApi<any[]>(`${this.apiRecordPath}/${id}/orders`);
    }

    /**
     * Get customers with upcoming birthdays
     * Since there's no direct birthday endpoint in Fireberry, we'll fetch all customers
     * and filter them on our side for those with upcoming birthdays
     */
    async getUpcomingBirthdays(days: number = 30): Promise<FireberryResponse<Customer[]>> {
        try {
            // First, get all customers that have birthdays set
            const result = await fireberryService.callApi<Customer[]>(`${this.apiRecordPath}?pagesize=50`);

            if (!result.success || !result.data) {
                return {
                    success: false,
                    error: result.error || {
                        code: 'FETCH_ERROR',
                        message: 'Failed to fetch customers for birthday filtering'
                    }
                };
            }

            // If there are no Records in the response, it could mean we're getting a different structure
            const customers = Array.isArray(result.data)
                ? result.data
                : (result.data as any).Records || [];

            // Get today's date
            const today = new Date();

            // Filter customers with birthdays in the next X days
            const customersWithUpcomingBirthdays = customers.filter((customer: Customer) => {
                if (!customer.birthdaydate) return false;

                // Create a date object from the birthday
                const birthdayDate = new Date(customer.birthdaydate);

                // Set this year's birthday
                const thisYearBirthday = new Date(
                    today.getFullYear(),
                    birthdayDate.getMonth(),
                    birthdayDate.getDate()
                );

                // If the birthday already passed this year, use next year's birthday
                if (thisYearBirthday < today) {
                    thisYearBirthday.setFullYear(today.getFullYear() + 1);
                }

                // Calculate days until birthday
                const diffTime = thisYearBirthday.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Return true if birthday is within the specified range
                return diffDays >= 0 && diffDays <= days;
            });

            return {
                success: true,
                data: customersWithUpcomingBirthdays
            };
        } catch (error: any) {
            console.error("Error fetching upcoming birthdays:", error);
            return {
                success: false,
                error: {
                    code: 'PROCESSING_ERROR',
                    message: error.message || 'Unknown error occurred while processing birthdays'
                }
            };
        }
    }
}

// Export a singleton instance
export const customerService = new CustomerService(); 