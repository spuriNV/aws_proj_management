# Setup Instructions

## Prerequisites

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **AWS Account** - [Sign up here](https://aws.amazon.com/)
3. **AWS CLI** - [Install here](https://aws.amazon.com/cli/)
4. **Git** - [Download here](https://git-scm.com/)

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd secure-project-management

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
```

### 2. AWS Setup

```bash
# Configure AWS credentials
aws configure

# Deploy infrastructure
cd aws/scripts
./deploy.sh dev us-east-1
```

### 3. Environment Configuration

```bash
# Copy environment file
cd backend
cp env.example .env

# Edit .env with your AWS credentials and settings
nano .env
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Detailed Setup

### AWS Infrastructure

The project uses the following AWS services:

- **DynamoDB**: Database for users, projects, tasks, and security events
- **S3**: File storage with versioning
- **CloudFront**: CDN for static assets
- **API Gateway**: REST API endpoints
- **Lambda**: Serverless functions
- **WAF**: Web Application Firewall
- **CloudTrail**: Audit logging

### Database Schema

#### Users Table
- `id` (String, Primary Key)
- `email` (String, GSI)
- `name` (String)
- `password` (String, hashed)
- `role` (String: admin, manager, member)
- `isActive` (Boolean)
- `createdAt` (String, ISO date)
- `lastLogin` (String, ISO date)
- `securityScore` (Number)
- `mfaEnabled` (Boolean)

#### Projects Table
- `id` (String, Primary Key)
- `name` (String)
- `description` (String)
- `status` (String: active, completed, on-hold)
- `team` (List of Strings)
- `createdBy` (String)
- `progress` (Number)
- `tasks` (Number)
- `createdAt` (String, ISO date)
- `updatedAt` (String, ISO date)

#### Tasks Table
- `id` (String, Primary Key)
- `title` (String)
- `description` (String)
- `status` (String: todo, in-progress, completed)
- `priority` (String: low, medium, high)
- `assignee` (String)
- `dueDate` (String, ISO date)
- `projectId` (String, GSI)
- `createdBy` (String)
- `createdAt` (String, ISO date)
- `updatedAt` (String, ISO date)

#### Security Events Table
- `id` (String, Primary Key)
- `userId` (String, GSI)
- `type` (String: login, logout, failed_login, password_change, etc.)
- `severity` (String: low, medium, high, critical)
- `description` (String)
- `ipAddress` (String)
- `userAgent` (String)
- `timestamp` (String, ISO date)

### Security Features

1. **Zero Trust Architecture**
   - Every request is authenticated and authorized
   - Role-based access control (RBAC)
   - Multi-factor authentication support

2. **Audit Logging**
   - All user actions are logged
   - Security events are tracked
   - Compliance reporting

3. **Threat Detection**
   - Failed login attempt monitoring
   - Suspicious activity detection
   - Real-time security alerts

4. **Data Protection**
   - Encryption at rest and in transit
   - Secure file storage
   - Input validation and sanitization

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

#### Projects
- `GET /api/projects` - Get user's projects
- `GET /api/projects/:id` - Get specific project
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

#### Tasks
- `GET /api/tasks/project/:projectId` - Get project tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

#### Security
- `GET /api/security/events` - Get security events
- `GET /api/security/dashboard` - Get security dashboard
- `POST /api/security/incident` - Report security incident
- `GET /api/security/recommendations` - Get security recommendations

### WebSocket Events

#### Client to Server
- `authenticate` - Authenticate user
- `join_project` - Join project room
- `leave_project` - Leave project room
- `task_update` - Update task
- `project_update` - Update project
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `file_shared` - File sharing notification
- `security_alert` - Security alert

#### Server to Client
- `authenticated` - Authentication success
- `joined_project` - Joined project room
- `left_project` - Left project room
- `task_updated` - Task was updated
- `project_updated` - Project was updated
- `user_typing` - User typing indicator
- `file_shared` - File sharing notification
- `security_alert` - Security alert
- `system_notification` - System notification

### Development

#### Backend Development
```bash
cd backend
npm run dev
```

#### Frontend Development
```bash
cd frontend
npm run dev
```

#### Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Deployment

#### Production Deployment
```bash
# Deploy infrastructure
./aws/scripts/deploy.sh prod us-east-1

# Build and deploy frontend
cd frontend
npm run build
# Upload to S3 bucket

# Deploy backend
cd backend
# Deploy to Lambda or ECS
```

### Monitoring

#### CloudWatch Logs
- Application logs: `/aws/lambda/secure-project-management`
- Security logs: `/aws/lambda/secure-project-management-security`
- Audit logs: `/aws/lambda/secure-project-management-audit`

#### Metrics
- API Gateway metrics
- Lambda metrics
- DynamoDB metrics
- CloudFront metrics

### Troubleshooting

#### Common Issues

1. **AWS Credentials Not Found**
   ```bash
   aws configure
   ```

2. **DynamoDB Tables Not Created**
   ```bash
   aws dynamodb list-tables
   ```

3. **CORS Issues**
   - Check CORS_ORIGIN in backend/.env
   - Ensure frontend URL is correct

4. **WebSocket Connection Failed**
   - Check WebSocket URL in frontend
   - Ensure WebSocket server is running

#### Logs
```bash
# Backend logs
cd backend
npm run dev

# AWS CloudWatch logs
aws logs describe-log-groups
aws logs get-log-events --log-group-name /aws/lambda/secure-project-management
```

### Security Best Practices

1. **Environment Variables**
   - Never commit .env files
   - Use AWS Secrets Manager for production
   - Rotate credentials regularly

2. **Database Security**
   - Enable encryption at rest
   - Use IAM roles for access
   - Monitor access patterns

3. **API Security**
   - Use HTTPS everywhere
   - Implement rate limiting
   - Validate all inputs

4. **File Storage**
   - Use signed URLs for file access
   - Implement virus scanning
   - Set appropriate permissions

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### License

MIT License - see LICENSE file for details
