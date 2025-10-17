const { logger } = require('../utils/logger');

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let error = 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    error = 'Validation Error';
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    error = 'Unauthorized';
    message = 'Authentication required';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    error = 'Forbidden';
    message = 'Access denied';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    error = 'Not Found';
    message = 'Resource not found';
  } else if (err.name === 'ConflictError') {
    statusCode = 409;
    error = 'Conflict';
    message = err.message;
  } else if (err.name === 'TooManyRequestsError') {
    statusCode = 429;
    error = 'Too Many Requests';
    message = 'Rate limit exceeded';
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
  }

  // Send error response
  res.status(statusCode).json({
    error,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler
};
