const { logger } = require('./logger');
const { logSecurityEvent } = require('./logger');

// WebSocket connection management
const connectedUsers = new Map();
const projectRooms = new Map();

const setupWebSocket = (io) => {
  io.on('connection', (socket) => {
    logger.info(`WebSocket connection established: ${socket.id}`);

    // Handle user authentication
    socket.on('authenticate', (data) => {
      try {
        const { userId, token } = data;
        
        // In a real application, you would verify the JWT token here
        // For now, we'll just store the user ID
        connectedUsers.set(socket.id, {
          userId,
          socketId: socket.id,
          connectedAt: new Date().toISOString()
        });

        socket.emit('authenticated', { success: true });
        logger.info(`User authenticated via WebSocket: ${userId}`);
      } catch (error) {
        logger.error('WebSocket authentication error:', error);
        socket.emit('authentication_error', { message: 'Authentication failed' });
      }
    });

    // Handle joining project rooms
    socket.on('join_project', (data) => {
      try {
        const { projectId } = data;
        const user = connectedUsers.get(socket.id);
        
        if (!user) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        socket.join(`project_${projectId}`);
        
        // Track project room membership
        if (!projectRooms.has(projectId)) {
          projectRooms.set(projectId, new Set());
        }
        projectRooms.get(projectId).add(socket.id);

        socket.emit('joined_project', { projectId });
        logger.info(`User ${user.userId} joined project ${projectId}`);
      } catch (error) {
        logger.error('Error joining project room:', error);
        socket.emit('error', { message: 'Failed to join project' });
      }
    });

    // Handle leaving project rooms
    socket.on('leave_project', (data) => {
      try {
        const { projectId } = data;
        socket.leave(`project_${projectId}`);
        
        if (projectRooms.has(projectId)) {
          projectRooms.get(projectId).delete(socket.id);
        }

        socket.emit('left_project', { projectId });
        logger.info(`User left project ${projectId}`);
      } catch (error) {
        logger.error('Error leaving project room:', error);
      }
    });

    // Handle real-time task updates
    socket.on('task_update', (data) => {
      try {
        const { projectId, taskId, updates } = data;
        const user = connectedUsers.get(socket.id);
        
        if (!user) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        // Broadcast update to all users in the project room
        socket.to(`project_${projectId}`).emit('task_updated', {
          taskId,
          updates,
          updatedBy: user.userId,
          timestamp: new Date().toISOString()
        });

        // Log the update for audit purposes
        logSecurityEvent({
          type: 'task_update',
          userId: user.userId,
          projectId,
          taskId,
          updates,
          ipAddress: socket.handshake.address
        });

        logger.info(`Task updated in project ${projectId} by user ${user.userId}`);
      } catch (error) {
        logger.error('Error handling task update:', error);
        socket.emit('error', { message: 'Failed to update task' });
      }
    });

    // Handle real-time project updates
    socket.on('project_update', (data) => {
      try {
        const { projectId, updates } = data;
        const user = connectedUsers.get(socket.id);
        
        if (!user) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        // Broadcast update to all users in the project room
        socket.to(`project_${projectId}`).emit('project_updated', {
          projectId,
          updates,
          updatedBy: user.userId,
          timestamp: new Date().toISOString()
        });

        logger.info(`Project updated ${projectId} by user ${user.userId}`);
      } catch (error) {
        logger.error('Error handling project update:', error);
        socket.emit('error', { message: 'Failed to update project' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      try {
        const { projectId, taskId } = data;
        const user = connectedUsers.get(socket.id);
        
        if (!user) return;

        socket.to(`project_${projectId}`).emit('user_typing', {
          userId: user.userId,
          taskId,
          isTyping: true
        });
      } catch (error) {
        logger.error('Error handling typing start:', error);
      }
    });

    socket.on('typing_stop', (data) => {
      try {
        const { projectId, taskId } = data;
        const user = connectedUsers.get(socket.id);
        
        if (!user) return;

        socket.to(`project_${projectId}`).emit('user_typing', {
          userId: user.userId,
          taskId,
          isTyping: false
        });
      } catch (error) {
        logger.error('Error handling typing stop:', error);
      }
    });

    // Handle file sharing notifications
    socket.on('file_shared', (data) => {
      try {
        const { projectId, fileName, fileSize } = data;
        const user = connectedUsers.get(socket.id);
        
        if (!user) return;

        socket.to(`project_${projectId}`).emit('file_shared', {
          fileName,
          fileSize,
          sharedBy: user.userId,
          timestamp: new Date().toISOString()
        });

        logger.info(`File shared in project ${projectId}: ${fileName}`);
      } catch (error) {
        logger.error('Error handling file share:', error);
      }
    });

    // Handle security alerts
    socket.on('security_alert', (data) => {
      try {
        const { projectId, alertType, message } = data;
        const user = connectedUsers.get(socket.id);
        
        if (!user) return;

        // Broadcast security alert to all users in the project
        socket.to(`project_${projectId}`).emit('security_alert', {
          alertType,
          message,
          reportedBy: user.userId,
          timestamp: new Date().toISOString()
        });

        // Log security alert
        logSecurityEvent({
          type: 'security_alert',
          userId: user.userId,
          projectId,
          alertType,
          message,
          severity: 'medium'
        });

        logger.info(`Security alert in project ${projectId}: ${alertType}`);
      } catch (error) {
        logger.error('Error handling security alert:', error);
      }
    });

    // Handle connection errors
    socket.on('error', (error) => {
      logger.error('WebSocket error:', error);
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      const user = connectedUsers.get(socket.id);
      
      if (user) {
        logger.info(`User disconnected: ${user.userId} (${reason})`);
        
        // Clean up project room memberships
        for (const [projectId, members] of projectRooms.entries()) {
          if (members.has(socket.id)) {
            members.delete(socket.id);
            if (members.size === 0) {
              projectRooms.delete(projectId);
            }
          }
        }
        
        connectedUsers.delete(socket.id);
      } else {
        logger.info(`Anonymous user disconnected: ${socket.id} (${reason})`);
      }
    });
  });

  // Broadcast system-wide notifications
  const broadcastNotification = (notification) => {
    io.emit('system_notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  };

  // Get connected users count
  const getConnectedUsersCount = () => {
    return connectedUsers.size;
  };

  // Get project room members
  const getProjectRoomMembers = (projectId) => {
    return projectRooms.get(projectId) || new Set();
  };

  return {
    broadcastNotification,
    getConnectedUsersCount,
    getProjectRoomMembers
  };
};

module.exports = {
  setupWebSocket
};
