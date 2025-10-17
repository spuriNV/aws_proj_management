const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'secure-project-management' },
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Security-specific logger
const securityLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'security' },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'security.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10
    })
  ]
});

// Audit logger
const auditLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'audit' },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'audit.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 20
    })
  ]
});

// Helper functions for different types of logging
const logSecurityEvent = (event, metadata = {}) => {
  securityLogger.info('Security Event', {
    ...event,
    ...metadata,
    timestamp: new Date().toISOString()
  });
};

const logAuditEvent = (event, metadata = {}) => {
  auditLogger.info('Audit Event', {
    ...event,
    ...metadata,
    timestamp: new Date().toISOString()
  });
};

const logError = (error, metadata = {}) => {
  logger.error('Application Error', {
    error: error.message,
    stack: error.stack,
    ...metadata
  });
};

const logInfo = (message, metadata = {}) => {
  logger.info(message, metadata);
};

const logWarning = (message, metadata = {}) => {
  logger.warn(message, metadata);
};

module.exports = {
  logger,
  securityLogger,
  auditLogger,
  logSecurityEvent,
  logAuditEvent,
  logError,
  logInfo,
  logWarning
};
