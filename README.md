# Secure Project Management Tool

A full-stack project management platform built with React, Node.js, and AWS services, featuring zero trust security architecture.

## Features

- **Project Management**: Create and manage projects, tasks, and teams
- **Real-time Collaboration**: Live updates and team collaboration
- **Zero Trust Security**: Enterprise-grade security with audit logging
- **File Sharing**: Secure file upload and sharing
- **User Management**: Role-based access control
- **Threat Detection**: AI-powered security monitoring

## Tech Stack

### Frontend
- React 18
- Next.js 14
- Tailwind CSS
- Socket.io Client

### Backend
- Node.js
- Express.js
- Socket.io
- JWT Authentication

### AWS Services
- S3 (File Storage)
- Lambda (Serverless Functions)
- API Gateway (API Management)
- DynamoDB (Database)
- Cognito (Authentication)
- CloudFront (CDN)
- GuardDuty (Threat Detection)
- CloudTrail (Audit Logging)

## Getting Started

### Prerequisites
- Node.js 18+
- Git
- npm or yarn

### Quick Start (Local Development)

1. **Clone the repository**
```bash
git clone <repository-url>
cd secure-project-management
```

2. **Install dependencies**
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

3. **Start the backend server**
```bash
cd backend
node src/simple-server.js
```
The backend will start on `http://localhost:3001`

4. **Start the frontend (in a new terminal)**
```bash
cd frontend
npm run dev
```
The frontend will start on `http://localhost:3000`

5. **Open your browser**
Go to `http://localhost:3000` to see the application!

### Testing the Application

1. **Register a new account** on the login page
2. **Login** with your credentials
3. **Create a project** and start adding tasks
4. **Test the API endpoints** using the backend

### API Testing

Test the backend API directly:
```bash
# Health check
curl http://localhost:3001/health

# Register a user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### AWS Deployment (Optional)

For production deployment with AWS services:

1. **Configure AWS credentials**
```bash
aws configure
```

2. **Deploy infrastructure**
```bash
cd aws/scripts
./deploy.sh dev us-east-1
```

3. **Set up environment variables**
```bash
cd backend
cp env.example .env
# Edit .env with your AWS credentials and settings
```

4. **Start with full AWS integration**
```bash
cd backend
npm run dev
```

## Project Structure

```
secure-project-management/
├── frontend/                 # React frontend
│   ├── components/          # React components
│   ├── pages/              # Next.js pages
│   ├── hooks/              # Custom hooks
│   ├── utils/              # Utility functions
│   └── styles/             # CSS styles
├── backend/                # Node.js backend
│   ├── controllers/         # Route controllers
│   ├── middleware/         # Express middleware
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── utils/             # Utility functions
├── aws/                   # AWS infrastructure
│   ├── lambda/           # Lambda functions
│   ├── cloudformation/    # Infrastructure as code
│   └── scripts/          # Deployment scripts
└── docs/                 # Documentation
```

## Security Features

- **Zero Trust Architecture**: Every access request is verified
- **Multi-Factor Authentication**: Required for all users
- **Role-Based Access Control**: Granular permissions
- **Audit Logging**: Complete activity tracking
- **Threat Detection**: AI-powered security monitoring
- **Data Encryption**: End-to-end encryption

## Deployment

The application is designed to be deployed on AWS using:
- S3 for frontend hosting
- Lambda for backend functions
- DynamoDB for data storage
- CloudFront for CDN
- Route 53 for DNS

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

