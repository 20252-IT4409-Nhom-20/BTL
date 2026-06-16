//generate a custom error class for API errors
class APIError extends Error {
    constructor(statusCode, code, message) {
        super(message);
        this.name = 'APIError';
        this.statusCode = statusCode;
        this.code = code;
        Error.captureStackTrace(this, APIError);
    }
}

module.exports = APIError;
