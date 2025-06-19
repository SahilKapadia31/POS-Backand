import { fireberryService, FireberryResponse } from './fireberry-service';

// Invoice item interface
export interface InvoiceItem {
    id?: string;
    productId: string;
    productName: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
}

// Invoice interface
export interface Invoice {
    id?: string;
    number?: string;
    type: 'invoice' | 'quote' | 'receipt';
    date: string;
    dueDate?: string;
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    customerAddress?: string;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    notes?: string;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    paymentMethod?: 'cash' | 'credit' | 'bank' | 'mobile';
    paymentDate?: string;
}

// Pagination params interface
export interface PaginationParams {
    pageSize?: number;
    pageNumber?: number;
}

export class InvoiceService {
    private basePath = 'invoices';
    private apiRecordPath = 'api/record/invoiceno';

    /**
     * Get all invoices
     */
    async getAllInvoices(params: PaginationParams = {}): Promise<FireberryResponse<Invoice[]>> {
        const pageSize = params.pageSize || 50;
        const pageNumber = params.pageNumber || 1;

        const queryParams = `pagesize=${pageSize}&pagenumber=${pageNumber}`;
        return fireberryService.callApi<Invoice[]>(`${this.apiRecordPath}?${queryParams}`);
    }

    /**
     * Get an invoice by ID
     */
    async getInvoiceById(id: string): Promise<FireberryResponse<Invoice>> {
        return fireberryService.callApi<Invoice>(`${this.basePath}/${id}`);
    }

    /**
     * Create a new invoice
     */
    async createInvoice(invoice: Omit<Invoice, 'id'>): Promise<FireberryResponse<Invoice>> {
        return fireberryService.callApi<Invoice>(this.basePath, 'POST', invoice);
    }

    /**
     * Update an existing invoice
     */
    async updateInvoice(id: string, invoice: Partial<Invoice>): Promise<FireberryResponse<Invoice>> {
        return fireberryService.callApi<Invoice>(`${this.basePath}/${id}`, 'PUT', invoice);
    }

    /**
     * Delete an invoice
     */
    async deleteInvoice(id: string): Promise<FireberryResponse<void>> {
        return fireberryService.callApi<void>(`${this.basePath}/${id}`, 'DELETE');
    }

    /**
     * Mark invoice as paid
     */
    async markAsPaid(id: string, paymentData: {
        paymentMethod: 'cash' | 'credit' | 'bank' | 'mobile',
        paymentDate: string
    }): Promise<FireberryResponse<Invoice>> {
        return fireberryService.callApi<Invoice>(
            `${this.basePath}/${id}/pay`,
            'POST',
            paymentData
        );
    }

    /**
     * Send invoice by email
     */
    async sendInvoice(id: string, emailData: {
        to: string,
        subject?: string,
        message?: string
    }): Promise<FireberryResponse<any>> {
        return fireberryService.callApi<any>(
            `${this.basePath}/${id}/send`,
            'POST',
            emailData
        );
    }

    /**
     * Get invoice as PDF
     */
    async getInvoicePdf(id: string): Promise<FireberryResponse<{ url: string }>> {
        return fireberryService.callApi<{ url: string }>(`${this.basePath}/${id}/pdf`);
    }
}

// Export a singleton instance
export const invoiceService = new InvoiceService(); 