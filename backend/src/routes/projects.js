const express = require('express');
const { authenticateToken, requireMember } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');
const { createProject, getProjects, getProjectById } = require('../utils/database');
const { logger } = require('../utils/logger');

const router = express.Router();

// Get all projects for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    const projects = await getProjects(req.user.userId, { status });
    
    res.json({
      projects,
      count: projects.length
    });
  } catch (error) {
    logger.error('Error getting projects:', error);
    res.status(500).json({
      error: 'Failed to get projects',
      message: 'An error occurred while fetching projects'
    });
  }
});

// Get a specific project
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const project = await getProjectById(id);
    
    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: 'The requested project does not exist'
      });
    }
    
    // Check if user has access to this project
    if (!project.team.includes(req.user.userId)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this project'
      });
    }
    
    res.json({ project });
  } catch (error) {
    logger.error('Error getting project:', error);
    res.status(500).json({
      error: 'Failed to get project',
      message: 'An error occurred while fetching the project'
    });
  }
});

// Create a new project
router.post('/', authenticateToken, requireMember, validateRequest(schemas.project), async (req, res) => {
  try {
    const { name, description, status = 'active', team = [] } = req.body;
    
    // Add creator to team
    const projectTeam = [...team, req.user.userId];
    
    const project = await createProject({
      name,
      description,
      status,
      team: projectTeam,
      createdBy: req.user.userId,
      progress: 0,
      tasks: 0
    });
    
    logger.info(`Project created: ${name} by ${req.user.userId}`);
    
    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    logger.error('Error creating project:', error);
    res.status(500).json({
      error: 'Failed to create project',
      message: 'An error occurred while creating the project'
    });
  }
});

// Update a project
router.put('/:id', authenticateToken, requireMember, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, team } = req.body;
    
    const project = await getProjectById(id);
    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: 'The requested project does not exist'
      });
    }
    
    // Check if user has access to this project
    if (!project.team.includes(req.user.userId)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this project'
      });
    }
    
    // Update project (in a real app, you'd have an updateProject function)
    const updatedProject = {
      ...project,
      name: name || project.name,
      description: description || project.description,
      status: status || project.status,
      team: team || project.team,
      updatedAt: new Date().toISOString()
    };
    
    logger.info(`Project updated: ${id} by ${req.user.userId}`);
    
    res.json({
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    logger.error('Error updating project:', error);
    res.status(500).json({
      error: 'Failed to update project',
      message: 'An error occurred while updating the project'
    });
  }
});

// Delete a project
router.delete('/:id', authenticateToken, requireMember, async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await getProjectById(id);
    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: 'The requested project does not exist'
      });
    }
    
    // Check if user is the creator or has admin access
    if (project.createdBy !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to delete this project'
      });
    }
    
    // In a real app, you'd have a deleteProject function
    logger.info(`Project deleted: ${id} by ${req.user.userId}`);
    
    res.json({
      message: 'Project deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting project:', error);
    res.status(500).json({
      error: 'Failed to delete project',
      message: 'An error occurred while deleting the project'
    });
  }
});

module.exports = router;
