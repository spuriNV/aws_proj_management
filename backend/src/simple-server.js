const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for development (replace with database later)
const users = [];
const projects = [];
const tasks = [];

// Add some sample data for demo purposes
if (users.length === 0) {
  users.push({
    id: 'demo-user-1',
    name: 'Demo User',
    email: 'demo@example.com',
    password: '$2b$10$demo.hash.here', // This would be properly hashed
    role: 'admin',
    createdAt: new Date().toISOString()
  });
}

// Simple authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running!' });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      role: 'member',
      createdAt: new Date().toISOString()
    };
    
    users.push(user);
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Project routes
app.get('/api/projects', authenticateToken, (req, res) => {
  const userProjects = projects.filter(p => p.team.includes(req.user.userId));
  res.json({ projects: userProjects, count: userProjects.length });
});

app.post('/api/projects', authenticateToken, (req, res) => {
  try {
    const { name, description, status = 'active', team = [] } = req.body;
    
    const project = {
      id: uuidv4(),
      name,
      description,
      status,
      team: [...team, req.user.userId],
      createdBy: req.user.userId,
      progress: 0,
      tasks: 0,
      createdAt: new Date().toISOString()
    };
    
    projects.push(project);
    
    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Task routes
app.get('/api/tasks/project/:projectId', authenticateToken, (req, res) => {
  const { projectId } = req.params;
  const projectTasks = tasks.filter(t => t.projectId === projectId);
  res.json({ tasks: projectTasks, count: projectTasks.length });
});

app.post('/api/tasks', authenticateToken, (req, res) => {
  try {
    const { title, description, status = 'todo', priority = 'medium', assignee, dueDate, projectId } = req.body;
    
    const task = {
      id: uuidv4(),
      title,
      description,
      status,
      priority,
      assignee,
      dueDate,
      projectId,
      createdBy: req.user.userId,
      createdAt: new Date().toISOString()
    };
    
    tasks.push(task);
    
    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoints: http://localhost:${PORT}/api`);
});
