import { Response } from 'express';

/**
 * Standardized error handler for HTTP functions
 * 
 * @param error - Error object
 * @param res - HTTP response object
 */
export const handleError = (error: any, res: Response): void => {
    console.error('Error:', error);

    const statusCode = error.status || error.statusCode || 500;
    const message = error.message || 'An unexpected error occurred';

    res.status(statusCode).json({
        success: false,
        message,
        error: error.toString()
    });
}; 