import { Request, Response } from 'express';
import cors from 'cors';

const corsHandler = cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
});

/**
 * Handle CORS for HTTP functions
 * @param req - HTTP request
 * @param res - HTTP response
 * @returns Promise that resolves when CORS is handled
 */
export const applyCors = (req: Request, res: Response): Promise<void> => {
    return new Promise((resolve) => {
        corsHandler(req, res, () => {
            resolve();
        });
    });
}; 