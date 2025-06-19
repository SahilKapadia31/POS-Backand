import { fireberryService, FireberryResponse } from './fireberry-service';

// Repair part interface
export interface RepairPart {
    id?: string;
    name: string;
    price: number;
    quantity: number;
    status: 'in-stock' | 'ordered' | 'received' | 'used';
}

// Repair log interface
export interface RepairLog {
    id?: string;
    date: Date | string;
    technician: string;
    action: string;
    notes?: string;
}

// Repair ticket interface
export interface RepairTicket {
    id?: string;
    ticketNumber: string;
    customerId?: string;
    customerName: string;
    customerPhone: string;
    deviceType: string;
    deviceModel: string;
    serialNumber?: string;
    issue: string;
    status: 'pending' | 'in-progress' | 'waiting-parts' | 'completed' | 'delivered';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimatedCost: number;
    actualCost?: number;
    dateCreated: string;
    estimatedCompletion?: string;
    completionDate?: string;
    notes?: string;
    technician?: string;
    parts?: RepairPart[];
    logs?: RepairLog[];
}

// Pagination params interface
export interface PaginationParams {
    pageSize?: number;
    pageNumber?: number;
}

export class RepairService {
    private apiRecordPath = 'api/record/cases';

    /**
     * Get all repair tickets
     */
    async getAllRepairs(params: PaginationParams = {}): Promise<FireberryResponse<RepairTicket[]>> {
        const pageSize = params.pageSize || 50;
        const pageNumber = params.pageNumber || 1;

        const queryParams = `pagesize=${pageSize}&pagenumber=${pageNumber}`;
        return fireberryService.callApi<RepairTicket[]>(`${this.apiRecordPath}?${queryParams}`);
    }

    /**
     * Get a repair ticket by ID
     */
    async getRepairById(id: string): Promise<FireberryResponse<RepairTicket>> {
        return fireberryService.callApi<RepairTicket>(`${this.apiRecordPath}/${id}`);
    }

    /**
     * Create a new repair ticket
     */
    async createRepair(repair: Omit<RepairTicket, 'id'>): Promise<FireberryResponse<RepairTicket>> {
        return fireberryService.callApi<RepairTicket>(this.apiRecordPath, 'POST', repair);
    }

    /**
     * Update an existing repair ticket
     */
    async updateRepair(id: string, repair: Partial<RepairTicket>): Promise<FireberryResponse<RepairTicket>> {
        return fireberryService.callApi<RepairTicket>(`${this.apiRecordPath}/${id}`, 'PUT', repair);
    }

    /**
     * Delete a repair ticket
     */
    async deleteRepair(id: string): Promise<FireberryResponse<void>> {
        return fireberryService.callApi<void>(`${this.apiRecordPath}/${id}`, 'DELETE');
    }

    /**
     * Update repair status
     */
    async updateStatus(id: string, status: RepairTicket['status']): Promise<FireberryResponse<RepairTicket>> {
        return fireberryService.callApi<RepairTicket>(
            `${this.apiRecordPath}/${id}/status`,
            'POST',
            { status }
        );
    }

    /**
     * Assign technician to repair
     */
    async assignTechnician(id: string, technician: string): Promise<FireberryResponse<RepairTicket>> {
        return fireberryService.callApi<RepairTicket>(
            `${this.apiRecordPath}/${id}/assign`,
            'POST',
            { technician }
        );
    }

    /**
     * Add part to repair
     */
    async addPart(id: string, part: Omit<RepairPart, 'id'>): Promise<FireberryResponse<RepairTicket>> {
        return fireberryService.callApi<RepairTicket>(
            `${this.apiRecordPath}/${id}/parts`,
            'POST',
            part
        );
    }

    /**
     * Add log entry to repair
     */
    async addLogEntry(id: string, log: Omit<RepairLog, 'id'>): Promise<FireberryResponse<RepairTicket>> {
        return fireberryService.callApi<RepairTicket>(
            `${this.apiRecordPath}/${id}/logs`,
            'POST',
            log
        );
    }

    /**
     * Complete repair
     */
    async completeRepair(id: string, data: {
        actualCost: number,
        notes?: string
    }): Promise<FireberryResponse<RepairTicket>> {
        return fireberryService.callApi<RepairTicket>(
            `${this.apiRecordPath}/${id}/complete`,
            'POST',
            data
        );
    }
}

// Export a singleton instance
export const repairService = new RepairService(); 