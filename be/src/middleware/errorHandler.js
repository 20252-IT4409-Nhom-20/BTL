const APIError = require('../utils/APIError');
const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    const isKnownError = err instanceof APIError;
    const statusCode = isKnownError ? err.statusCode : 500;
    const code = isKnownError ? err.code : 'INTERNAL_SERVER_ERROR';
    const message = isKnownError ? err.message : 'Internal server error';

    if (statusCode >= 500) {
        logger.error({ err, method: req.method, path: req.originalUrl }, message);
    }

    const payload = {
        status: 'error',
        code,
        message,
    };

    if (process.env.NODE_ENV !== 'production' && err.stack) {
        payload.stack = err.stack;
    }

    return res.status(statusCode).json(payload);
}

module.exports = errorHandler;
