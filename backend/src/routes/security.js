const express = require('express');
const { authenticateToken, requireAdmin, requireManager } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');
const { getSecurityEvents, logSecurityEvent } = require('../utils/database');
const { logger } = require('../utils/logger');

const router = express.Router();

// Get security events for a user
router.get('/events', authenticateToken, async (req, res) => {
  try {
    const { type, limit = 50 } = req.query;
    
    const events = await getSecurityEvents(req.user.userId, { 
      type: type || undefined 
    });
    
    // Sort by timestamp descending and limit results
    const sortedEvents = events
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit));
    
    res.json({
      events: sortedEvents,
      count: sortedEvents.length
    });
  } catch (error) {
    logger.error('Error getting security events:', error);
    res.status(500).json({
      error: 'Failed to get security events',
      message: 'An error occurred while fetching security events'
    });
  }
});

// Get security dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const events = await getSecurityEvents(req.user.userId);
    
    // Calculate security metrics
    const totalEvents = events.length;
    const criticalEvents = events.filter(e => e.severity === 'critical').length;
    const highEvents = events.filter(e => e.severity === 'high').length;
    const mediumEvents = events.filter(e => e.severity === 'medium').length;
    const lowEvents = events.filter(e => e.severity === 'low').length;
    
    // Recent events (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEvents = events.filter(e => new Date(e.timestamp) > oneDayAgo);
    
    // Event types
    const eventTypes = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      summary: {
        totalEvents,
        criticalEvents,
        highEvents,
        mediumEvents,
        lowEvents,
        recentEvents: recentEvents.length
      },
      eventTypes,
      recentEvents: recentEvents.slice(0, 10)
    });
  } catch (error) {
    logger.error('Error getting security dashboard:', error);
    res.status(500).json({
      error: 'Failed to get security dashboard',
      message: 'An error occurred while fetching security dashboard data'
    });
  }
});

// Report security incident
router.post('/incident', authenticateToken, validateRequest(schemas.securityEvent), async (req, res) => {
  try {
    const { type, severity, description, ipAddress, userAgent } = req.body;
    
    const securityEvent = await logSecurityEvent({
      type,
      severity,
      description,
      userId: req.user.userId,
      ipAddress: ipAddress || req.ip,
      userAgent: userAgent || req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
    
    logger.info(`Security incident reported: ${type} by ${req.user.userId}`);
    
    res.status(201).json({
      message: 'Security incident reported successfully',
      event: securityEvent
    });
  } catch (error) {
    logger.error('Error reporting security incident:', error);
    res.status(500).json({
      error: 'Failed to report security incident',
      message: 'An error occurred while reporting the security incident'
    });
  }
});

// Get security recommendations
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const events = await getSecurityEvents(req.user.userId);
    
    const recommendations = [];
    
    // Check for failed login attempts
    const failedLogins = events.filter(e => e.type === 'failed_login');
    if (failedLogins.length > 5) {
      recommendations.push({
        type: 'security',
        priority: 'high',
        title: 'Multiple Failed Login Attempts',
        description: 'Consider enabling two-factor authentication for better security',
        action: 'Enable MFA in your account settings'
      });
    }
    
    // Check for password changes
    const passwordChanges = events.filter(e => e.type === 'password_change');
    if (passwordChanges.length === 0) {
      recommendations.push({
        type: 'security',
        priority: 'medium',
        title: 'Password Security',
        description: 'Consider changing your password regularly for better security',
        action: 'Update your password in account settings'
      });
    }
    
    // Check for recent security events
    const recentEvents = events.filter(e => {
      const eventDate = new Date(e.timestamp);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return eventDate > oneWeekAgo;
    });
    
    if (recentEvents.length > 10) {
      recommendations.push({
        type: 'monitoring',
        priority: 'medium',
        title: 'High Activity Detected',
        description: 'Unusual activity detected in your account',
        action: 'Review your recent activity and contact support if needed'
      });
    }
    
    res.json({
      recommendations,
      count: recommendations.length
    });
  } catch (error) {
    logger.error('Error getting security recommendations:', error);
    res.status(500).json({
      error: 'Failed to get security recommendations',
      message: 'An error occurred while fetching security recommendations'
    });
  }
});

// Get security audit log (admin only)
router.get('/audit', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId, type, startDate, endDate, limit = 100 } = req.query;
    
    // In a real app, you'd have a getAuditLogs function
    const auditLogs = []; // Placeholder
    
    res.json({
      auditLogs,
      count: auditLogs.length
    });
  } catch (error) {
    logger.error('Error getting audit log:', error);
    res.status(500).json({
      error: 'Failed to get audit log',
      message: 'An error occurred while fetching the audit log'
    });
  }
});

module.exports = router;
