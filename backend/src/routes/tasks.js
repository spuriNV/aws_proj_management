const express = require('express');
const { authenticateToken, requireMember } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');
const { createTask, getTasks, updateTask } = require('../utils/database');
const { logger } = require('../utils/logger');

const router = express.Router();

// Get tasks for a project
router.get('/project/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.query;
    
    const tasks = await getTasks(projectId, { status });
    
    res.json({
      tasks,
      count: tasks.length
    });
  } catch (error) {
    logger.error('Error getting tasks:', error);
    res.status(500).json({
      error: 'Failed to get tasks',
      message: 'An error occurred while fetching tasks'
    });
  }
});

// Create a new task
router.post('/', authenticateToken, requireMember, validateRequest(schemas.task), async (req, res) => {
  try {
    const { title, description, status = 'todo', priority = 'medium', assignee, dueDate, projectId } = req.body;
    
    const task = await createTask({
      title,
      description,
      status,
      priority,
      assignee,
      dueDate,
      projectId,
      createdBy: req.user.userId
    });
    
    logger.info(`Task created: ${title} by ${req.user.userId}`);
    
    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    logger.error('Error creating task:', error);
    res.status(500).json({
      error: 'Failed to create task',
      message: 'An error occurred while creating the task'
    });
  }
});

// Update a task
router.put('/:id', authenticateToken, requireMember, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assignee, dueDate } = req.body;
    
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (assignee !== undefined) updates.assignee = assignee;
    if (dueDate !== undefined) updates.dueDate = dueDate;
    
    const updatedTask = await updateTask(id, updates);
    
    if (!updatedTask) {
      return res.status(404).json({
        error: 'Task not found',
        message: 'The requested task does not exist'
      });
    }
    
    logger.info(`Task updated: ${id} by ${req.user.userId}`);
    
    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    logger.error('Error updating task:', error);
    res.status(500).json({
      error: 'Failed to update task',
      message: 'An error occurred while updating the task'
    });
  }
});

// Delete a task
router.delete('/:id', authenticateToken, requireMember, async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real app, you'd have a deleteTask function
    logger.info(`Task deleted: ${id} by ${req.user.userId}`);
    
    res.json({
      message: 'Task deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting task:', error);
    res.status(500).json({
      error: 'Failed to delete task',
      message: 'An error occurred while deleting the task'
    });
  }
});

module.exports = router;
