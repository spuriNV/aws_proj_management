const { logger } = require('../utils/logger');

// Security middleware for request validation and protection
const securityMiddleware = (req, res, next) => {
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Log security-relevant requests
  if (req.path.includes('/auth') || req.path.includes('/security')) {
    logger.info(`Security request: ${req.method} ${req.path} from ${req.ip}`);
  }
  
  next();
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Remove potentially dangerous characters from string inputs
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  };

  // Sanitize body
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    }
  }

  // Sanitize query parameters
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key]);
      }
    }
  }

  next();
};

// Rate limiting for sensitive endpoints
const sensitiveEndpointLimiter = (req, res, next) => {
  const sensitivePaths = ['/auth/login', '/auth/register', '/auth/change-password'];
  
  if (sensitivePaths.includes(req.path)) {
    // Apply stricter rate limiting for sensitive endpoints
    // This would integrate with your rate limiting solution
    logger.info(`Sensitive endpoint accessed: ${req.path} from ${req.ip}`);
  }
  
  next();
};

// Audit logging middleware
const auditLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log the request
  logger.info(`Request: ${req.method} ${req.path} from ${req.ip}`, {
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    userId: req.user?.userId || 'anonymous'
  });
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - startTime;
    
    logger.info(`Response: ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`, {
      statusCode: res.statusCode,
      duration,
      userId: req.user?.userId || 'anonymous'
    });
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

module.exports = {
  securityMiddleware,
  sanitizeInput,
  sensitiveEndpointLimiter,
  auditLogger
};
