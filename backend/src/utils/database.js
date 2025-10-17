const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('./logger');

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tablePrefix = process.env.DYNAMODB_TABLE_PREFIX || 'secure-pm';

// Table names
const TABLES = {
  USERS: `${tablePrefix}-users`,
  PROJECTS: `${tablePrefix}-projects`,
  TASKS: `${tablePrefix}-tasks`,
  SECURITY_EVENTS: `${tablePrefix}-security-events`,
  AUDIT_LOGS: `${tablePrefix}-audit-logs`
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    // Check if tables exist and create if needed
    // In a real application, you would use CloudFormation or CDK
    logger.info('Database initialization completed');
    return true;
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
};

// User operations
const createUser = async (user) => {
  try {
    const params = {
      TableName: TABLES.USERS,
      Item: user
    };
    
    await dynamodb.put(params).promise();
    logger.info(`User created: ${user.email}`);
    return user;
  } catch (error) {
    logger.error('Error creating user:', error);
    throw error;
  }
};

const getUserByEmail = async (email) => {
  try {
    const params = {
      TableName: TABLES.USERS,
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    };
    
    const result = await dynamodb.query(params).promise();
    return result.Items[0] || null;
  } catch (error) {
    logger.error('Error getting user by email:', error);
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    const params = {
      TableName: TABLES.USERS,
      Key: { id: userId }
    };
    
    const result = await dynamodb.get(params).promise();
    return result.Item || null;
  } catch (error) {
    logger.error('Error getting user by ID:', error);
    throw error;
  }
};

const updateUserLastLogin = async (userId, updateData) => {
  try {
    const params = {
      TableName: TABLES.USERS,
      Key: { id: userId },
      UpdateExpression: 'SET ' + Object.keys(updateData).map(key => `${key} = :${key}`).join(', '),
      ExpressionAttributeValues: Object.keys(updateData).reduce((acc, key) => {
        acc[`:${key}`] = updateData[key];
        return acc;
      }, {}),
      ReturnValues: 'ALL_NEW'
    };
    
    const result = await dynamodb.update(params).promise();
    return result.Attributes;
  } catch (error) {
    logger.error('Error updating user:', error);
    throw error;
  }
};

// Project operations
const createProject = async (project) => {
  try {
    const projectData = {
      id: uuidv4(),
      ...project,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const params = {
      TableName: TABLES.PROJECTS,
      Item: projectData
    };
    
    await dynamodb.put(params).promise();
    logger.info(`Project created: ${projectData.name}`);
    return projectData;
  } catch (error) {
    logger.error('Error creating project:', error);
    throw error;
  }
};

const getProjects = async (userId, options = {}) => {
  try {
    const params = {
      TableName: TABLES.PROJECTS,
      FilterExpression: 'contains(team, :userId)',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    };
    
    if (options.status) {
      params.FilterExpression += ' AND #status = :status';
      params.ExpressionAttributeNames = { '#status': 'status' };
      params.ExpressionAttributeValues[':status'] = options.status;
    }
    
    const result = await dynamodb.scan(params).promise();
    return result.Items || [];
  } catch (error) {
    logger.error('Error getting projects:', error);
    throw error;
  }
};

const getProjectById = async (projectId) => {
  try {
    const params = {
      TableName: TABLES.PROJECTS,
      Key: { id: projectId }
    };
    
    const result = await dynamodb.get(params).promise();
    return result.Item || null;
  } catch (error) {
    logger.error('Error getting project by ID:', error);
    throw error;
  }
};

// Task operations
const createTask = async (task) => {
  try {
    const taskData = {
      id: uuidv4(),
      ...task,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const params = {
      TableName: TABLES.TASKS,
      Item: taskData
    };
    
    await dynamodb.put(params).promise();
    logger.info(`Task created: ${taskData.title}`);
    return taskData;
  } catch (error) {
    logger.error('Error creating task:', error);
    throw error;
  }
};

const getTasks = async (projectId, options = {}) => {
  try {
    const params = {
      TableName: TABLES.TASKS,
      FilterExpression: 'projectId = :projectId',
      ExpressionAttributeValues: {
        ':projectId': projectId
      }
    };
    
    if (options.status) {
      params.FilterExpression += ' AND #status = :status';
      params.ExpressionAttributeNames = { '#status': 'status' };
      params.ExpressionAttributeValues[':status'] = options.status;
    }
    
    const result = await dynamodb.scan(params).promise();
    return result.Items || [];
  } catch (error) {
    logger.error('Error getting tasks:', error);
    throw error;
  }
};

const updateTask = async (taskId, updateData) => {
  try {
    const params = {
      TableName: TABLES.TASKS,
      Key: { id: taskId },
      UpdateExpression: 'SET ' + Object.keys(updateData).map(key => `${key} = :${key}`).join(', ') + ', updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ...Object.keys(updateData).reduce((acc, key) => {
          acc[`:${key}`] = updateData[key];
          return acc;
        }, {}),
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };
    
    const result = await dynamodb.update(params).promise();
    return result.Attributes;
  } catch (error) {
    logger.error('Error updating task:', error);
    throw error;
  }
};

// Security operations
const logSecurityEvent = async (event) => {
  try {
    const securityEvent = {
      id: uuidv4(),
      ...event,
      timestamp: new Date().toISOString()
    };
    
    const params = {
      TableName: TABLES.SECURITY_EVENTS,
      Item: securityEvent
    };
    
    await dynamodb.put(params).promise();
    logger.info(`Security event logged: ${event.type}`);
    return securityEvent;
  } catch (error) {
    logger.error('Error logging security event:', error);
    throw error;
  }
};

const getSecurityEvents = async (userId, options = {}) => {
  try {
    const params = {
      TableName: TABLES.SECURITY_EVENTS,
      FilterExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    };
    
    if (options.type) {
      params.FilterExpression += ' AND #type = :type';
      params.ExpressionAttributeNames = { '#type': 'type' };
      params.ExpressionAttributeValues[':type'] = options.type;
    }
    
    const result = await dynamodb.scan(params).promise();
    return result.Items || [];
  } catch (error) {
    logger.error('Error getting security events:', error);
    throw error;
  }
};

// Audit logging
const logAuditEvent = async (event) => {
  try {
    const auditEvent = {
      id: uuidv4(),
      ...event,
      timestamp: new Date().toISOString()
    };
    
    const params = {
      TableName: TABLES.AUDIT_LOGS,
      Item: auditEvent
    };
    
    await dynamodb.put(params).promise();
    logger.info(`Audit event logged: ${event.action}`);
    return auditEvent;
  } catch (error) {
    logger.error('Error logging audit event:', error);
    throw error;
  }
};

module.exports = {
  initializeDatabase,
  createUser,
  getUserByEmail,
  getUserById,
  updateUserLastLogin,
  createProject,
  getProjects,
  getProjectById,
  createTask,
  getTasks,
  updateTask,
  logSecurityEvent,
  getSecurityEvents,
  logAuditEvent,
  TABLES
};
