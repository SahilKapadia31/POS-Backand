import * as functions from 'firebase-functions';
import axios, { AxiosRequestConfig } from 'axios';

// Fireberry API response interface
export interface FireberryResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}

// Define HTTP methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export class FireberryService {
    private baseUrl: string;
    private token: string;

    constructor() {
        // Get the base URL and token from Firebase config
        this.baseUrl = 'https://api.fireberry.com';
        this.token = functions.config().fireberry?.token || '';
    }

    /**
     * Generic method to call the Fireberry API
     */
    async callApi<T>(
        endpoint: string,
        method: HttpMethod = 'GET',
        data?: any
    ): Promise<FireberryResponse<T>> {
        try {
            const config: AxiosRequestConfig = {
                url: `${this.baseUrl}/${endpoint}`,
                method,
                headers: {
                    'accept': 'application/json',
                    'tokenid': this.token,
                    'Content-Type': 'application/json',
                },
            };

            if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                config.data = data;
            }

            const response = await axios(config);

            return {
                success: true,
                data: response.data as T
            };
        } catch (error: any) {
            console.error(`Error calling Fireberry API (${endpoint}):`, error);

            return {
                success: false,
                error: {
                    code: error.response?.status?.toString() || 'unknown',
                    message: error.message || 'Unknown error occurred'
                }
            };
        }
    }

    /**
     * Check if the service is properly configured
     */
    isConfigured(): boolean {
        return Boolean(this.token);
    }
}

// Create and export a singleton instance
export const fireberryService = new FireberryService(); 