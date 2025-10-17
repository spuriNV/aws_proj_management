const express = require('express');
const { authenticateToken, requireAdmin, requireManager } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');
const { getUserById, updateUserLastLogin } = require('../utils/database');
const { logger } = require('../utils/logger');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }
    
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        securityScore: user.securityScore,
        mfaEnabled: user.mfaEnabled
      }
    });
  } catch (error) {
    logger.error('Error getting user profile:', error);
    res.status(500).json({
      error: 'Failed to get user profile',
      message: 'An error occurred while fetching the user profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, validateRequest(schemas.user), async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const updatedUser = await updateUserLastLogin(req.user.userId, {
      name: name || undefined,
      email: email || undefined
    });
    
    if (!updatedUser) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found'
      });
    }
    
    logger.info(`User profile updated: ${req.user.userId}`);
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        lastLogin: updatedUser.lastLogin,
        securityScore: updatedUser.securityScore
      }
    });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: 'An error occurred while updating the profile'
    });
  }
});

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // In a real app, you'd have a getAllUsers function
    const users = []; // Placeholder
    
    res.json({
      users,
      count: users.length
    });
  } catch (error) {
    logger.error('Error getting users:', error);
    res.status(500).json({
      error: 'Failed to get users',
      message: 'An error occurred while fetching users'
    });
  }
});

// Update user role (admin only)
router.put('/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['admin', 'manager', 'member'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role',
        message: 'Role must be admin, manager, or member'
      });
    }
    
    const updatedUser = await updateUserLastLogin(id, { role });
    
    if (!updatedUser) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found'
      });
    }
    
    logger.info(`User role updated: ${id} to ${role} by ${req.user.userId}`);
    
    res.json({
      message: 'User role updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    logger.error('Error updating user role:', error);
    res.status(500).json({
      error: 'Failed to update user role',
      message: 'An error occurred while updating the user role'
    });
  }
});

// Deactivate user (admin only)
router.put('/:id/deactivate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedUser = await updateUserLastLogin(id, { isActive: false });
    
    if (!updatedUser) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found'
      });
    }
    
    logger.info(`User deactivated: ${id} by ${req.user.userId}`);
    
    res.json({
      message: 'User deactivated successfully'
    });
  } catch (error) {
    logger.error('Error deactivating user:', error);
    res.status(500).json({
      error: 'Failed to deactivate user',
      message: 'An error occurred while deactivating the user'
    });
  }
});

module.exports = router;
