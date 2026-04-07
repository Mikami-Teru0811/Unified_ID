// Standardized API response utilities

export const successResponse = (data = null, message = 'Success') => ({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
});

export const errorResponse = (message = 'An error occurred', code = 'ERROR') => ({
    success: false,
    error: message,
    code,
    timestamp: new Date().toISOString()
});

export const createdResponse = (data, message = 'Created successfully') => ({
    success: true,
    message,
    data,
    created: true,
    timestamp: new Date().toISOString()
});

export const notFoundResponse = (resource = 'Resource') => ({
    success: false,
    error: `${resource} not found`,
    code: 'NOT_FOUND',
    timestamp: new Date().toISOString()
});

export const validationErrorResponse = (errors) => ({
    success: false,
    error: 'Validation failed',
    code: 'VALIDATION_ERROR',
    errors,
    timestamp: new Date().toISOString()
});
