const Joi = require('joi');

// Generic validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        error: 'Validation error',
        message: errorMessage,
        details: error.details
      });
    }
    
    next();
  };
};

// Validation schemas for different entities
const schemas = {
  // User validation
  user: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    role: Joi.string().valid('admin', 'manager', 'member').optional()
  }),

  // Project validation
  project: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500).optional(),
    status: Joi.string().valid('active', 'completed', 'on-hold').optional(),
    team: Joi.array().items(Joi.string()).optional()
  }),

  // Task validation
  task: Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().max(1000).optional(),
    status: Joi.string().valid('todo', 'in-progress', 'completed').optional(),
    priority: Joi.string().valid('low', 'medium', 'high').optional(),
    assignee: Joi.string().optional(),
    dueDate: Joi.date().optional(),
    projectId: Joi.string().required()
  }),

  // Security event validation
  securityEvent: Joi.object({
    type: Joi.string().valid('login', 'logout', 'failed_login', 'password_change', 'permission_change').required(),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
    description: Joi.string().max(500).required(),
    ipAddress: Joi.string().ip().optional(),
    userAgent: Joi.string().max(500).optional()
  }),

  // File upload validation
  fileUpload: Joi.object({
    fileName: Joi.string().min(1).max(255).required(),
    fileSize: Joi.number().max(10 * 1024 * 1024).required(), // 10MB max
    fileType: Joi.string().valid('image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain').required()
  })
};

// Query parameter validation
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        error: 'Query validation error',
        message: errorMessage
      });
    }
    
    next();
  };
};

// Pagination validation
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// Search validation
const searchSchema = Joi.object({
  q: Joi.string().min(1).max(100).optional(),
  status: Joi.string().optional(),
  priority: Joi.string().optional(),
  assignee: Joi.string().optional()
});

module.exports = {
  validateRequest,
  validateQuery,
  schemas,
  paginationSchema,
  searchSchema
};
