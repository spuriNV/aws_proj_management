#!/bin/bash

# Deploy script for Secure Project Management Infrastructure
# Usage: ./deploy.sh [environment] [region]

set -e

# Default values
ENVIRONMENT=${1:-dev}
REGION=${2:-us-east-1}
STACK_NAME="secure-project-management-${ENVIRONMENT}"
TEMPLATE_FILE="aws/cloudformation/infrastructure.yaml"

echo "🚀 Deploying Secure Project Management Infrastructure"
echo "Environment: ${ENVIRONMENT}"
echo "Region: ${REGION}"
echo "Stack Name: ${STACK_NAME}"
echo "Template: ${TEMPLATE_FILE}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

# Create S3 bucket for CloudFormation templates if it doesn't exist
BUCKET_NAME="secure-project-management-cf-templates-${ENVIRONMENT}"
echo "📦 Checking S3 bucket for CloudFormation templates..."

if ! aws s3 ls "s3://${BUCKET_NAME}" &> /dev/null; then
    echo "Creating S3 bucket: ${BUCKET_NAME}"
    aws s3 mb "s3://${BUCKET_NAME}" --region "${REGION}"
else
    echo "S3 bucket already exists: ${BUCKET_NAME}"
fi

# Upload CloudFormation template to S3
echo "📤 Uploading CloudFormation template to S3..."
aws s3 cp "${TEMPLATE_FILE}" "s3://${BUCKET_NAME}/infrastructure.yaml"

# Deploy CloudFormation stack
echo "🏗️  Deploying CloudFormation stack..."
aws cloudformation deploy \
    --template-file "${TEMPLATE_FILE}" \
    --stack-name "${STACK_NAME}" \
    --parameter-overrides \
        Environment="${ENVIRONMENT}" \
        ProjectName="secure-project-management" \
    --capabilities CAPABILITY_IAM \
    --region "${REGION}"

# Get stack outputs
echo "📋 Getting stack outputs..."
aws cloudformation describe-stacks \
    --stack-name "${STACK_NAME}" \
    --region "${REGION}" \
    --query 'Stacks[0].Outputs' \
    --output table

echo "✅ Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Configure your environment variables in backend/.env"
echo "2. Install dependencies: cd backend && npm install"
echo "3. Start the backend server: npm run dev"
echo "4. Install frontend dependencies: cd frontend && npm install"
echo "5. Start the frontend: npm run dev"
echo ""
echo "Stack outputs are available in the AWS Console:"
echo "https://console.aws.amazon.com/cloudformation/home?region=${REGION}#/stacks"
